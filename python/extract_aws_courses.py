import boto3
import re
import json
import os
import docx
import random
import string
import pandas as pd
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
    """과정 카탈로그 테이블 생성 - 단순화된 버전"""
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
                {'AttributeName': 'title', 'AttributeType': 'S'}
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


def check_document_structure(doc_path):
    """문서 구조 확인 및 디버깅"""
    try:
        from docx import Document
        doc = Document(doc_path)
        
        print(f"\n문서 구조 확인:")
        print(f"- 총 단락 수: {len(doc.paragraphs)}")
        print(f"- 표 수: {len(doc.tables)}")
        print(f"- 섹션 수: {len(doc.sections)}")
        
        # 표가 없으면 처음 몇 단락을 출력하여 확인
        if len(doc.tables) == 0:
            print("\n처음 10개 단락 내용 샘플:")
            for i, para in enumerate(doc.paragraphs[:10]):
                text = para.text.strip()
                if text:
                    print(f"{i}: {text[:50]}...")
            
            # 탭 문자나 정규적인 공백이 있는지 확인 (임시 표일 수 있음)
            tab_paragraphs = []
            for i, para in enumerate(doc.paragraphs):
                if '\t' in para.text:
                    tab_paragraphs.append((i, para.text))
            
            if tab_paragraphs:
                print("\n탭 문자를 포함하는 단락 (가능한 표 데이터):")
                for i, text in tab_paragraphs[:5]:  # 처음 5개만 표시
                    print(f"단락 {i}: {text[:50]}...")
                    
        return doc
            
    except Exception as e:
        print(f"문서 구조 확인 중 오류: {e}")
        return None


def extract_course_metadata_from_text(doc, course_title):
    """문서에서 과정 정보를 텍스트 패턴으로 추출"""
    course_data = {}
    in_course_section = False
    current_field = None
    metadata_fields = ["레벨", "제공 방법", "제공 방식", "소요 시간"]
    
    print(f"'{course_title}' 과정의 메타데이터 추출 시도...")
    
    for para in doc.paragraphs:
        text = para.text.strip()
        if not text:
            continue
            
        # 과정 제목을 찾아 해당 섹션 시작 표시
        if course_title in text and not in_course_section:
            in_course_section = True
            print(f"  과정 섹션 발견: {text[:50]}...")
            continue
        
        # 다음 과정 제목을 만나면 섹션 종료
        if in_course_section and text.startswith("과정 설명") and course_title not in text:
            in_course_section = False
            break
            
        # 메타데이터 필드 찾기
        if in_course_section:
            # 필드 이름 확인
            if any(text.startswith(field) for field in metadata_fields):
                for field in metadata_fields:
                    if text.startswith(field):
                        current_field = field
                        # 같은 줄에 값이 있는 경우 추출
                        value_part = text[len(field):].strip()
                        if value_part and value_part[0] in [':', '：']:  # 다양한 형태의 콜론 처리
                            value = value_part[1:].strip()
                            course_data[current_field] = value
                            print(f"  {current_field}: {value}")
                        break
                        
            # 이전 줄에서 필드를 찾았지만 값을 찾지 못한 경우, 다음 줄이 값일 수 있음
            elif current_field and current_field not in course_data:
                course_data[current_field] = text
                print(f"  {current_field}: {text}")
                current_field = None
    
    return course_data


