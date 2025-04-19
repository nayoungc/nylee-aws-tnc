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
    """docx 파일에서 직접 과정 정보 추출 - 수정된 버전"""
    doc = docx.Document(file_path)
    courses = []
    
    # 페이지 번호 패턴
    page_number_pattern = re.compile(r'^\d+\$')
    
    # AWS 과정 제목을 인식하는 조건으로 수정
    is_course_title = lambda text: (
        text and 
        len(text) > 5 and
        not text.isdigit() and
        not page_number_pattern.match(text) and
        not text.startswith("Instuctor-led") and
        not text.startswith("Instructor-led") and
        not text.startswith("Digital") and
        "모듈" not in text and
        "목차" not in text and
        "Overview" not in text and
        "www." not in text and
        "http" not in text
    )
    
    # 과정 정보를 담을 구조
    course_data = []
    current_course = None
    
    # 이전에 과정 제목으로 식별된 텍스트 패턴 저장
    known_titles = []
    
    # 과정 정보 섹션 패턴
    section_patterns = {
        "과정 설명": "description",
        "레벨": "level", 
        "제공 방법": "delivery_method",
        "소요 시간": "duration",
        "과정 목표": "objectives",
        "수강 대상": "audience",
        "수강 전 권장 사항": "prerequisites",
        "등록": "registration_link",
        "과정 개요": "modules_overview"
    }
    
    # 1단계: 문서의 모든 텍스트 추출
    all_paragraphs = [p.text.strip() for p in doc.paragraphs]
    
    # 2단계: 목차에서 과정 제목 후보군 식별
    for i, text in enumerate(all_paragraphs[:50]):  # 앞부분 50줄 검사
        # 숫자와 텍스트로 된 목차 항목 패턴 (예: "4. AWS Cloud Essentials")
        if re.match(r'^[\d\.]+\s+\w+.*', text) or is_course_title(text):
            title = re.sub(r'^[\d\.]+\s+', '', text)  # 앞의 숫자 제거
            if is_course_title(title):
                known_titles.append(title)
    
    print(f"목차에서 찾은 과정 제목 후보군: {len(known_titles)}개")
    if known_titles:
        print(f"예시: {known_titles[:3]}")
    
    # 3단계: 문서를 순회하면서 과정 정보 추출
    current_section = None
    current_course = None
    
    for i, para in tqdm(enumerate(doc.paragraphs), desc="문서 분석 중", total=len(doc.paragraphs), ncols=100):
        text = para.text.strip()
        if not text:
            continue
            
        # 과정 제목 감지
        is_title = False
        for title in known_titles:
            if title in text:
                is_title = True
                current_course = Course(title=title)
                current_section = None
                break
                
        if not is_title and current_course is None:
            # 알려진 제목이 아니라면 휴리스틱 검사
            if is_course_title(text) and len(text) < 100:
                current_course = Course(title=text)
                current_section = None
                
        # 섹션 헤더 감지
        if text in section_patterns:
            current_section = section_patterns[text]
            continue
            
        # 현재 섹션에 내용 추가
        if current_course and current_section and text:
            if current_section == "description":
                current_course.description += text + " "
            elif current_section == "level":
                current_course.level = text
            elif current_section == "delivery_method":
                current_course.delivery_method = text
            elif current_section == "duration":
                current_course.duration = text
            elif current_section == "registration_link":
                # URL 형식만 저장
                if "www." in text or "http" in text:
                    current_course.registration_link = text
            elif current_section == "objectives":
                if text.startswith("·"):
                    current_course.objectives.append(text[1:].strip())
            elif current_section == "audience":
                if text.startswith("·"):
                    current_course.audience.append(text[1:].strip())
            elif current_section == "prerequisites":
                if text.startswith("·"):
                    current_course.prerequisites.append(text[1:].strip())
            elif current_section == "modules_overview":
                # 모듈 정보 처리
                if text.startswith("모듈") or text.startswith("일 차"):
                    module_match = re.match(r'모듈\s+\d+[^:]*:\s*(.+)', text)
                    day_match = re.match(r'\d일\s*차[^:]*:\s*(.+)', text)
                    
                    if module_match:
                        module_title = module_match.group(1).strip()
                        current_module = Module(title=module_title)
                        current_course.modules.append(current_module)
                    elif day_match:
                        day_title = day_match.group(1).strip()
                        current_module = Module(title=f"{text.split(':')[0]} - {day_title}")
                        current_course.modules.append(current_module)
                # 실습 정보 처리
                elif text.startswith("실습"):
                    lab_match = re.match(r'실습\s+\d+[^:]*:\s*(.+)', text)
                    if lab_match:
                        lab_title = lab_match.group(1).strip()
                        current_lab = Lab(title=lab_title)
                        current_course.labs.append(current_lab)
                # 모듈/실습의 세부 항목
                elif text.startswith("·") and current_course.modules:
                    current_course.modules[-1].topics.append(text[1:].strip())
        
        # 새로운 과정 시작 감지 또는 과정 종료
        if (current_course and (
                (i+1 < len(doc.paragraphs) and is_course_title(doc.paragraphs[i+1].text.strip())) or
                (text.startswith("등록") and current_section == "registration_link")
            )):
            if current_course.title and (
                   current_course.description or 
                   current_course.level or 
                   current_course.delivery_method or
                   current_course.objectives
                ):
                courses.append(current_course)
                current_course = None
    
    # 마지막 과정 추가
    if current_course and current_course.title:
        courses.append(current_course)
    
    # 결과 필터링 및 정리
    filtered_courses = []
    for course in courses:
        # 최소 기준: 제목과 하나 이상의 추가 정보가 있어야 함
        if course.title and (course.description or course.level or course.objectives):
            # 중복 제거
            if not any(c.title == course.title for c in filtered_courses):
                # URL이 제목인 경우 제외
                if not course.title.startswith("www.") and not course.title.startswith("http"):
                    filtered_courses.append(course)
    
    print(f"총 {len(filtered_courses)}개의 유효한 과정 추출")
    return filtered_courses

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
