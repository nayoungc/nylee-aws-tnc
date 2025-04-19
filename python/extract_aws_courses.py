import boto3
import re
import json
import uuid
import os
import docx
from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any, Optional
from datetime import datetime
import time
from botocore.exceptions import ClientError
from tqdm import tqdm  # VS Code 콘솔 환경에 적합한 표준 tqdm 사용

# 데이터 클래스 정의
@dataclass
class Module:
    title: str
    topics: List[str] = field(default_factory=list)

@dataclass
class Lab:
    title: str
    description: str = ""

@dataclass
class Course:
    title: str
    description: str = ""
    level: str = ""
    delivery_method: str = ""
    duration: str = ""
    objectives: List[str] = field(default_factory=list)
    audience: List[str] = field(default_factory=list)
    prerequisites: List[str] = field(default_factory=list)
    registration_link: str = ""
    modules: List[Module] = field(default_factory=list)
    labs: List[Lab] = field(default_factory=list)

def analyze_document_structure(doc_path):
    """문서 구조를 분석하여 패턴 파악"""
    doc = docx.Document(doc_path)
    print(f"문서 분석 - 총 {len(doc.paragraphs)} 단락")
    
    # 주요 구조 패턴 찾기
    patterns = {
        "과정 설명": 0,
        "레벨": 0,
        "제공 방법": 0,
        "소요 시간": 0,
        "과정 목표": 0,
        "수강 대상": 0,
        "수강 전 권장 사항": 0,
        "등록": 0,
        "과정 개요": 0
    }
    
    # 단락 내용 분석
    for i, para in enumerate(doc.paragraphs[:min(500, len(doc.paragraphs))]):
        text = para.text.strip()
        for pattern in patterns:
            if text == pattern:
                patterns[pattern] += 1
                print(f"발견: '{pattern}' at 단락 {i}")
                
                # 다음 5개 단락 확인
                context = []
                for j in range(1, 6):
                    if i+j < len(doc.paragraphs):
                        next_text = doc.paragraphs[i+j].text.strip()
                        if next_text:
                            context.append(next_text)
                print(f"  다음 내용: {context[:3]}...")
    
    print("\n주요 패턴 발견 횟수:")
    for pattern, count in patterns.items():
        print(f"  '{pattern}': {count}회")
    
    # 목차 또는 구조가 있는지 확인
    print("\n문서 처음 20줄:")
    for i, para in enumerate(doc.paragraphs[:20]):
        if para.text.strip():
            print(f"{i:3d}: {para.text}")
    
    return patterns