def extract_course_modules_and_labs(doc, course_title, all_course_titles, course=None):
    """문서 전체에서 과정의 모듈과 실습을 효과적으로 추출하는 통합 함수"""
    if course is None:
        course = Course(title=course_title)
    
    current_module = None
    current_day = None
    
    # 정규식 패턴 - 이스케이프 없이 올바르게 수정
    day_pattern = re.compile(r'^(\d+)\s*일\s*차\$')
    module_patterns = [
        re.compile(r'^모듈\s+(\d+)[:\s]+(.+)\$'),
        re.compile(r'^모듈\s+(\d+)[\.:]?\s*(.+)\$')
    ]
    lab_patterns = [
        re.compile(r'^실습\s+(\d+)[:\s]+(.+)\$'), 
        re.compile(r'^실습\s+(\d+)[\.:]?\s*(.+)\$'),
        re.compile(r'^실습[:\s]+(.+)\$')  # 번호 없는 실습 패턴 추가
    ]
    final_lab_pattern = re.compile(r'^최종\s*실습[:\s]+(.+)\$')
    bullet_pattern = re.compile(r'^[•·-]\s+(.+)\$')
    
    print(f"\n'{course_title}' 과정의 모듈/실습 정보 추출 시작...")
    
    # 상태 변수
    start_searching = False
    in_course_overview = False
    found_module_section = False
    in_modules_section = False
    
    # 카운터
    module_count = 0
    lab_count = 0
    
    # 전체 단락 수
    total_paragraphs = len(doc.paragraphs)
    
    with tqdm(total=total_paragraphs, desc="문서 분석", ncols=100) as pbar:
        for i, para in enumerate(doc.paragraphs):
            text = para.text.strip()
            pbar.update(1)
            
            if not text:
                continue
            
            # 과정 제목 확인 - 정확한 매칭을 위해 조건 강화
            if not start_searching:
                if course_title == text or (course_title in text and len(text) < len(course_title) + 15):
                    start_searching = True
                    pbar.set_description(f"과정 '{course_title}' 발견 (단락 {i})")
                    continue
            
            if not start_searching:
                continue
            
            # 다른 과정으로 넘어갔는지 확인
            if any(title == text or (title in text and len(text) < len(title) + 15) 
                   for title in all_course_titles if title != course_title):
                pbar.set_description(f"다른 과정 발견, 검색 종료")
                break
            
            # 과정 개요 섹션 시작 감지
            if text == "과정 개요" and not in_course_overview:
                in_course_overview = True
                pbar.set_description(f"과정 개요 섹션 발견 (단락 {i})")
                continue
            
            # 모듈 섹션 검색 시작
            if not found_module_section:
                # 모듈 섹션 시작 표시자 찾기
                if text.startswith("모듈") or "모듈 1:" in text or text == "1일 차" or text == "1일차" or "모듈 0:" in text:
                    found_module_section = True
                    in_modules_section = True
                    pbar.set_description(f"모듈 섹션 시작 발견: {text[:30]}")
                
                # 과정 개요 섹션이 아닌 경우의 메타데이터 추출
                elif text in ["과정 설명", "레벨", "제공 방법", "제공 방식", "소요 시간"]:
                    pbar.set_description(f"메타데이터 섹션 발견: {text}")
                    if text == "과정 설명":
                        course.description = ""  # 과정 설명 초기화
                elif hasattr(course, 'description') and course.description is not None:
                    course.description += " " + text
                
                continue
            
            # 모듈 섹션이 끝났는지 확인
            if in_modules_section and (text == "과정 요약" or text == "과정 마무리" or text == "사후 평가"):
                in_modules_section = False
                pbar.set_description(f"모듈 섹션 종료 발견: {text}")
                break
            
            # 이제 모듈, 실습 등 주요 내용 추출
            if in_modules_section:
                # 일 차 패턴 확인
                day_match = day_pattern.match(text)
                if day_match:
                    current_day = f"{day_match.group(1)}일 차"
                    pbar.set_description(f"{current_day} 발견")
                    continue
                
                # 모듈 패턴 확인
                module_match = None
                for pattern in module_patterns:
                    match = pattern.match(text)
                    if match:
                        module_match = match
                        break
                
                if module_match:
                    module_num = int(module_match.group(1))
                    module_title = module_match.group(2).strip()
                    full_title = f"모듈 {module_num}: {module_title}"
                    
                    current_module = Module(title=full_title, order=module_num)
                    if current_day:
                        current_module.topics.append(f"[{current_day}]")
                    
                    course.modules.append(current_module)
                    module_count += 1
                    pbar.set_description(f"모듈 {module_num} 발견: {module_title[:30]}")
                    continue
                
                # 실습 패턴 확인 (번호 있는 실습)
                lab_match = None
                lab_num = None
                lab_title = None
                
                for pattern in lab_patterns[:2]:  # 번호 있는 실습 패턴만 사용
                    match = pattern.match(text)
                    if match:
                        lab_match = match
                        lab_num = int(match.group(1))
                        lab_title = match.group(2).strip()
                        break
                        
                if lab_match and lab_num and lab_title:
                    full_lab_title = f"실습 {lab_num}: {lab_title}"
                    lab = Lab(
                        title=full_lab_title, 
                        order=lab_num,
                        related_module=current_module.title if current_module else ""
                    )
                    course.labs.append(lab)
                    lab_count += 1
                    pbar.set_description(f"실습 {lab_num} 발견: {lab_title[:30]}")
                    continue
                
                # 번호 없는 실습 패턴 확인
                lab_match = lab_patterns[2].match(text)
                if lab_match:
                    lab_title = lab_match.group(1).strip()
                    lab_num = lab_count + 1
                    full_lab_title = f"실습 {lab_num}: {lab_title}"
                    
                    lab = Lab(
                        title=full_lab_title, 
                        order=lab_num,
                        related_module=current_module.title if current_module else ""
                    )
                    course.labs.append(lab)
                    lab_count += 1
                    pbar.set_description(f"실습(번호없음) 발견: {lab_title[:30]}")
                    continue
                
                # 최종 실습 패턴 확인
                final_lab_match = final_lab_pattern.match(text)
                if final_lab_match:
                    lab_title = final_lab_match.group(1).strip()
                    lab_num = lab_count + 1
                    full_lab_title = f"최종 실습: {lab_title}"
                    
                    lab = Lab(
                        title=full_lab_title, 
                        order=lab_num,
                        related_module=current_module.title if current_module else "최종 실습"
                    )
                    course.labs.append(lab)
                    lab_count += 1
                    pbar.set_description(f"최종 실습 발견: {lab_title[:30]}")
                    continue
                
                # 글머리 기호로 시작하는 토픽 확인
                bullet_match = bullet_pattern.match(text)
                if bullet_match and current_module:
                    topic = bullet_match.group(1).strip()
                    
                    # 내용이 "실습: xxx" 형식인지 확인
                    nested_lab_match = re.search(r'^실습[:\s]+(.+)\$', topic)
                    if nested_lab_match:
                        lab_title = nested_lab_match.group(1).strip()
                        lab_num = lab_count + 1
                        full_lab_title = f"실습 {lab_num}: {lab_title}"
                        
                        lab = Lab(
                            title=full_lab_title, 
                            order=lab_num,
                            related_module=current_module.title
                        )
                        course.labs.append(lab)
                        lab_count += 1
                        pbar.set_description(f"토픽 내 실습 발견: {lab_title[:30]}")
                    else:
                        current_module.topics.append(topic)
                        if len(current_module.topics) % 5 == 0:  # 로그 줄이기
                            pbar.set_description(f"모듈 {current_module.order}의 토픽 추가 중 ({len(current_module.topics)}개)")
                    continue
    
    # 결과 정리 - 중복 제거
    unique_modules = []
    seen_titles = set()
    for module in course.modules:
        if module.title not in seen_titles:
            unique_modules.append(module)
            seen_titles.add(module.title)
    course.modules = unique_modules
    
    # 실습도 중복 제거
    unique_labs = []
    seen_lab_titles = set()
    for lab in course.labs:
        if lab.title not in seen_lab_titles:
            unique_labs.append(lab)
            seen_lab_titles.add(lab.title)
    course.labs = unique_labs
    
    # 결과 요약
    print(f"모듈/실습 추출 완료:")
    print(f"- 모듈: {len(course.modules)}개")
    print(f"- 실습: {len(course.labs)}개")
    
    if course.modules:
        print("주요 모듈:")
        for i, module in enumerate(course.modules[:3]):
            topic_count = len([t for t in module.topics if not t.startswith('[')])  # 일 차 항목 제외
            print(f"- 모듈 {module.order}: {module.title} ({topic_count}개 토픽)")
        if len(course.modules) > 3:
            print(f"- ... 외 {len(course.modules)-3}개 모듈")
    
    if course.labs:
        print("주요 실습:")
        for i, lab in enumerate(course.labs[:3]):
            print(f"- {lab.title}")
        if len(course.labs) > 3:
            print(f"- ... 외 {len(course.labs)-3}개 실습")
    
    return course


