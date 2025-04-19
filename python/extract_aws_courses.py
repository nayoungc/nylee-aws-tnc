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
    """docx 파일에서 직접 과정 정보 추출 - 모듈 및 실습 추출 개선"""
    doc = docx.Document(file_path)
    courses = []
    
    # 목차에서 과정 제목 식별
    known_titles = []
    for i, para in enumerate(doc.paragraphs[:50]):
        text = para.text.strip()
        if text and len(text) > 5 and not text.isdigit() and not text.startswith('Instructor') and not text.startswith('Digital'):
            # 페이지 번호와 제목 분리 패턴
            match = re.match(r'(.*?)\s+(\d+)\$', text)
            if match:
                title = match.group(1).strip()
                if len(title) > 5 and "Overview" not in title:
                    known_titles.append(title)
    
    if not known_titles:
        print("목차에서 과정 제목을 찾을 수 없습니다. 다른 방법으로 시도합니다.")
    else:
        print(f"목차에서 {len(known_titles)}개 과정 제목 식별")
        print(f"예시: {known_titles[:3]}")
    
    # 섹션 키워드 패턴 (정확한 매칭을 위해 수정)
    section_keywords = {
        "과정 설명": "description",
        "레벨": "level", 
        "제공 방법": "delivery_method",
        "소요 시간": "duration",
        "과정 목표": "objectives",
        "수강 대상": "audience", 
        "수강 전 권장 사항": "prerequisites",
        "등록": "registration_link",
        "과정 개요": "modules_overview",
        "코스 개요": "modules_overview",
        "다루는 내용": "modules_overview"
    }
    
    current_course = None
    current_section = None
    courses_data = []
    
    # 문서 전체 구조를 저장해서 디버깅
    doc_structure = []
    
    # 사전 처리: 전체 문서 구조 파악
    for i, para in enumerate(doc.paragraphs):
        text = para.text.strip()
        if text:
            doc_structure.append((i, text))
            
            # 과정 경계 표시(예: 제목 뒤 숫자로 페이지 번호 표시된 경우)
            if re.match(r'^[\w\s\-]+\s+\d+\$', text) and not text.startswith("모듈") and not text.startswith("실습"):
                match = re.match(r'(.*?)\s+(\d+)\$', text)
                if match and len(match.group(1).strip()) > 5:
                    doc_structure[-1] = (i, f"[POSSIBLE_TITLE] {text}")
            
            # 섹션 경계 강조
            for keyword in section_keywords:
                if text == keyword:
                    doc_structure[-1] = (i, f"[SECTION] {text}")
    
    # 디버깅을 위해 문서 구조 저장
    with open('document_structure.txt', 'w', encoding='utf-8') as f:
        for idx, text in doc_structure:
            f.write(f"{idx}: {text}\n")
    
    print(f"문서 구조 분석: 총 {len(doc_structure)}개 텍스트 줄 발견")
    
    # 과정 제목이자 섹션 시작 감지 함수
    def is_course_title(text):
        # 기본 과정 제목 조건
        if len(text) < 6 or text.isdigit():
            return False
            
        # 제외할 패턴
        exclude_patterns = ["Overview", "모듈", "실습", "일차", "www.", "http"]
        for pattern in exclude_patterns:
            if pattern in text:
                return False
                
        # 알려진 제목과 매칭
        for known in known_titles:
            if text.startswith(known) or known in text:
                return True
                
        # 페이지 번호가 있는 제목 형식
        if re.match(r'^[\w\s\-]+\s+\d+\$', text):
            title_part = text.rsplit(' ', 1)[0]
            if len(title_part) > 5:
                return True
                
        return False
    
    # 새로운 접근법: 단락 분석 및 구조화된 정보 추출
    current_course = None
    current_section = None
    current_module = None
    current_lab = None
    found_courses = []
    
    # 실제 문서 내용 추출
    for i, para in enumerate(tqdm(doc.paragraphs, desc="과정 정보 추출 중", ncols=100)):
        text = para.text.strip()
        if not text:
            continue
            
        # 1. 과정 제목 인식
        if is_course_title(text) and (current_course is None or len(current_course.title) < len(text)):
            # 이전 과정 저장
            if current_course and current_course.title and (current_course.description or current_course.level):
                found_courses.append(current_course)
                
            # 새 과정 시작
            title = text.split(' ', 1)[0] if text.endswith(tuple('0123456789')) else text
            current_course = Course(title=title)
            current_section = None
            print(f"과정 제목 감지: {title}")
        
        # 2. 섹션 헤더 인식
        is_section = False
        for keyword, section_id in section_keywords.items():
            if text == keyword or text.startswith(f"{keyword}:"):
                current_section = section_id
                is_section = True
                print(f"  섹션 감지: {keyword}")
                break
                
        if is_section:
            continue
            
        # 3. 현재 섹션에 내용 추가
        if current_course and current_section:
            # 기본 메타데이터 추가
            if current_section == "description":
                current_course.description += text + " "
            elif current_section == "level":
                current_course.level = text
            elif current_section == "delivery_method":
                current_course.delivery_method = text
            elif current_section == "duration":
                current_course.duration = text
            elif current_section == "registration_link":
                if "aws.training" in text or "http" in text:
                    current_course.registration_link = text
                    
            # 목록 데이터 (글머리 기호로 시작하는 항목)
            elif current_section in ["objectives", "audience", "prerequisites"]:
                if text.startswith("•") or text.startswith("·") or text.startswith("-"):
                    clean_text = text.lstrip("•·-").strip()
                    if current_section == "objectives":
                        current_course.objectives.append(clean_text)
                    elif current_section == "audience":
                        current_course.audience.append(clean_text)
                    elif current_section == "prerequisites":
                        current_course.prerequisites.append(clean_text)
                        
            # 모듈 및 실습 정보 추출 (개선된 로직)
            elif current_section == "modules_overview":
                # 새 모듈 시작
                module_pattern = re.match(r'모듈\s*(\d+)[:\s]*(.+)', text)
                day_pattern = re.match(r'(\d+)일\s*차[:\s]*(.+)', text)
                
                if module_pattern:
                    module_num = module_pattern.group(1)
                    module_title = module_pattern.group(2).strip()
                    current_module = Module(title=f"모듈 {module_num}: {module_title}")
                    current_course.modules.append(current_module)
                    print(f"    모듈 감지: {current_module.title}")
                    
                elif day_pattern:
                    day_num = day_pattern.group(1)
                    day_title = day_pattern.group(2).strip() if day_pattern.group(2) else f"{day_num}일차"
                    current_module = Module(title=f"{day_num}일차: {day_title}")
                    current_course.modules.append(current_module)
                    print(f"    일차 감지: {current_module.title}")
                    
                # 새 실습 시작
                elif text.startswith("실습"):
                    lab_pattern = re.match(r'실습\s*(\d+)[:\s]*(.+)', text)
                    if lab_pattern:
                        lab_num = lab_pattern.group(1)
                        lab_title = lab_pattern.group(2).strip()
                        current_lab = Lab(title=f"실습 {lab_num}: {lab_title}")
                        current_course.labs.append(current_lab)
                        print(f"    실습 감지: {current_lab.title}")
                        
                # 모듈/실습 내용 추가
                elif (text.startswith("•") or text.startswith("·") or text.startswith("-")) and current_module:
                    clean_text = text.lstrip("•·-").strip()
                    current_module.topics.append(clean_text)
                    
                # 그 외 내용은 현재 모듈이나 실습의 설명으로 처리
                elif current_lab and not current_lab.description and not text.startswith("모듈") and not text.startswith("일"):
                    current_lab.description += text + " "
    
    # 마지막 과정 추가
    if current_course and current_course.title:
        found_courses.append(current_course)
    
    # 중복 제거 및 정리
    unique_courses = []
    seen_titles = set()
    
    for course in found_courses:
        if course.title not in seen_titles:
            # 미처리 필드 기본값 설정
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
    
    # 디버그용 정보 출력
    print(f"\n추출된 과정 정보: {len(unique_courses)}개 과정")
    print("\n과정별 모듈 및 실습 현황:")
    for i, course in enumerate(unique_courses[:min(10, len(unique_courses))]):
        print(f"{i+1}. {course.title}")
        print(f"   - 모듈: {len(course.modules)}개")
        print(f"   - 실습: {len(course.labs)}개")
    
    if len(unique_courses) > 10:
        print(f"   ... 외 {len(unique_courses) - 10}개 과정")
    
    # 상세 정보를 JSON 파일로 저장 (디버깅용)
    with open('extracted_courses_debug.json', 'w', encoding='utf-8') as f:
        json.dump([asdict(course) for course in unique_courses], f, ensure_ascii=False, indent=2)
    
    return unique_courses

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
        
        # 추출된 과정의 품질 확인
        print("\n추출된 과정 정보 요약:")
        for i, course in enumerate(courses[:5]):  # 처음 5개만 출력
            print(f"과정 {i+1}: {course.title}")
            print(f"  설명: {course.description[:100]}..." if course.description else "  설명: 없음")
            print(f"  레벨: {course.level}")
            print(f"  제공 방법: {course.delivery_method}")
            print(f"  소요 시간: {course.duration}")
            print(f"  목표: {len(course.objectives)}개")
            print(f"  모듈: {len(course.modules)}개")
            print(f"  실습: {len(course.labs)}개")
        print(f"... 외 {len(courses)-5}개 과정")
        
        # DynamoDB에 저장
        print("DynamoDB에 데이터 저장 중...")
        save_courses_to_dynamodb(courses, TABLE_NAME, REGION)
        print("모든 처리가 완료되었습니다.")
        
    except Exception as e:
        print(f"오류 발생: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