def direct_extract_courses_from_docx(file_path):
    """docx 파일에서 직접 과정 정보 추출 - 완전히 개선된 버전"""
    doc = docx.Document(file_path)
    
    # 1. 목차에서 과정 제목 추출 (문서 처음 30줄 분석)
    course_titles = []
    for i, para in enumerate(doc.paragraphs[:50]):
        text = para.text.strip()
        if not text:
            continue
            
        # 목차 형태의 제목 (숫자 페이지 포함)
        match = re.match(r'^(.*?)\s+\d+\$', text)
        if match and not text.startswith("Instructor") and not text.startswith("Digital"):
            title = match.group(1).strip()
            if len(title) > 5 and title not in course_titles:
                course_titles.append(title)
    
    print(f"목차에서 {len(course_titles)}개 과정 제목 추출됨")
    if course_titles:
        print(f"예시: {course_titles[:3]}")
    
    # 2. 모든 섹션과 해당 내용 탐색
    sections = []
    current_section = None
    current_content = []
    
    for i, para in enumerate(tqdm(doc.paragraphs, desc="문서 구조 분석", ncols=100)):
        text = para.text.strip()
        if not text:
            continue
        
        # 섹션 헤더인지 확인
        is_section_header = text in ["과정 설명", "레벨", "제공 방법", "소요 시간", 
                                    "과정 목표", "수강 대상", "수강 전 권장 사항", 
                                    "등록", "과정 개요", "코스 개요", "다루는 내용"]
        
        # 섹션 전환 처리
        if is_section_header:
            # 이전 섹션 저장
            if current_section:
                sections.append((current_section, current_content))
            
            # 새 섹션 시작
            current_section = text
            current_content = []
        # 현재 섹션에 내용 추가
        elif current_section:
            current_content.append(text)
    
    # 마지막 섹션 추가
    if current_section and current_content:
        sections.append((current_section, current_content))
    
    print(f"{len(sections)}개 섹션 블록 식별됨")
    
    # 3. 과정 정보 구성
    courses = []
    current_course = None
    registration_urls = set()  # 중복 등록 URL 체크용
    
    # 등록 URL 패턴
    url_pattern = re.compile(r'www\.aws\.training|https?://\S+')
    
    # 과정 제목이 있는지 확인하는 함수
    def find_course_title(text):
        for title in course_titles:
            if title in text:
                return title
        return None
    
    # 섹션 블록 순회
    for i, (section_name, content) in enumerate(sections):
        # 등록 섹션에서 URL 추출
        if section_name == "등록" and content:
            url = None
            for line in content:
                if url_pattern.search(line):
                    url = line.strip()
                    break
            
            if url and url not in registration_urls:
                registration_urls.add(url)
                
                # 다음 블록이 "과정 설명"인지 확인
                if i < len(sections) - 1 and sections[i+1][0] == "과정 설명":
                    # 여기서 새로운 과정 시작
                    if current_course:
                        courses.append(current_course)
                    
                    # 과정 제목 추정 - 인접 과정 설명 섹션 내용 첫 줄에서 검색
                    next_content = sections[i+1][1]
                    title = None
                    
                    # 목차에서 추출한 제목 중에서 검색
                    for line in next_content[:3]:  # 처음 몇 줄만 확인
                        title = find_course_title(line)
                        if title:
                            break
                    
                    # 제목을 찾지 못했다면 변통하여 설정
                    if not title:
                        # 이전 블록이 있는지 확인하고 그 내용 사용
                        if i > 0 and sections[i-1][1]:
                            potential_title = sections[i-1][1][-1].strip()
                            if len(potential_title) > 5 and potential_title not in ["등록", "과정 설명", "과정 목표"]:
                                title = potential_title
                        
                        # 그래도 없으면 다음 설명 첫줄 사용
                        if not title and next_content:
                            title = next_content[0]
                    
                    current_course = Course(
                        title=title or "제목 없음",
                        registration_link=url
                    )
        
        # 기존 과정 정보 업데이트
        elif current_course:
            if section_name == "과정 설명" and content:
                current_course.description = " ".join(content)
            
            elif section_name == "레벨" and content:
                current_course.level = content[0]
                
            elif section_name == "제공 방법" and content:
                current_course.delivery_method = content[0]
                
            elif section_name == "소요 시간" and content:
                current_course.duration = content[0]
                
            elif section_name == "과정 목표" and content:
                # 글머리 기호로 시작하는 항목만 추출
                for line in content:
                    if line.startswith("·") or line.startswith("•") or line.startswith("-"):
                        current_course.objectives.append(line.lstrip("·•- "))
            
            elif section_name == "수강 대상" and content:
                for line in content:
                    if line.startswith("·") or line.startswith("•") or line.startswith("-"):
                        current_course.audience.append(line.lstrip("·•- "))
            
            elif section_name == "수강 전 권장 사항" and content:
                for line in content:
                    if line.startswith("·") or line.startswith("•") or line.startswith("-"):
                        current_course.prerequisites.append(line.lstrip("·•- "))
            
            # 모듈 및 실습 정보 추출 (여러 섹션명 지원)
            elif section_name in ["과정 개요", "코스 개요", "다루는 내용"] and content:
                current_module = None
                current_lab = None
                
                for line in content:
                    # 새 모듈 시작
                    module_match = re.search(r'모듈\s+(\d+)[:\s]*(.+)', line)
                    day_match = re.search(r'(\d+)\s*일\s*차[:\s]*(.+)', line)
                    
                    if module_match:
                        module_num = module_match.group(1)
                        module_title = module_match.group(2).strip()
                        current_module = Module(title=f"모듈 {module_num}: {module_title}")
                        current_course.modules.append(current_module)
                        current_lab = None
                        
                    elif day_match:
                        day_num = day_match.group(1)
                        day_title = day_match.group(2).strip() if day_match.group(2) else f"{day_num}일차"
                        current_module = Module(title=f"{day_num}일차: {day_title}")
                        current_course.modules.append(current_module)
                        current_lab = None
                    
                    # 새 실습 시작
                    elif "실습" in line:
                        lab_match = re.search(r'실습\s*(\d+)[:\s]*(.+)', line)
                        if lab_match:
                            lab_num = lab_match.group(1)
                            lab_title = lab_match.group(2).strip()
                            current_lab = Lab(title=f"실습 {lab_num}: {lab_title}")
                            current_course.labs.append(current_lab)
                    
                    # 글머리 기호로 시작하는 항목은 현재 모듈이나 실습의 세부 내용
                    elif (line.startswith("·") or line.startswith("•") or line.startswith("-")) and current_module:
                        clean_line = line.lstrip("·•- ")
                        current_module.topics.append(clean_line)
                    
                    # 다른 텍스트는 현재 실습 설명에 추가
                    elif current_lab and not current_lab.description:
                        if not line.startswith("모듈") and not "일차" in line:
                            current_lab.description = line
    
    # 마지막 과정 추가
    if current_course:
        courses.append(current_course)
    
    # 4. 추가적인 분석 시도 - 목차에서 추출한 제목으로 누락된 과정 보완
    if len(courses) < len(course_titles) // 2:  # 절반 이상 누락된 경우
        print(f"위 방법으로 {len(courses)}개 과정만 식별됨. 다른 방법 시도...")
        
        # 과정 설명 섹션 시작 부분을 찾아서 과정 그룹화
        course_blocks = []
        current_block = []
        
        for i, para in enumerate(doc.paragraphs):
            text = para.text.strip()
            if not text:
                continue
                
            if text == "과정 설명":
                if current_block:
                    course_blocks.append(current_block)
                current_block = [text]
            elif current_block:
                current_block.append(text)
                
        # 마지막 블록 추가
        if current_block:
            course_blocks.append(current_block)
        
        print(f"{len(course_blocks)}개 과정 블록 식별됨")
        
        # 각 블록에서 과정 정보 추출
        for block in course_blocks:
            # 이미 등록된 과정인지 확인
            url = None
            for i, text in enumerate(block):
                if url_pattern.search(text):
                    url = text
                    break
            
            if url and url in registration_urls:
                continue  # 이미 처리된 과정
                
            # 과정 제목 찾기
            title = None
            for title_candidate in course_titles:
                if any(title_candidate in text for text in block[:20]):  # 처음 20줄 확인
                    title = title_candidate
                    break
            
            if not title and len(block) > 1:
                # 제목을 찾지 못했다면 두 번째 줄 사용 (첫 줄은 "과정 설명")
                title = block[1] if len(block[1]) > 5 else "제목 없음"
            
            if not title:
                continue
                
            # 새 과정 생성
            course = Course(title=title, registration_link=url or "")
            
            # 블록에서 정보 추출
            section = None
            section_content = []
            
            for line in block:
                # 섹션 전환 감지
                if line in ["과정 설명", "레벨", "제공 방법", "소요 시간", 
                           "과정 목표", "수강 대상", "수강 전 권장 사항", 
                           "등록", "과정 개요", "코스 개요", "다루는 내용"]:
                    # 이전 섹션 처리
                    if section == "과정 설명" and section_content:
                        course.description = " ".join(section_content)
                    elif section == "레벨" and section_content:
                        course.level = section_content[0]
                    elif section == "제공 방법" and section_content:
                        course.delivery_method = section_content[0]
                    elif section == "소요 시간" and section_content:
                        course.duration = section_content[0]
                    
                    # 새 섹션 시작
                    section = line
                    section_content = []
                else:
                    section_content.append(line)
            
            # 마지막 섹션 처리
            if section == "과정 설명" and section_content:
                course.description = " ".join(section_content)
            
            # 최소한의 정보가 있는 과정만 추가
            if course.title and (course.description or course.registration_link):
                courses.append(course)
    
    # 5. 결과 정리 - 중복 제거 및 내용 정리
    unique_courses = []
    seen_titles = set()
    
    for course in courses:
        # 중복 제거
        if course.title in seen_titles:
            continue
        
        # 제목 정리
        if course.title.strip().startswith("www.") or course.title.strip().startswith("http"):
            continue  # URL이 제목인 경우 제외
        
        # 내용 정리
        if not course.description:
            course.description = "설명 없음"
        if not course.level:
            course.level = "미지정"
        if not course.delivery_method:
            course.delivery_method = "미지정"
        if not course.duration:
            course.duration = "미지정"
        
        unique_courses.append(course)
        seen_titles.add(course.title)
    
    # 최종 결과 출력
    print(f"\n추출된 과정 정보: {len(unique_courses)}개 과정")
    print("\n과정별 모듈 및 실습 현황:")
    for i, course in enumerate(unique_courses[:min(5, len(unique_courses))]):
        print(f"{i+1}. {course.title}")
        print(f"   - 모듈: {len(course.modules)}개")
        print(f"   - 실습: {len(course.labs)}개")
        
        # 모듈 정보 출력
        if course.modules:
            print(f"   - 모듈 예시: {course.modules[0].title}")
            if course.modules[0].topics:
                print(f"      * 주제: {course.modules[0].topics[0]}")
        
        # 실습 정보 출력
        if course.labs:
            print(f"   - 실습 예시: {course.labs[0].title}")
    
    if len(unique_courses) > 5:
        print(f"   ... 외 {len(unique_courses) - 5}개 과정")
    
    # 디버그 정보 저장
    with open('extracted_courses_debug.json', 'w', encoding='utf-8') as f:
        json.dump([asdict(course) for course in unique_courses], f, ensure_ascii=False, indent=2)
    
    return unique_courses