def extract_course_level_from_text(doc, course_title):
    """텍스트에서 레벨 정보 추출"""
    level_patterns = [
        re.compile(r"레벨\s*[:：]\s*(\S+)"),
        re.compile(r"수준\s*[:：]\s*(\S+)"),
        re.compile(r"Level\s*[:：]\s*(\S+)")
    ]
    
    in_course_section = False
    
    for para in doc.paragraphs:
        text = para.text.strip()
        if not text:
            continue
            
        # 과정 제목을 찾아 해당 섹션 시작 표시
        if course_title in text and not in_course_section:
            in_course_section = True
            continue
        
        # 다음 과정 제목 또는 섹션으로 넘어가면 종료
        if in_course_section and any(text.startswith(marker) for marker in ["과정 개요", "모듈 1", "1일 차"]):
            break
            
        # 레벨 정보 찾기
        if in_course_section:
            for pattern in level_patterns:
                match = pattern.search(text)
                if match:
                    return normalize_level(match.group(1))
            
            # 줄에 "레벨" 또는 "Level" 단어가 포함되어 있으면 추출 시도
            if "레벨" in text or "Level" in text:
                parts = re.split(r'[:：\s]', text)
                for i, part in enumerate(parts):
                    if part in ["레벨", "Level", "수준"] and i+1 < len(parts):
                        if parts[i+1].strip():
                            return normalize_level(parts[i+1].strip())
    
    return ""


