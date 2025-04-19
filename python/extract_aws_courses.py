import boto3
import re
import json
import os
import docx
import random
import string
from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any, Optional
from datetime import datetime
import time
from botocore.exceptions import ClientError
from tqdm import tqdm

# 데이터 클래스 정의
@dataclass
class Module:
    title: str
    topics: List[str] = field(default_factory=list)
    order: int = 0

@dataclass
class Lab:
    title: str
    description: str = ""
    order: int = 0
    related_module: str = ""  # 실습이 속한 모듈 제목

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


def generate_short_id(length=8):
    """짧은 ID 생성 (현재 시간 + 랜덤 문자)"""
    timestamp = int(time.time() * 1000) % 1000000  # 현재 시간의 밀리초 부분
    random_chars = ''.join(random.choices(string.ascii_letters + string.digits, k=length-6))
    return f"{timestamp:06d}{random_chars}"


def clean_course_title(title):
    """과정 제목에서 페이지 번호 및 불필요한 공백 제거"""
    # 끝에 탭과 숫자가 있는 패턴 제거
    title = re.sub(r'\t+\d+\$', '', title)
    # 끝에 숫자만 있는 패턴 제거
    title = re.sub(r'\s+\d+\$', '', title)
    return title.strip()


def parse_course_titles(text):
    """제공된 과정명 목록에서 과정 제목만 추출 (페이지 번호 제외)"""
    lines = text.strip().split('\n')
    courses = []
    
    # 첫 번째 줄과 두 번째 줄은 헤더이므로 건너뜀
    for line in lines[2:]:
        if line.strip() and not line.startswith("Instuctor-led") and not line.startswith("Instructor-led"):
            clean_title = clean_course_title(line)
            if clean_title:
                courses.append(clean_title)
    
    return courses


def wait_with_progress(check_function, max_attempts=30, delay=2, desc="작업 진행 중"):
    """진행률 표시줄과 함께 작업이 완료될 때까지 대기"""
    for i in tqdm(range(max_attempts), desc=desc, ncols=100):
        if check_function():
            return True
        time.sleep(delay)
    return False


def delete_table_if_exists(table_name: str, region: str = 'us-east-1'):
    """테이블이 존재하면 삭제"""
    dynamodb = boto3.client('dynamodb', region_name=region)
    
    try:
        dynamodb.describe_table(TableName=table_name)
        print(f"테이블 '{table_name}'이 존재합니다. 삭제 중...")
        dynamodb.delete_table(TableName=table_name)
        
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