def extract_modules_from_raw_text(course, course_content):
    """문서 내용을 분석하여 모듈 및 실습 정보 추출"""
    # 모듈 패턴 (여러 형태 지원)
    module_patterns = [
        re.compile(r'모듈\s+(\d+)\s*[:：]?\s*(.+?)(?=\s*모듈\s+\d+|\$)', re.DOTALL),
        re.compile(r'(\d+)\s*일\s*차\s*[:：]?\s*(.+?)(?=\s*\d+\s*일\s*차|\$)', re.DOTALL),
        re.compile(r'(\w+)\s+모듈\s*[:：]?\s*(.+?)(?=\s*\w+\s+모듈|\$)', re.DOTALL)
    ]
    
    # 실습 패턴
    lab_pattern = re.compile(r'실습\s+(\d+)\s*[:：]?\s*(.+?)(?=\s*실습\s+\d+|\$)', re.DOTALL)
    
    # 텍스트 전체를 하나의 문자열로 결합
    text = " ".join(course_content)
    
    # 모듈 추출
    for pattern in module_patterns:
        matches = pattern.findall(text)
        if matches:
            for num, content in matches:
                module_title = f"모듈 {num}" if num.isdigit() else f"{num} 모듈"
                module = Module(title=module_title)
                
                # 모듈 주제 추출
                topics = re.findall(r'[•·-]\s*(.+?)(?=[•·-]|\n|\$)', content)
                if topics:
                    module.topics = [t.strip() for t in topics]
                else:
                    # 줄바꿈으로 주제 구분 시도
                    lines = [line.strip() for line in content.split('\n') if line.strip()]
                    if lines:
                        module.topics = lines
                
                course.modules.append(module)
    
    # 실습 추출
    lab_matches = lab_pattern.findall(text)
    for num, content in lab_matches:
        lab = Lab(title=f"실습 {num}", description=content.strip())
        course.labs.append(lab)
    
    return course