def extract_course_duration_from_text(doc, course_title):
    """텍스트에서 소요 시간 정보 추출"""
    duration_patterns = [
        re.compile(r"소요\s*시간\s*[:：]\s*(\S+)"),
        re.compile(r"Duration\s*[:：]\s*(\S+)"),
        re.compile(r"(\d+)\s*일"),
        re.compile(r"(\d+)\s*시간")
    ]
    
    in_course_section = False
    
    for para in doc.paragraphs:
        text = para.text.strip()
        if not text:
            continue
            
        # 과정 제목을 찾아 해당 섹션 시작 표시
        if course_title in text and not in_course_section:
            in_course_section = True
            continue
        
        # 다음 과정 제목 또는 섹션으로 넘어가면 종료
        if in_course_section and any(text.startswith(marker) for marker in ["과정 개요", "모듈 1", "1일 차"]):
            break
            
        # 소요 시간 정보 찾기
        if in_course_section:
            for pattern in duration_patterns:
                match = pattern.search(text)
                if match:
                    duration = match.group(1)
                    # 숫자만 추출된 경우 단위 추가
                    if duration.isdigit():
                        if "일" in text:
                            duration += "일"
                        elif "시간" in text:
                            duration += "시간"
                    return normalize_duration(duration)
            
            # 줄에 "소요 시간" 또는 "Duration" 단어가 포함되어 있으면 추출 시도
            if "소요 시간" in text or "Duration" in text:
                parts = re.split(r'[:：\s]', text)
                for i, part in enumerate(parts):
                    if part == "소요" and i+1 < len(parts) and parts[i+1] == "시간" and i+2 < len(parts):
                        if parts[i+2].strip():
                            return normalize_duration(parts[i+2].strip())
    
    return ""


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


def extract_delivery_method_from_text(doc, course_title):
    """텍스트에서 제공 방법 정보 추출"""
    method_patterns = [
        re.compile(r"제공\s*방법\s*[:：]\s*(.+)"),
        re.compile(r"제공\s*방식\s*[:：]\s*(.+)"),
        re.compile(r"Delivery\s*Method\s*[:：]\s*(.+)")
    ]
    
    in_course_section = False
    
    for para in doc.paragraphs:
        text = para.text.strip()
        if not text:
            continue
            
        # 과정 제목을 찾아 해당 섹션 시작 표시
        if course_title in text and not in_course_section:
            in_course_section = True
            continue
        
        # 다음 과정 제목 또는 섹션으로 넘어가면 종료
        if in_course_section and any(text.startswith(marker) for marker in ["과정 개요", "모듈 1", "1일 차"]):
            break
            
        # 제공 방법 정보 찾기
        if in_course_section:
            for pattern in method_patterns:
                match = pattern.search(text)
                if match:
                    return match.group(1).strip()
            
            # 줄에 특정 단어가 포함되어 있으면 추출 시도
            if "제공 방법" in text or "제공 방식" in text or "Delivery Method" in text:
                parts = text.split(':', 1)
                if len(parts) > 1:
                    return parts[1].strip()
    
    # 기본값 제공
    if "Digital Classroom" in course_title:
        return "Digital Classroom"
    return "강의식 교육(ILT)"