def create_course_catalog_table(table_name: str, region: str = 'us-east-1'):
    """과정 카탈로그 테이블 생성"""
    dynamodb = boto3.client('dynamodb', region_name=region)
    
    try:
        print(f"테이블 '{table_name}' 생성 중...")
        response = dynamodb.create_table(
            TableName=table_name,
            KeySchema=[
                {'AttributeName': 'id', 'KeyType': 'HASH'}
            ],
            AttributeDefinitions=[
                {'AttributeName': 'id', 'AttributeType': 'S'},
                {'AttributeName': 'title', 'AttributeType': 'S'},
                {'AttributeName': 'level', 'AttributeType': 'S'},
                {'AttributeName': 'duration', 'AttributeType': 'S'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'TitleIndex',
                    'KeySchema': [
                        {'AttributeName': 'title', 'KeyType': 'HASH'}
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
                        {'AttributeName': 'level', 'KeyType': 'HASH'}
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
                        {'AttributeName': 'duration', 'KeyType': 'HASH'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'},
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                }
            ],
            ProvisionedThroughput={
                'ReadCapacityUnits': 5,
                'WriteCapacityUnits': 5
            }
        )
        
        def check_table_active():
            try:
                response = dynamodb.describe_table(TableName=table_name)
                return response['Table']['TableStatus'] == 'ACTIVE'
            except:
                return False
                
        if wait_with_progress(check_table_active, desc="테이블 생성 대기"):
            print(f"테이블 '{table_name}' 생성 완료")
            return True
        else:
            print(f"테이블 '{table_name}' 생성 대기 시간 초과")
            return False
            
    except Exception as e:
        print(f"테이블 생성 중 오류 발생: {str(e)}")
        return False


def create_modules_table(table_name: str, region: str = 'us-east-1'):
    """모듈 및 실습 정보 테이블 생성"""
    dynamodb = boto3.client('dynamodb', region_name=region)
    
    try:
        print(f"테이블 '{table_name}' 생성 중...")
        response = dynamodb.create_table(
            TableName=table_name,
            KeySchema=[
                {'AttributeName': 'courseId', 'KeyType': 'HASH'},
                {'AttributeName': 'id', 'KeyType': 'RANGE'}
            ],
            AttributeDefinitions=[
                {'AttributeName': 'courseId', 'AttributeType': 'S'},
                {'AttributeName': 'id', 'AttributeType': 'S'},
                {'AttributeName': 'type', 'AttributeType': 'S'},
                {'AttributeName': 'order', 'AttributeType': 'N'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'TypeIndex',
                    'KeySchema': [
                        {'AttributeName': 'type', 'KeyType': 'HASH'},
                        {'AttributeName': 'courseId', 'KeyType': 'RANGE'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'},
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                },
                {
                    'IndexName': 'OrderIndex',
                    'KeySchema': [
                        {'AttributeName': 'courseId', 'KeyType': 'HASH'},
                        {'AttributeName': 'order', 'KeyType': 'RANGE'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'},
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                }
            ],
            ProvisionedThroughput={
                'ReadCapacityUnits': 5,
                'WriteCapacityUnits': 5
            }
        )
        
        def check_table_active():
            try:
                response = dynamodb.describe_table(TableName=table_name)
                return response['Table']['TableStatus'] == 'ACTIVE'
            except:
                return False
                
        if wait_with_progress(check_table_active, desc="테이블 생성 대기"):
            print(f"테이블 '{table_name}' 생성 완료")
            return True
        else:
            print(f"테이블 '{table_name}' 생성 대기 시간 초과")
            return False
            
    except Exception as e:
        print(f"테이블 생성 중 오류 발생: {str(e)}")
        return False


def extract_table_data(doc):
    """문서에서 표 데이터 추출 - 진행 상황 표시 추가"""
    course_table_data = {}
    
    # 표의 헤더를 찾을 수 있는 키워드
    header_patterns = [
        ["레벨", "제공 방식", "소요 시간"],
        ["레벨", "제공 방법", "소요 시간"],
        ["Level", "Delivery Method", "Duration"]
    ]
    
    current_course = None
    total_tables = len(doc.tables)
    
    print(f"문서에서 총 {total_tables}개 표 발견")
    
    # 표 처리에 진행 상황 추가
    for i, table in enumerate(tqdm(doc.tables, desc="표 분석 중", ncols=100)):
        # 표 헤더 확인
        header_found = False
        header_cells = []
        
        if len(table.rows) > 0:
            # 첫 번째 행에서 헤더 확인
            first_row = [cell.text.strip() for cell in table.rows[0].cells]
            
            for pattern in header_patterns:
                if all(p in first_row for p in pattern):
                    header_found = True
                    header_cells = first_row
                    break
            
            # 헤더가 발견되면 데이터 행 추출
            if header_found and len(table.rows) > 1:
                # 두 번째 행이 데이터
                data_row = [cell.text.strip() for cell in table.rows[1].cells]
                
                # 헤더와 데이터 매핑
                row_data = {header_cells[i]: data_row[i] for i in range(min(len(header_cells), len(data_row)))}
                
                # 마지막으로 발견한 과정 제목에 표 데이터 연결
                if current_course:
                    course_table_data[current_course] = row_data
                    print(f"  표 {i+1}/{total_tables}: 과정 '{current_course[:30]}...' 데이터 발견")
                    print(f"    - {', '.join([f'{k}: {v}' for k, v in row_data.items()])}")
    
    # 표 주변 문맥 분석을 위해 단락 처리에도 진행 상황 추가
    relevant_paragraphs = []
    
    # 먼저 관련 있는 단락만 필터링 (속도 향상)
    for p in doc.paragraphs:
        text = p.text.strip()
        if text and len(text) > 5 and not text.startswith("•") and not text.startswith("·"):
            if not any(text == kw for kw in ["과정 설명", "레벨", "제공 방법", "소요 시간", "과정 목표"]):
                relevant_paragraphs.append(text)
    
    # 과정 제목 매칭 시도 (진행 상황 표시)
    print(f"{len(relevant_paragraphs)}개 관련 단락 분석 중...")
    found_matches = 0
    
    for text in tqdm(relevant_paragraphs, desc="과정 제목 매칭 중", ncols=100):
        if any(keyword in text.lower() for keyword in ["aws", "cloud", "amazon"]):
            current_course = text
            found_matches += 1
    
    print(f"총 {found_matches}개 과정 제목 후보 발견")
    print(f"최종 {len(course_table_data)}개 과정에 대한 표 데이터 추출 완료")
    
    return course_table_data


def extract_module_info(paragraphs, start_idx, course):
    """과정 개요 섹션에서 모듈 및 실습 정보 추출 - 더 강화된 패턴 인식"""
    current_module = None
    current_day = None
    i = start_idx
    
    # 진행 상황 계산
    remaining_paragraphs = len(paragraphs) - start_idx
    max_scan = min(500, remaining_paragraphs)
    
    # 강화된 패턴
    day_pattern = re.compile(r'^(\d+)\s*일\s*차')
    module_pattern = re.compile(r'^모듈\s+(\d+)[:\s]+(.+)\$')
    lab_pattern = re.compile(r'^실습\s+(\d+)[:\s]+(.+)\$')
    bullet_pattern = re.compile(r'^[•·-]\s+(.+)\$')
    
    print(f"  모듈 정보 추출 시작: 단락 {start_idx}부터 최대 {max_scan}개 단락 검사")
    
    # 진행 상황 표시
    with tqdm(total=max_scan, desc="  모듈 정보 추출 중", ncols=100) as pbar:
        scan_count = 0
        
        while i < len(paragraphs) and scan_count < max_scan:
            text = paragraphs[i].text.strip()
            scan_count += 1
            pbar.update(1)
            
            if not text:
                i += 1
                continue
            
            # 일차 정보 감지
            day_match = day_pattern.match(text)
            if day_match:
                current_day = text
                pbar.set_description(f"  {text} 감지")
                i += 1
                continue
            
            # 모듈 정보 감지 - 강화된 패턴
            module_match = module_pattern.match(text)
            if module_match or text.startswith("모듈 "):
                if module_match:
                    module_num = int(module_match.group(1))
                    module_title = module_match.group(2).strip()
                else:
                    # "모듈 0: Architecting on AWS 소개" 같은 패턴 처리
                    parts = text.split(":", 1)
                    module_prefix = parts[0].strip()  # "모듈 0"
                    module_num = int(module_prefix.replace("모듈", "").strip())
                    module_title = parts[1].strip() if len(parts) > 1 else ""
                
                full_title = f"모듈 {module_num}: {module_title}"
                
                # 모듈 추가
                current_module = Module(title=full_title, order=module_num)
                if current_day:
                    current_module.topics.append(f"[{current_day}]")
                
                course.modules.append(current_module)
                pbar.set_description(f"  모듈 {module_num} 감지: {module_title[:30]}...")
                i += 1
                continue
            
            # 실습 정보 감지 - 강화된 패턴
            lab_match = lab_pattern.match(text)
            if lab_match or text.startswith("실습 "):
                if lab_match:
                    lab_num = int(lab_match.group(1))
                    lab_title = lab_match.group(2).strip()
                else:
                    # "실습 1: 네트워크 제어" 같은 패턴 처리
                    parts = text.split(":", 1)
                    lab_prefix = parts[0].strip()  # "실습 1"
                    lab_num = int(lab_prefix.replace("실습", "").strip())
                    lab_title = parts[1].strip() if len(parts) > 1 else ""
                
                full_lab_title = f"실습 {lab_num}: {lab_title}"
                
                # 실습 추가
                lab = Lab(
                    title=full_lab_title, 
                    order=lab_num,
                    related_module=current_module.title if current_module else ""
                )
                course.labs.append(lab)
                pbar.set_description(f"  실습 {lab_num} 감지: {lab_title[:30]}...")
                i += 1
                continue
            
            # 글머리 기호 항목 처리 (모듈 토픽)
            bullet_match = bullet_pattern.match(text)
            if bullet_match and current_module:
                topic = bullet_match.group(1).strip()
                current_module.topics.append(topic)
                pbar.set_description(f"  토픽 추가: {topic[:30]}...")
                
                i += 1
                continue
            
            # 다른 유형의 텍스트는 그냥 넘어감
            i += 1
    
    # 결과 요약
    print(f"  모듈 추출 완료: {len(course.modules)}개 모듈, {len(course.labs)}개 실습")
    if course.modules:
        for i, module in enumerate(course.modules[:3]):
            print(f"    - 모듈 {module.order}: {module.title} ({len(module.topics)}개 토픽)")
        if len(course.modules) > 3:
            print(f"    - ... 외 {len(course.modules)-3}개")
    
    return i

def normalize_level(level):
    """레벨 값 표준화"""
    level = level.lower().strip()
    
    if any(keyword in level for keyword in ["초급", "기초", "기본"]):
        return "기초"
    elif any(keyword in level for keyword in ["중급"]):
        return "중급"
    elif any(keyword in level for keyword in ["고급"]):
        return "고급"
    elif any(keyword in level for keyword in ["상급", "전문가"]):
        return "상급"
    else:
        return level

def normalize_duration(duration):
    """소요 시간 값 표준화"""
    duration = duration.lower().strip()
    
    if "0.5일" in duration or "반일" in duration:
        return "0.5일"
    elif "1일" in duration:
        return "1일"
    elif "2일" in duration:
        return "2일"
    elif "3일" in duration:
        return "3일"
    elif "4일" in duration:
        return "4일"
    elif "시간" in duration:
        # 숫자 추출
        hours = re.search(r'(\d+)\s*시간', duration)
        if hours:
            return f"{hours.group(1)}시간"
    
    return duration


def extract_course_info_from_docx(file_path, course_titles):
    """문서에서 과정 정보 추출 - 개선된 버전"""
    doc = docx.Document(file_path)
    courses_dict = {title: Course(title=title) for title in course_titles}
    courses = list(courses_dict.values())
    
    print(f"총 {len(course_titles)}개 과정 정보 추출 시작...")
    
    # 1. 표에서 레벨, 제공 방식, 소요 시간 추출
    print("문서에서 표 데이터 추출 중...")
    table_data = extract_table_data(doc)
    
    # 표 데이터 적용
    for course_text, data in table_data.items():
        # 가장 유사한 과정 제목 찾기
        best_match = None
        best_score = 0
        
        for title in course_titles:
            if title in course_text or course_text in title:
                score = len(title) / max(len(title), len(course_text))
                if score > best_score:
                    best_score = score
                    best_match = title
        
        if best_match and best_score > 0.5:
            course = courses_dict[best_match]
            if '레벨' in data:
                course.level = data['레벨']
            elif 'Level' in data:
                course.level = data['Level']
            
            if '제공 방식' in data:
                course.delivery_method = data['제공 방식']
            elif '제공 방법' in data:
                course.delivery_method = data['제공 방법']
            elif 'Delivery Method' in data:
                course.delivery_method = data['Delivery Method']
            
            if '소요 시간' in data:
                course.duration = data['소요 시간']
            elif 'Duration' in data:
                course.duration = data['Duration']
    
    # 2. 문서 섹션 추출을 위한 키워드 정의
    section_keywords = {
        "과정 설명": "description",
        "레벨": "level", 
        "제공 방법": "delivery_method",
        "제공 방식": "delivery_method",
        "소요 시간": "duration",
        "과정 목표": "objectives",
        "수강 대상": "audience", 
        "수강 전 권장 사항": "prerequisites",
        "등록": "registration_link",
        
        # 모듈 관련 키워드 강화
        "과정 개요": "modules_overview",
        "코스 개요": "modules_overview",
        "다루는 내용": "modules_overview",
        "학습 내용": "modules_overview",
        "사전 평가": "modules_overview",
        "1일 차": "modules_overview",
        "2일 차": "modules_overview",
        "3일 차": "modules_overview"
    }
    
    # 3. 문서 분석을 위한 준비
    current_course = None
    current_section = None
    
    # 등록 URL 패턴
    url_pattern = re.compile(r'www\.aws\.training|https?://\S+')
    
    # 4. 문서 순회하면서 과정 정보 추출
    i = 0
    while i < len(doc.paragraphs):
        para = doc.paragraphs[i]
        text = para.text.strip()
        if not text:
            i += 1
            continue
        
        # 4.1 과정 제목 매칭 시도
        matched_course = None
        for title in course_titles:
            # 완전 일치 또는 문서 앞부분의 제목이 있는지 확인
            if title == text or text.startswith("Digital Classroom") or (title in text and len(text) < len(title) + 20):
                matched_course = courses_dict[title]
                current_course = matched_course
                current_section = None
                print(f"\n과정 제목 인식: {title}")
                break

        # 특정 키워드를 만나면 과정 개요 섹션으로 인식하는 로직 추가
        if text == "과정 개요" or text == "사전 평가":
            current_section = "modules_overview"
            print(f"  섹션 인식: {text} (modules_overview)")
            
            # 과정 개요 섹션 발견 시 모듈 및 실습 정보 추출
            if current_course:
                print("  과정 개요 섹션에서 모듈 및 실습 정보 추출 시작")
                i = extract_module_info(doc.paragraphs, i+1, current_course)
                continue
        
        # 4.2 섹션 헤더 인식
        if text in section_keywords:
            current_section = section_keywords[text]
            print(f"  섹션 인식: {text} ({current_section})")
            
            # 과정 개요 섹션 발견 시 모듈 및 실습 정보 추출
            if current_section == "modules_overview" and current_course:
                print("  과정 개요 섹션에서 모듈 및 실습 정보 추출 시작")
                i = extract_module_info(doc.paragraphs, i+1, current_course)
                continue
                
            i += 1
            continue
        
        # 4.3 현재 과정과 섹션이 있을 때 내용 추가
        if current_course and current_section:
            # 기본 메타데이터 추가
            if current_section == "description":
                current_course.description += text + " "
            elif current_section == "level" and not current_course.level:
                current_course.level = text
            elif current_section == "delivery_method" and not current_course.delivery_method:
                current_course.delivery_method = text
            elif current_section == "duration" and not current_course.duration:
                current_course.duration = text
            elif current_section == "registration_link":
                if url_pattern.search(text):
                    current_course.registration_link = text
                    
            # 목록 항목 처리
            elif current_section in ["objectives", "audience", "prerequisites"]:
                if text.startswith("•") or text.startswith("·") or text.startswith("-"):
                    clean_text = text.lstrip("•·- ").strip()
                    if current_section == "objectives":
                        current_course.objectives.append(clean_text)
                    elif current_section == "audience":
                        current_course.audience.append(clean_text)
                    elif current_section == "prerequisites":
                        current_course.prerequisites.append(clean_text)
        
        i += 1
    
    # 5. 결과 정리 - 빈 정보 기본값 설정 및 중복 제거
    for course in courses:
        if not course.description.strip():
            course.description = f"{course.title}에 대한 과정 설명입니다."
        if not course.level:
            course.level = "미지정"
        if not course.delivery_method:
            course.delivery_method = "강의실 교육"
        if not course.duration:
            course.duration = "미지정"
        
        # 모듈 중복 제거
        unique_modules = []
        seen_titles = set()
        for module in course.modules:
            if module.title not in seen_titles:
                unique_modules.append(module)
                seen_titles.add(module.title)
        course.modules = unique_modules
        
        # 실습 중복 제거
        unique_labs = []
        seen_titles = set()
        for lab in course.labs:
            if lab.title not in seen_titles:
                unique_labs.append(lab)
                seen_titles.add(lab.title)
        course.labs = unique_labs
    
    # 결과 요약 출력
    courses_with_modules = [c for c in courses if c.modules]
    courses_with_labs = [c for c in courses if c.labs]
    
    print(f"\n추출 결과:")
    print(f"- 과정 수: {len(courses)}개")
    print(f"- 모듈 있는 과정 수: {len(courses_with_modules)}개")
    print(f"- 실습 있는 과정 수: {len(courses_with_labs)}개")
    
    return courses


def save_courses_to_dynamodb(courses, catalog_table, modules_table, region='us-east-1'):
    """과정 정보와 모듈/실습 정보를 DynamoDB에 저장"""
    dynamodb = boto3.resource('dynamodb', region_name=region)
    catalog_table_resource = dynamodb.Table(catalog_table)
    modules_table_resource = dynamodb.Table(modules_table)
    timestamp = datetime.now().isoformat()
    
    print(f"\nDynamoDB에 {len(courses)}개 과정 데이터 저장 중...")
    course_ids = {}  # 과정별 ID 매핑
    
    # 1. 과정 데이터 저장
    for course in tqdm(courses, desc="과정 데이터 저장", ncols=100):
        course_id = generate_short_id()
        course_ids[course.title] = course_id
        
        # 과정 항목 생성
        item = {
            'id': course_id,
            'title': course.title,
            'description': course.description,
            'level': normalize_level(course.level),
            'deliveryMethod': course.delivery_method,
            'duration': normalize_duration(course.duration),
            'registrationLink': course.registration_link,
            'moduleCount': len(course.modules),
            'labCount': len(course.labs),
            'createdAt': timestamp,
            'updatedAt': timestamp
        }
        
        if course.objectives:
            item['objectives'] = course.objectives
        
        if course.audience:
            item['audience'] = course.audience
        
        if course.prerequisites:
            item['prerequisites'] = course.prerequisites
        
        # 저장 시도
        try:
            catalog_table_resource.put_item(Item=item)
        except Exception as e:
            print(f"과정 '{course.title}' 저장 실패: {str(e)}")
    
    # 2. 모듈 및 실습 데이터 저장
    module_count = 0
    lab_count = 0
    
    for course in tqdm(courses, desc="모듈 및 실습 데이터 저장", ncols=100):
        if course.title not in course_ids:
            continue
            
        course_id = course_ids[course.title]
        
        # 모듈 저장
        for i, module in enumerate(course.modules):
            module_id = f"MOD{module.order:03d}" if module.order else f"MOD{i+1:03d}"
            item = {
                'courseId': course_id,
                'id': module_id,
                'title': module.title,
                'type': 'MODULE',
                'order': module.order if module.order > 0 else i+1,
                'createdAt': timestamp,
                'updatedAt': timestamp
            }
            
            if module.topics:
                item['topics'] = module.topics
            
            try:
                modules_table_resource.put_item(Item=item)
                module_count += 1
            except Exception as e:
                print(f"모듈 '{module.title}' 저장 실패: {str(e)}")
        
        # 실습 저장
        for i, lab in enumerate(course.labs):
            lab_id = f"LAB{lab.order:03d}" if lab.order else f"LAB{i+1:03d}"
            item = {
                'courseId': course_id,
                'id': lab_id,
                'title': lab.title,
                'type': 'LAB',
                'order': lab.order if lab.order > 0 else i+1,
                'createdAt': timestamp,
                'updatedAt': timestamp
            }
            
            if lab.description:
                item['description'] = lab.description
                
            if lab.related_module:
                item['relatedModule'] = lab.related_module
            
            try:
                modules_table_resource.put_item(Item=item)
                lab_count += 1
            except Exception as e:
                print(f"실습 '{lab.title}' 저장 실패: {str(e)}")
    
    print(f"\n저장 완료:")
    print(f"- 과정: {len(course_ids)}개")
    print(f"- 모듈: {module_count}개")
    print(f"- 실습: {lab_count}개")
    
    # 3. 저장된 데이터 검증
    try:
        catalog_count = catalog_table_resource.scan(Select='COUNT')['Count']
        modules_count = modules_table_resource.scan(Select='COUNT')['Count']
        print(f"DynamoDB 저장 결과:")
        print(f"- 과정 카탈로그 테이블 항목 수: {catalog_count}개")
        print(f"- 모듈 테이블 항목 수: {modules_count}개")
    except Exception as e:
        print(f"저장 검증 중 오류: {str(e)}")


def main():
    # 설정값
    COURSE_TABLE = 'Tnc-CourseCatalog'
    MODULE_TABLE = 'Tnc-CourseCatalog-Modules'
    REGION = 'us-east-1'
    DOC_FILE = 'Instuctor.docx'
    
    # 과정명 목록 (요청된 과정명)
    course_titles_text = """Instuctor-led Training (ILT)
Instructor-led Training (ILT) Overview	3
Advanced AWS Well-Architected Best Practices	7
Amazon SageMaker Studio for Data Scientists	10
Architecting on AWS	13
AWS Cloud Essentials for Business Leaders	18
AWS Cloud Practitioner Essentials	20
AWS Migration Essentials	24
AWS Security Essentials	26
AWS Technical Essentials	28
AWS Well-Architected Best Practices	31
AWS Well-Architected Best Practices (Custom)	33
Building Batch Data Analytics Solutions on AWS	35
Building Data Analytics Solutions Using Amazon Redshift	38
Building Data Lakes on AWS	41
Build Modern Applications with AWS NoSQL Databases	44
Building Streaming Data Analytics Solutions on AWS	47
Cloud Operations on AWS (구 Systems Operations on AWS)	50
Data Warehousing on AWS	54
Designing and Implementing Storage on AWS	57
Developing Generative AI Applications on AWS	61
Developing on AWS	65
Developing Serverless Solutions on AWS	71
DevOps Engineering on AWS	76
Generative AI Essentials on AWS	79
Migrating to AWS	82
MLOps Engineering on AWS	86
Networking Essentials for Cloud Applications on AWS	90
Practical Data Science with Amazon SageMaker	93
Practical IaC on AWS with Terraform	96
Running Containers on Amazon Elastic Kubernetes Service (Amazon EKS)	99
Security Engineering on AWS	103"""
    
    try:
        # 필요한 라이브러리 확인
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
        
        # 과정명 파싱
        course_titles = parse_course_titles(course_titles_text)
        print(f"{len(course_titles)}개 과정명 파싱 완료:")
        for i, title in enumerate(course_titles[:5]):
            print(f"  {i+1}. {title}")
        if len(course_titles) > 5:
            print(f"  ... 외 {len(course_titles)-5}개")
        
        # 파일 존재 확인
        if not os.path.exists(DOC_FILE):
            print(f"오류: 파일 '{DOC_FILE}'을 찾을 수 없습니다.")
            print(f"현재 디렉토리: {os.getcwd()}")
            print(f"디렉토리 내 파일: {os.listdir('.')}")
            return
        
        # 테이블 삭제 및 생성
        delete_table_if_exists(COURSE_TABLE, REGION)
        delete_table_if_exists(MODULE_TABLE, REGION)
        
        if not create_course_catalog_table(COURSE_TABLE, REGION) or not create_modules_table(MODULE_TABLE, REGION):
            print("테이블 생성에 실패했습니다. 작업을 중단합니다.")
            return
        
        # 문서에서 과정 정보 추출
        courses = extract_course_info_from_docx(DOC_FILE, course_titles)
        
        # 디버깅용 JSON 저장
        with open('extracted_courses_debug.json', 'w', encoding='utf-8') as f:
            json.dump([asdict(course) for course in courses], f, ensure_ascii=False, indent=2)
        
        # 추출된 정보 요약 출력 부분 개선 - 들여쓰기 오류 수정
        print("\n추출된 과정 정보 요약:")
        modules_total = sum(len(course.modules) for course in courses)
        labs_total = sum(len(course.labs) for course in courses)
        topics_total = sum(sum(len(module.topics) for module in course.modules) for course in courses)

        print(f"총계:")
        print(f"- 과정: {len(courses)}개")
        print(f"- 모듈: {modules_total}개")
        print(f"- 토픽: {topics_total}개")
        print(f"- 실습: {labs_total}개")

        # 모듈과 실습이 있는 과정 수 계산
        courses_with_modules = [c.title for c in courses if c.modules]
        courses_with_labs = [c.title for c in courses if c.labs]

        print(f"\n모듈이 있는 과정: {len(courses_with_modules)}개")
        if courses_with_modules:
            for i, title in enumerate(courses_with_modules[:5]):
                print(f"  {i+1}. {title}")
            if len(courses_with_modules) > 5:
                print(f"  ... 외 {len(courses_with_modules)-5}개")

        print(f"\n실습이 있는 과정: {len(courses_with_labs)}개")
        if courses_with_labs:
            for i, title in enumerate(courses_with_labs[:5]):
                print(f"  {i+1}. {title}")
            if len(courses_with_labs) > 5:
                print(f"  ... 외 {len(courses_with_labs)-5}개")

        # 상세 정보 표시 (상위 5개 과정)
        for i, course in enumerate(courses[:min(5, len(courses))]):
            print(f"\n{i+1}. {course.title}")
            print(f"   레벨: {course.level}")
            print(f"   제공방법: {course.delivery_method}")
            print(f"   소요시간: {course.duration}")
            print(f"   모듈: {len(course.modules)}개")
            
            # 모듈 예시
            if course.modules:
                print(f"   모듈 목록:")
                for j, module in enumerate(course.modules[:3]):  # 처음 3개만 표시
                    print(f"     {j+1}. {module.title}")
                    if module.topics and j == 0:  # 첫 번째 모듈의 토픽만 표시
                        for k, topic in enumerate(module.topics[:2]):  # 처음 2개 토픽만 표시
                            if len(topic) > 50:
                                topic = topic[:47] + "..."
                            print(f"        - {topic}")
                        if len(module.topics) > 2:
                            print(f"        - ... 외 {len(module.topics)-2}개 토픽")
                if len(course.modules) > 3:
                    print(f"     ... 외 {len(course.modules)-3}개 모듈")
            
            # 실습 예시
            print(f"   실습: {len(course.labs)}개")
            if course.labs:
                for j, lab in enumerate(course.labs[:2]):  # 처음 2개만 표시
                    print(f"     {j+1}. {lab.title}")
                    if lab.related_module:
                        print(f"        - 연관 모듈: {lab.related_module}")
                if len(course.labs) > 2:
                    print(f"     ... 외 {len(course.labs)-2}개 실습")
        
        # DynamoDB에 데이터 저장
        save_courses_to_dynamodb(courses, COURSE_TABLE, MODULE_TABLE, REGION)
        print("모든 처리가 완료되었습니다.")
        
    except Exception as e:
        print(f"오류 발생: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()