def wait_with_progress(check_function, max_attempts=30, delay=2, desc="작업 진행 중"):
    """진행률 표시줄과 함께 작업이 완료될 때까지 대기"""
    for i in tqdm(range(max_attempts), desc=desc, ncols=100):
        if check_function():
            return True
        time.sleep(delay)
    return False

def delete_table_if_exists(table_name: str, region: str = 'ap-northeast-2'):
    """테이블이 존재하면 삭제"""
    dynamodb = boto3.client('dynamodb', region_name=region)
    
    try:
        dynamodb.describe_table(TableName=table_name)
        print(f"테이블 '{table_name}'이 존재합니다. 삭제 중...")
        dynamodb.delete_table(TableName=table_name)
        
        # 테이블 삭제가 완료될 때까지 대기
        def check_table_deleted():
            try:
                dynamodb.describe_table(TableName=table_name)
                return False
            except ClientError as e:
                if e.response['Error']['Code'] == 'ResourceNotFoundException':
                    return True
                raise e
        
        if wait_with_progress(check_table_deleted, desc="테이블 삭제 대기"):
            print(f"테이블 '{table_name}' 삭제 완료")
        else:
            print(f"테이블 '{table_name}' 삭제 대기 시간 초과")
        
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceNotFoundException':
            print(f"테이블 '{table_name}'이 존재하지 않습니다.")
        else:
            raise e