def save_courses_to_dynamodb(courses, catalog_table, modules_table, region='us-east-1'):
    """과정 정보와 모듈/실습 정보를 DynamoDB에 저장 - 오류 처리 강화"""
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
        
        # 기본값 설정
        if not course.level or course.level.strip() == "":
            course.level = "미지정"
        if not course.duration or course.duration.strip() == "":
            course.duration = "미지정"
        
        # 과정 항목 생성
        item = {
            'id': course_id,
            'title': course.title,
            'description': course.description if course.description else f"{course.title}에 대한 과정 설명입니다.",
            'deliveryMethod': course.delivery_method if course.delivery_method else "강의실 교육",
            'moduleCount': len(course.modules),
            'labCount': len(course.labs),
            'createdAt': timestamp,
            'updatedAt': timestamp
        }
        
        # GSI로 사용되는 필드에 빈 문자열 대신 기본값 할당
        item['level'] = course.level if course.level else "미지정"
        item['duration'] = course.duration if course.duration else "미지정"
        
        if course.objectives:
            item['objectives'] = course.objectives
        
        if course.audience:
            item['audience'] = course.audience
        
        if course.prerequisites:
            item['prerequisites'] = course.prerequisites
            
        if course.registration_link:
            item['registrationLink'] = course.registration_link
        
        # 저장 시도
        try:
            catalog_table_resource.put_item(Item=item)
        except Exception as e:
            print(f"과정 '{course.title}' 저장 실패: {str(e)}")
    
    # 2. 모듈 및 실습 데이터 저장
    module_count = 0
    lab_count = 0
    
    with tqdm(total=len(courses), desc="모듈 및 실습 데이터 저장", ncols=100) as pbar:
        for course in courses:
            course_id = course_ids.get(course.title)
            if not course_id:
                continue
                
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
            
            pbar.update(1)
    
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


def extract_course_info_from_docx(file_path, course_titles):
    """문서에서 과정 정보 추출 - 개선된 버전"""
    try:
        doc = docx.Document(file_path)
        print(f"문서 '{file_path}' 로드 완료 (총 {len(doc.paragraphs)}개 단락)")
        
        # 문서 구조 확인
        check_document_structure(file_path)
        
        # 결과를 저장할 리스트
        courses_info = []
        
        # 과정 제목 목록 처리
        for course_title in tqdm(course_titles, desc="과정 정보 추출", ncols=100):
            # 새로운 과정 객체 생성
            course = Course(title=course_title)
            
            # 텍스트에서 메타데이터 추출
            level = extract_course_level_from_text(doc, course_title)
            duration = extract_course_duration_from_text(doc, course_title)
            delivery_method = extract_delivery_method_from_text(doc, course_title)
            
            # 과정 객체에 메타데이터 설정
            if level:
                course.level = level
            if duration:
                course.duration = duration
            if delivery_method:
                course.delivery_method = delivery_method
                
            print(f"\n과정: {course_title}")
            print(f"- 레벨: {course.level}")
            print(f"- 제공 방법: {course.delivery_method}")
            print(f"- 소요 시간: {course.duration}")
            
            # 모듈과 실습 추출
            try:
                detailed_course = extract_course_modules_and_labs(doc, course_title, course_titles, course)
                
                # 추출 결과가 있으면 객체 업데이트
                course = detailed_course
                    
            except Exception as e:
                print(f"  '{course_title}' 과정의 모듈/실습 추출 중 오류 발생: {str(e)}")
                import traceback
                traceback.print_exc()
            
            courses_info.append(course)
            
        return courses_info
        
    except Exception as e:
        print(f"문서 처리 중 오류 발생: {str(e)}")
        import traceback
        traceback.print_exc()
        return []


def main():
    # 설정값
    COURSE_TABLE = 'Tnc-CourseCatalog'
    MODULE_TABLE = 'Tnc-CourseCatalog-Modules'
    REGION = 'us-east-1'
    DOC_FILE = 'Instuctor.docx'
    
    # 과정명 목록 (요청된 과정명)
    course_titles_text = """Instuctor-led Training (ILT)
Instructor-led Training (ILT) Overview
Advanced AWS Well-Architected Best Practices
Amazon SageMaker Studio for Data Scientists
Architecting on AWS
AWS Cloud Essentials for Business Leaders
AWS Cloud Practitioner Essentials
AWS Migration Essentials
AWS Security Essentials
AWS Technical Essentials
AWS Well-Architected Best Practices
AWS Well-Architected Best Practices (Custom)
Building Batch Data Analytics Solutions on AWS
Building Data Analytics Solutions Using Amazon Redshift
Building Data Lakes on AWS
Build Modern Applications with AWS NoSQL Databases
Building Streaming Data Analytics Solutions on AWS
Cloud Operations on AWS
Data Warehousing on AWS
Designing and Implementing Storage on AWS
Developing Generative AI Applications on AWS
Developing on AWS
Developing Serverless Solutions on AWS
DevOps Engineering on AWS
Generative AI Essentials on AWS
Migrating to AWS
MLOps Engineering on AWS
Networking Essentials for Cloud Applications on AWS
Practical Data Science with Amazon SageMaker
Practical IaC on AWS with Terraform
Running Containers on Amazon Elastic Kubernetes Service (Amazon EKS)
Security Engineering on AWS"""
    
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