def create_table_with_indexes(table_name: str, region: str = 'ap-northeast-2'):
    """GSI와 LSI를 포함한 새 테이블 생성"""
    dynamodb = boto3.client('dynamodb', region_name=region)
    
    try:
        print(f"테이블 '{table_name}' 생성 중...")
        response = dynamodb.create_table(
            TableName=table_name,
            KeySchema=[
                {'AttributeName': 'PK', 'KeyType': 'HASH'},
                {'AttributeName': 'SK', 'KeyType': 'RANGE'}
            ],
            AttributeDefinitions=[
                {'AttributeName': 'PK', 'AttributeType': 'S'},
                {'AttributeName': 'SK', 'AttributeType': 'S'},
                {'AttributeName': 'type', 'AttributeType': 'S'},
                {'AttributeName': 'level', 'AttributeType': 'S'},
                {'AttributeName': 'deliveryMethod', 'AttributeType': 'S'},
                {'AttributeName': 'duration', 'AttributeType': 'S'},
                {'AttributeName': 'title', 'AttributeType': 'S'},
                {'AttributeName': 'moduleOrder', 'AttributeType': 'N'},
                {'AttributeName': 'labOrder', 'AttributeType': 'N'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'TypeIndex',
                    'KeySchema': [
                        {'AttributeName': 'type', 'KeyType': 'HASH'},
                        {'AttributeName': 'title', 'KeyType': 'RANGE'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'},
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                },
                {
                    'IndexName': 'LevelIndex',
                    'KeySchema': [
                        {'AttributeName': 'level', 'KeyType': 'HASH'},
                        {'AttributeName': 'title', 'KeyType': 'RANGE'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'},
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                },
                {
                    'IndexName': 'DeliveryMethodIndex',
                    'KeySchema': [
                        {'AttributeName': 'deliveryMethod', 'KeyType': 'HASH'},
                        {'AttributeName': 'title', 'KeyType': 'RANGE'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'},
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                },
                {
                    'IndexName': 'DurationIndex',
                    'KeySchema': [
                        {'AttributeName': 'duration', 'KeyType': 'HASH'},
                        {'AttributeName': 'title', 'KeyType': 'RANGE'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'},
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                }
            ],
            LocalSecondaryIndexes=[
                {
                    'IndexName': 'ModuleOrderIndex',
                    'KeySchema': [
                        {'AttributeName': 'PK', 'KeyType': 'HASH'},
                        {'AttributeName': 'moduleOrder', 'KeyType': 'RANGE'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'}
                },
                {
                    'IndexName': 'LabOrderIndex',
                    'KeySchema': [
                        {'AttributeName': 'PK', 'KeyType': 'HASH'},
                        {'AttributeName': 'labOrder', 'KeyType': 'RANGE'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'}
                }
            ],
            ProvisionedThroughput={
                'ReadCapacityUnits': 5,
                'WriteCapacityUnits': 5
            }
        )
        
        # 테이블 생성이 완료될 때까지 대기
        def check_table_active():
            try:
                response = dynamodb.describe_table(TableName=table_name)
                return response['Table']['TableStatus'] == 'ACTIVE'
            except:
                return False
                
        if wait_with_progress(check_table_active, desc="테이블 생성 대기"):
            print(f"테이블 '{table_name}' 생성 완료 (GSI 및 LSI 포함)")
            return True
        else:
            print(f"테이블 '{table_name}' 생성 대기 시간 초과")
            return False
            
    except Exception as e:
        print(f"테이블 생성 중 오류 발생: {str(e)}")
        return False

def save_courses_to_dynamodb(courses: List[Course], table_name: str, region: str = 'ap-northeast-2'):
    """과정 데이터를 DynamoDB에 저장 - 개선된 버전"""
    dynamodb = boto3.resource('dynamodb', region_name=region)
    table = dynamodb.Table(table_name)
    timestamp = datetime.now().isoformat()
    
    if not courses:
        print("저장할 과정 데이터가 없습니다!")
        return
    
    print(f"DynamoDB 테이블 '{table_name}'에 {len(courses)}개 과정 저장 준비 중...")
    
    # 1. 모든 항목 준비
    all_items = []
    for course in tqdm(courses, desc="과정 데이터 준비", ncols=100):
        if not course.title:
            continue
            
        course_id = str(uuid.uuid4())
        
        # 기본 정보 설정 - null 항목이 없도록 기본값 지정
        course_item = {
            'PK': f"COURSE#{course_id}",
            'SK': f"METADATA#{course_id}",
            'id': course_id,
            'title': course.title,
            'description': course.description if course.description else "",
            'level': course.level if course.level else "미지정",
            'deliveryMethod': course.delivery_method if course.delivery_method else "미지정",
            'duration': course.duration if course.duration else "미지정",
            'registrationLink': course.registration_link if course.registration_link else "",
            'type': 'Course',
            'createdAt': timestamp,
            'updatedAt': timestamp
        }
        
        # 목록 필드 추가
        if course.objectives:
            course_item['objectives'] = course.objectives
        else:
            course_item['objectives'] = []
            
        if course.audience:
            course_item['audience'] = course.audience
        else:
            course_item['audience'] = []
            
        if course.prerequisites:
            course_item['prerequisites'] = course.prerequisites
        else:
            course_item['prerequisites'] = []
            
        all_items.append(course_item)
        
        # 모듈 항목
        for idx, module in enumerate(course.modules):
            module_id = f"{course_id}#MODULE#{idx:03d}"
            module_item = {
                'PK': f"COURSE#{course_id}",
                'SK': f"MODULE#{idx:03d}",
                'id': module_id,
                'title': module.title,
                'topics': module.topics if module.topics else [],
                'moduleOrder': idx,
                'type': 'Module',
                'courseId': course_id,
                'createdAt': timestamp,
                'updatedAt': timestamp
            }
            all_items.append(module_item)
        
        # 실습 항목
        for idx, lab in enumerate(course.labs):
            lab_id = f"{course_id}#LAB#{idx:03d}"
            lab_item = {
                'PK': f"COURSE#{course_id}",
                'SK': f"LAB#{idx:03d}",
                'id': lab_id,
                'title': lab.title,
                'description': lab.description if lab.description else "",
                'labOrder': idx,
                'type': 'Lab',
                'courseId': course_id,
                'createdAt': timestamp,
                'updatedAt': timestamp
            }
            all_items.append(lab_item)
    
    # 2. 배치 처리로 저장
    batch_size = 25  # DynamoDB 배치 쓰기 제한
    success_count = 0
    error_count = 0
    
    print(f"DynamoDB에 총 {len(all_items)}개 항목을 {(len(all_items) + batch_size - 1) // batch_size}개 배치로 저장합니다.")
    
    for i in tqdm(range(0, len(all_items), batch_size), desc="DynamoDB에 데이터 저장", ncols=100):
        batch = all_items[i:i+batch_size]
        retry_count = 0
        max_retries = 3
        
        while retry_count <= max_retries:
            try:
                with table.batch_writer() as writer:
                    for item in batch:
                        writer.put_item(Item=item)
                success_count += len(batch)
                break  # 성공하면 루프를 빠져나감
                
            except Exception as e:
                retry_count += 1
                if retry_count > max_retries:
                    print(f"배치 {i//batch_size+1} 저장 실패: {str(e)}")
                    error_count += len(batch)
                    break
                    
                print(f"배치 {i//batch_size+1} 오류, {retry_count}번째 재시도: {str(e)}")
                time.sleep(2)  # 잠시 대기 후 재시도
    
    # 3. 결과 검증 및 보고
    try:
        scan_result = table.scan(Select='COUNT')
        item_count = scan_result['Count']
        print(f"\nDynamoDB 저장 결과:")
        print(f"- 시도한 총 항목 수: {len(all_items)}")
        print(f"- 성공적으로 저장된 항목 수: {success_count}")
        print(f"- 실패한 항목 수: {error_count}")
        print(f"- 테이블의 총 항목 수: {item_count}")
    except Exception as e:
        print(f"결과 검증 중 오류: {str(e)}")
        
    return success_count
  
def main():
    # 설정값
    TABLE_NAME = 'Tnc-CourseCatalog'
    REGION = 'us-east-1'
    DOC_FILE = 'AWS TnC_ILT_DILT.docx'
    
    try:
        # 필요한 라이브러리 설치 확인
        import importlib
        missing_libs = []
        for lib in ["tqdm", "docx"]:
            if importlib.util.find_spec(lib) is None:
                missing_libs.append(lib)
        
        if missing_libs:
            print(f"필요한 라이브러리 설치 중: {', '.join(missing_libs)}")
            import sys
            import subprocess
            if "tqdm" in missing_libs:
                subprocess.check_call([sys.executable, "-m", "pip", "install", "tqdm"])
            if "docx" in missing_libs:
                subprocess.check_call([sys.executable, "-m", "pip", "install", "python-docx"])
            print("라이브러리 설치 완료")
        
        # 파일 존재 확인
        if not os.path.exists(DOC_FILE):
            print(f"오류: 파일 '{DOC_FILE}'을 찾을 수 없습니다.")
            print(f"현재 디렉토리: {os.getcwd()}")
            print(f"디렉토리 내 파일: {os.listdir('.')}")
            return
        
        # 문서 구조 분석
        print(f"문서 '{DOC_FILE}' 구조 분석 중...")
        patterns = analyze_document_structure(DOC_FILE)
        
        # 테이블 삭제 및 재생성
        delete_table_if_exists(TABLE_NAME, REGION)
        if not create_table_with_indexes(TABLE_NAME, REGION):
            print("테이블 생성에 실패했습니다. 작업을 중단합니다.")
            return
        
        # 직접 문서에서 과정 정보 추출
        print(f"문서 '{DOC_FILE}'에서 과정 정보 직접 추출 중...")
        courses = direct_extract_courses_from_docx(DOC_FILE)
    
        if not courses:
            print("과정 정보를 추출하지 못했습니다. 작업을 중단합니다.")
            return
                
        print(f"{len(courses)}개의 과정 추출 완료")
    
        # 디버깅용 JSON 저장
        with open('extracted_courses.json', 'w', encoding='utf-8') as f:
            json.dump([asdict(course) for course in courses], f, ensure_ascii=False, indent=2)
            
        # 상세 정보 출력
        print("\n추출된 과정 요약 정보:")
        for i, course in enumerate(courses[:min(5, len(courses))]):
            print(f"\n{i+1}. {course.title}")
            print(f"   - 설명: {course.description[:100]}..." if len(course.description) > 100 else f"   - 설명: {course.description}")
            print(f"   - 레벨: {course.level}")
            print(f"   - 제공방법: {course.delivery_method}")
            print(f"   - 소요시간: {course.duration}")
            print(f"   - 목표: {len(course.objectives)}개")
            print(f"   - 대상: {len(course.audience)}개")
            print(f"   - 요구사항: {len(course.prerequisites)}개")
            print(f"   - 등록링크: {course.registration_link}")
            print(f"   - 모듈: {len(course.modules)}개")
            print(f"   - 실습: {len(course.labs)}개")
        
        # DynamoDB에 저장
        print("\nDynamoDB에 데이터 저장 중...")
        save_courses_to_dynamodb(courses, TABLE_NAME, REGION)
        print("모든 처리가 완료되었습니다.")
        
    except Exception as e:
        print(f"오류 발생: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
