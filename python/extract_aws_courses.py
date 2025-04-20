import docx
import re
import boto3
import string
import random
import json
from datetime import datetime
from collections import defaultdict

def generate_short_id(length=6):
    """
    간결한 ID 생성 (6자 알파벳+숫자 조합)
    """
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

def extract_course_data(docx_path):
    """
    .docx 파일에서 과정 정보를 추출하는 함수
    """
    print(f"문서 제목: {docx_path}")
    
    # 문서 열기
    doc = docx.Document(docx_path)
    print(f"문서를 불러왔습니다.")
    print(f"문단 수: {len(doc.paragraphs)}")
    print(f"표 수: {len(doc.tables)}")
    
    # 디버깅: 처음 20개 문단 확인
    print("\n=== 문서 내용 샘플 (처음 20개 문단) ===")
    for i, para in enumerate(doc.paragraphs[:20]):
        text = para.text.strip()
        if text:  # 빈 문단 건너뛰기
            print(f"[문단 {i}] {text[:100]}...")
    
    # 디버깅: 처음 5개 표 구조 확인
    print("\n=== 표 구조 샘플 (처음 5개 표) ===")
    for i, table in enumerate(doc.tables[:5]):
        if len(table.rows) > 0:
            print(f"\n[표 {i}] 행 수: {len(table.rows)}, 열 수: {len(table.rows[0].cells)}")
            # 첫 행 출력
            if len(table.rows) > 0:
                headers = [cell.text.strip() for cell in table.rows[0].cells]
                print(f"  헤더: {headers}")
            # 두 번째 행 출력 (있다면)
            if len(table.rows) > 1:
                values = [cell.text.strip() for cell in table.rows[1].cells]
                print(f"  값: {values}")
    
    # 과정 정보 추출
    course_info = extract_course_information_improved(doc)
    
    # 추출 결과 요약 출력
    print(f"\n=== 추출된 과정 정보 요약 (총 {len(course_info)}개) ===")
    for i, course in enumerate(course_info):
        print(f"{i+1}. {course['courseName']} (ID: {course['courseId']})")
        print(f"   - 모듈: {len(course.get('modules', []))}개")
        print(f"   - 실습: {len(course.get('labs', []))}개")
    
    # DynamoDB 형식으로 데이터 변환
    course_catalog_items, module_lab_items = prepare_dynamodb_items(course_info)
    
    # 파일로 저장
    save_to_json_files(course_catalog_items, module_lab_items)
    
    return course_catalog_items, module_lab_items

def extract_course_information_improved(doc):
    """
    개선된 방식으로 문서에서 과정 정보 추출
    """
    courses = []
    used_ids = set()  # ID 중복 방지
    
    # 2-행 테이블에서 과정명 및 기본 정보 후보 찾기
    course_candidates = []
    
    print("\n=== 2-행 테이블에서 과정 기본 정보 식별 중 ===")
    for i, table in enumerate(doc.tables):
        if len(table.rows) == 2:
            # 이 테이블 앞의 문단에서 과정명 찾기
            course_name = find_course_name_before_table(doc, table, i)
            if course_name:
                # 표에서 메타데이터 추출
                metadata = extract_metadata_from_table(table)
                course_candidates.append({
                    "course_name": course_name,
                    "metadata": metadata,
                    "table_index": i
                })
                print(f"후보 과정 발견: {course_name}")
    
    print(f"총 {len(course_candidates)}개의 과정 후보 식별됨")
    
    # 각 과정 후보에 대해 전체 정보 추출
    for candidate in course_candidates:
        # 고유한 6자리 코스 ID 생성
        course_id = generate_unique_course_id(used_ids)
        used_ids.add(course_id)
        
        course = {
            "courseId": course_id,
            "id": course_id,  # DynamoDB 기본 키로 사용
            "courseName": candidate["course_name"],
            "description": "",
            "level": candidate["metadata"].get("level", ""),
            "duration": candidate["metadata"].get("duration", ""),
            "deliveryMethod": candidate["metadata"].get("delivery_method", ""),
            "objectives": "",
            "audience": "",
            "prerequisites": "",
            "modules": [],
            "labs": [],
            "createdAt": datetime.now().isoformat(),
            "updatedAt": datetime.now().isoformat()
        }
        
        # 이 과정의 섹션 내용 추출
        extract_course_sections(doc, course, candidate["table_index"])
        
        # 모듈과 실습 정보 추출
        extract_modules_and_labs(doc, course, candidate["table_index"])
        
        courses.append(course)
        print(f"과정 정보 추출 완료: {course['courseName']} (ID: {course_id})")
    
    return courses

def generate_unique_course_id(used_ids, length=6):
    """
    중복되지 않는 고유한 코스 ID 생성
    """
    while True:
        new_id = generate_short_id(length)
        if new_id not in used_ids:
            return new_id

def find_course_name_before_table(doc, table, table_idx):
    """
    테이블 앞의 문단에서 과정명 찾기
    """
    # 문서 요소들의 순서 파악
    elements = []
    try:
        # XML을 통해 실제 순서 파악 시도
        all_elements = doc._element.xpath('.//w:p | .//w:tbl')
        table_element = table._element
        table_pos = all_elements.index(table_element)
        
        # 테이블 이전의 문단 중에서 과정명 찾기
        for i in range(table_pos-1, max(0, table_pos-10), -1):
            if i >= 0 and all_elements[i].tag.endswith('p'):
                para = docx.text.paragraph.Paragraph(all_elements[i], doc)
                text = para.text.strip()
                
                if text and len(text) > 5 and len(text) < 100:
                    # AWS 과정명 특징 패턴
                    if any(keyword in text for keyword in ["AWS", "Amazon", "Cloud"]):
                        return text
    except:
        # XML 순서 파악 실패 시 대안적 방법
        # 표 바로 앞의 20개 문단 확인
        for i, para in enumerate(doc.paragraphs):
            # 단순화된 접근법: 각 표 이전의 비어있지 않은 문단 중 가장 가까운 것 선택
            if text := para.text.strip():
                if any(keyword in text for keyword in ["AWS", "Amazon", "Cloud"]) and 5 < len(text) < 100:
                    return text
    
    return None

def extract_metadata_from_table(table):
    """
    2-행 테이블에서 메타데이터(레벨, 소요 시간 등) 추출
    """
    metadata = {}
    
    if len(table.rows) < 2:
        return metadata
    
    # 헤더와 값 추출
    headers = [cell.text.strip().lower() for cell in table.rows[0].cells]
    values = [cell.text.strip() for cell in table.rows[1].cells]
    
    # 일반적인 메타데이터 키워드
    for i, header in enumerate(headers):
        if i < len(values):
            if any(keyword in header for keyword in ["레벨", "수준", "level"]):
                metadata["level"] = values[i]
            elif any(keyword in header for keyword in ["시간", "기간", "duration"]):
                metadata["duration"] = values[i]
            elif any(keyword in header for keyword in ["제공", "방법", "방식", "delivery"]):
                metadata["delivery_method"] = values[i]
    
    return metadata

def extract_course_sections(doc, course, start_table_index):
    """
    과정에 대한 섹션별 내용 추출 (설명, 목표, 대상 등)
    """
    section_patterns = {
        "description": ["과정\s*설명", "코스\s*설명", "과정에\s*대한\s*설명"],
        "objectives": ["과정\s*목표", "학습\s*목표", "교육\s*목표"],
        "audience": ["대상\s*수강생", "수강\s*대상", "교육\s*대상"],
        "prerequisites": ["수강\s*전\s*권장\s*사항", "사전\s*필수\s*조건", "선수\s*지식"]
    }
    
    # 테이블 다음부터 일정 범위의 문단 검색
    section = None
    search_range = min(len(doc.paragraphs), start_table_index + 500)  # 적절한 범위 설정
    
    for i in range(start_table_index, search_range):
        if i < len(doc.paragraphs):
            text = doc.paragraphs[i].text.strip()
            
            if not text:
                continue
                
            # 섹션 헤더 확인
            found_new_section = False
            for sec_name, patterns in section_patterns.items():
                if any(re.search(pattern, text, re.IGNORECASE) for pattern in patterns):
                    section = sec_name
                    found_new_section = True
                    break
            
            if found_new_section:
                continue
                
            # 현재 섹션에 내용 추가
            if section:
                course[section] += text + " "
    
    # 각 필드 정리
    for field in ["description", "objectives", "audience", "prerequisites"]:
        course[field] = course[field].strip()

def extract_module_title_description(text):
    """
    모듈 텍스트에서 타이틀과 설명 분리
    
    Args:
        text: 모듈 텍스트
        
    Returns:
        tuple: (타이틀, 설명)
    """
    # 1. 줄바꿈으로 분리
    if '\n' in text:
        lines = text.split('\n', 1)
        return lines[0].strip(), lines[1].strip()
    
    # 2. 콜론으로 분리 (여러 줄에 걸친 콜론이 아닌 경우만)
    elif ':' in text and len(text.split('\n')) == 1:
        parts = text.split(':', 1)
        return parts[0].strip(), parts[1].strip()
    
    # 3. 분리할 수 없으면 전체를 타이틀로 간주
    else:
        return text.strip(), ""

def extract_modules_and_labs(doc, course, start_table_index):
    """
    과정에 대한 모듈 및 실습 정보 추출 (일차 정보 포함)
    """
    modules = []
    labs = []
    current_day = None
    
    # 모듈, 일차, 실습 패턴
    day_pattern = r'(\d+)일\s*차'
    # 모듈 패턴 - 불릿 포인트 포함
    module_pattern = r'(?:•|\*|-)?\s*모듈\s*(\d+)[:\s-]\s*(.+)'
    lab_pattern = r'(?:•|\*|-)?\s*(실습|핸즈온\s*랩|Lab)[:\s-]?\s*(.+)'
    
    # 설명 불릿 패턴
    desc_bullet_pattern = r'(?:o|○|◦|·|▪)?\s*(.+)'
    
    # 과정 개요 섹션 찾기
    in_outline_section = False
    current_module = None
    current_module_description = []
    
    search_range = min(len(doc.paragraphs), start_table_index + 500)
    
    for i in range(start_table_index, search_range):
        if i < len(doc.paragraphs):
            text = doc.paragraphs[i].text.strip()
            
            if not text:
                continue
                
            # 과정 개요 섹션 확인
            if "과정 개요" in text or "교육 과정 개요" in text:
                in_outline_section = True
                continue
                
            if in_outline_section:
                # 개요 섹션 종료 조건
                if any(pattern in text for pattern in ["과정 마무리", "리소스", "사후 평가"]):
                    in_outline_section = False
                    
                    # 마지막 모듈 추가
                    if current_module and current_module_description:
                        current_module["module_description"] = '\n'.join(current_module_description)
                        modules.append(current_module)
                        current_module = None
                        current_module_description = []
                    
                    break
                    
                # 일차 정보 확인
                day_match = re.search(day_pattern, text)
                if day_match:
                    current_day = day_match.group(1)
                    continue
                
                # 모듈 정보 확인 (불릿 포인트 포함)
                module_match = re.search(module_pattern, text, re.IGNORECASE)
                if module_match:
                    # 이전 모듈이 있으면 저장
                    if current_module:
                        current_module["module_description"] = '\n'.join(current_module_description)
                        modules.append(current_module)
                        current_module_description = []
                        
                    module_num = module_match.group(1)
                    module_text = module_match.group(2).strip()
                    
                    # 모듈 텍스트에서 타이틀과 설명 분리
                    module_title, module_description = extract_module_title_description(module_text)
                    
                    # 새 모듈 생성
                    current_module = {
                        "module_number": module_num,
                        "module_title": module_title,
                        "module_description": "",
                        "day": current_day
                    }
                    
                    # 모듈 설명이 있으면 추가
                    if module_description:
                        current_module_description.append(module_description)
                    continue
                
                # 다음 모듈 또는 다른 섹션이 시작되는지 확인
                if text.startswith('•') or text.startswith('*') or text.startswith('-'):
                    # 새로운 주요 불릿이 시작되고 모듈 또는 실습이 아니면
                    if not any(keyword in text.lower() for keyword in ["모듈", "실습", "핸즈온"]):
                        # 현재 모듈이 있으면 저장하고 다음으로 넘어감
                        if current_module:
                            current_module["module_description"] = '\n'.join(current_module_description)
                            modules.append(current_module)
                            current_module = None
                            current_module_description = []
                
                # 실습 정보 확인
                lab_match = re.search(lab_pattern, text, re.IGNORECASE)
                if lab_match:
                    lab_title = lab_match.group(2).strip()
                    labs.append({
                        "lab_number": extract_lab_number(text),
                        "lab_title": lab_title,
                        "day": current_day
                    })
                    continue
                
                # 현재 모듈이 있으면 설명에 텍스트 추가
                if current_module:
                    # 불릿 포인트 설명 확인
                    desc_match = re.search(desc_bullet_pattern, text)
                    if desc_match:
                        desc_text = desc_match.group(1).strip()
                        
                        # o, ○ 등의 불릿으로 시작하면 들여쓰기 추가
                        if re.match(r'o|○|◦|·|▪', text[:2]):
                            current_module_description.append(f"o\t{desc_text}")
                        else:
                            current_module_description.append(desc_text)
    
    # 마지막 모듈 추가
    if current_module and current_module_description:
        current_module["module_description"] = '\n'.join(current_module_description)
        modules.append(current_module)
    
    # 모듈/실습 테이블 확인
    for i, table in enumerate(doc.tables):
        if i > start_table_index and is_module_table(table):
            table_modules, table_labs = extract_modules_labs_from_table(table, current_day)
            modules.extend(table_modules)
            labs.extend(table_labs)
    
    # 중복 제거 및 모듈 정보 정리
    unique_modules = []
    seen_module_numbers = set()
    
    for module in modules:
        # 모듈 번호 기준으로 중복 제거
        key = f"{module['day']}:{module['module_number']}" if module['day'] else module['module_number']
        
        if key not in seen_module_numbers and module['module_title']:
            seen_module_numbers.add(key)
            unique_modules.append(module)
    
    course["modules"] = unique_modules
    course["labs"] = labs

def is_module_table(table):
    """
    테이블이 모듈 정보를 포함하고 있는지 확인
    """
    if len(table.rows) < 2:
        return False
        
    # 헤더 행의 셀 텍스트 확인
    header_texts = ' '.join([cell.text.lower().strip() for cell in table.rows[0].cells])
    
    # 모듈 관련 키워드 확인
    module_keywords = ['모듈', '주제', '내용', '실습']
    return any(keyword in header_texts for keyword in module_keywords)

def extract_modules_labs_from_table(table, current_day=None):
    """
    테이블에서 모듈과 실습 정보 추출 (일차 정보 포함)
    """
    headers = [cell.text.strip().lower() for cell in table.rows[0].cells]
    
    # 헤더에서 모듈, 내용, 설명, 실습, 일차 열의 인덱스 찾기
    module_index = None
    title_index = None
    description_index = None
    lab_index = None
    day_index = None
    
    for i, header in enumerate(headers):
        if '모듈' in header:
            module_index = i
        elif any(word in header for word in ['제목', '주제']):
            title_index = i
        elif any(word in header for word in ['설명', '내용', '세부 내용']):
            description_index = i
        elif '실습' in header:
            lab_index = i
        elif '일차' in header or 'day' in header:
            day_index = i
    
    modules = []
    labs = []
    
    # 데이터 행 처리
    for row in table.rows[1:]:
        cells = [cell.text.strip() for cell in row.cells]
        
        # 빈 행 건너뛰기
        if not any(cells):
            continue
            
        # 행에서 일차 정보 추출
        row_day = None
        if day_index is not None and day_index < len(cells):
            day_text = cells[day_index]
            day_match = re.search(r'(\d+)[일차]*', day_text)
            if day_match:
                row_day = day_match.group(1)
        
        # 일차 정보가 없으면 현재 일차 사용
        day = row_day or current_day
            
        # 모듈 정보 추출
        if module_index is not None and module_index < len(cells):
            module_text = cells[module_index]
            if module_text:
                # 모듈 번호 추출
                module_number = extract_module_number(module_text)
                
                # 모듈 제목과 설명
                module_title = ""
                module_description = ""
                
                # 제목과 설명이 별도 열에 있는 경우
                if title_index is not None and title_index < len(cells):
                    module_title = cells[title_index].strip()
                    
                    if description_index is not None and description_index < len(cells):
                        module_description = cells[description_index].strip()
                # 제목과 설명이 모듈 열에 함께 있는 경우
                elif ":" in module_text or "\n" in module_text:
                    module_title, module_description = extract_module_title_description(module_text)
                # 그 외 제목만 있는 경우
                else:
                    module_title = module_text.strip()
                
                # 불릿 포인트 형식 처리
                if module_description:
                    formatted_desc = []
                    for line in module_description.split('\n'):
                        line = line.strip()
                        if line.startswith('o') or line.startswith('○') or line.startswith('•'):
                            formatted_desc.append(f"o\t{line[1:].strip()}")
                        else:
                            formatted_desc.append(line)
                    module_description = '\n'.join(formatted_desc)
                
                modules.append({
                    "module_number": module_number,
                    "module_title": module_title,
                    "module_description": module_description,
                    "day": day
                })
        
        # 실습 정보 추출
        if lab_index is not None and lab_index < len(cells):
            lab_content = cells[lab_index]
            if lab_content:
                labs.append({
                    "lab_number": extract_lab_number(lab_content),
                    "lab_title": lab_content,
                    "day": day
                })
    
    return modules, labs

def extract_module_number(module_text):
    """
    모듈 텍스트에서 숫자 추출
    """
    match = re.search(r'(\d+)', module_text)
    return match.group(1) if match else "N/A"

def extract_lab_number(lab_text):
    """
    실습 텍스트에서 숫자 추출
    """
    match = re.search(r'(\d+)', lab_text)
    return match.group(1) if match else "N/A"

def prepare_dynamodb_items(courses):
    """
    추출된 과정 정보를 DynamoDB 테이블 형식으로 변환
    """
    course_catalog_items = []
    module_lab_items = []
    
    for course in courses:
        course_id = course["courseId"]
        
        # 1. Tnc-CourseCatalog 테이블용 아이템
        course_item = {
            'id': course_id,
            'courseId': course_id,
            'courseName': course['courseName'],
            'description': course['description'],
            'level': course['level'],
            'duration': course['duration'],
            'deliveryMethod': course.get('deliveryMethod', ''),
            'objectives': course['objectives'],
            'audience': course['audience'],
            'prerequisites': course['prerequisites'],
            'createdAt': course['createdAt'],
            'updatedAt': course['updatedAt']
        }
        course_catalog_items.append(course_item)
        
        # 2. Tnc-CourseCatalog-Modules 테이블용 아이템
        # 모듈 정보
        for i, module in enumerate(course.get('modules', [])):
            module_id = f"{course_id}#module#{i+1}"
            module_item = {
                'id': module_id,
                'courseId': course_id,
                'courseName': course['courseName'],
                'moduleNumber': module['module_number'],
                'moduleTitle': module['module_title'],
                'moduleDescription': module.get('module_description', ''),
                'day': module.get('day', ''),
                'type': 'module',
                'createdAt': course['createdAt'],
                'updatedAt': course['updatedAt']
            }
            module_lab_items.append(module_item)
        
        # 실습 정보
        for i, lab in enumerate(course.get('labs', [])):
            lab_id = f"{course_id}#lab#{i+1}"
            lab_item = {
                'id': lab_id,
                'courseId': course_id,
                'courseName': course['courseName'],
                'labNumber': lab['lab_number'],
                'labTitle': lab['lab_title'],
                'day': lab.get('day', ''),
                'type': 'lab',
                'createdAt': course['createdAt'],
                'updatedAt': course['updatedAt']
            }
            module_lab_items.append(lab_item)
    
    return course_catalog_items, module_lab_items

def save_to_json_files(course_catalog_items, module_lab_items, courses):
    """
    추출된 정보를 JSON 파일로 저장
    """
    # JSON 직렬화 처리를 위한 도우미 함수
    def json_serial(obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        raise TypeError(f"Type {type(obj)} not serializable")
    
    # 1. 과정 카탈로그 정보 저장
    with open('courses_catalog.json', 'w', encoding='utf-8') as f:
        json.dump(course_catalog_items, f, ensure_ascii=False, indent=2, default=json_serial)
    
    # 2. 모듈/실습 정보 저장 (DynamoDB 형식)
    with open('courses_modules_labs.json', 'w', encoding='utf-8') as f:
        json.dump(module_lab_items, f, ensure_ascii=False, indent=2, default=json_serial)
    
    # 3. 원본 형식의 모듈 정보 저장
    modules_data = []
    for course in courses:
        for module in course.get('modules', []):
            modules_data.append({
                'courseId': course['courseId'],
                'courseName': course['courseName'],
                'moduleNumber': module['module_number'],
                'moduleTitle': module['module_title'],
                'moduleDescription': module.get('module_description', ''),
                'day': module.get('day', '')
            })
    
    with open('modules_original.json', 'w', encoding='utf-8') as f:
        json.dump(modules_data, f, ensure_ascii=False, indent=2, default=json_serial)
    
    # 4. 원본 형식의 실습 정보 저장
    labs_data = []
    for course in courses:
        for lab in course.get('labs', []):
            labs_data.append({
                'courseId': course['courseId'],
                'courseName': course['courseName'],
                'labNumber': lab['lab_number'],
                'labTitle': lab['lab_title'],
                'day': lab.get('day', '')
            })
    
    with open('labs_original.json', 'w', encoding='utf-8') as f:
        json.dump(labs_data, f, ensure_ascii=False, indent=2, default=json_serial)
    
    print(f"\n파일 저장 완료:")
    print(f"- 과정 카탈로그: courses_catalog.json ({len(course_catalog_items)}개 항목)")
    print(f"- 모듈/실습 정보(DynamoDB): courses_modules_labs.json ({len(module_lab_items)}개 항목)")
    print(f"- 모듈 정보(원본): modules_original.json ({len(modules_data)}개 항목)")
    print(f"- 실습 정보(원본): labs_original.json ({len(labs_data)}개 항목)")

def main():
    """메인 실행 함수"""
    try:
        # 문서 파일 경로 설정
        import sys
        if len(sys.argv) > 1:
            file_path = sys.argv[1]
        else:
            file_path = 'AWS TnC_ILT_DILT.docx'  # 기본 파일 이름
        
        # 과정 정보 추출 및 파일로 저장
        course_catalog_items, module_lab_items = extract_course_data(file_path)
        
        # 추출된 데이터 요약 표시
        print("\n=== 추출된 모듈 샘플 (첫 3개) ===")
        for item in module_lab_items[:3]:
            if item['type'] == 'module':
                print(f"과정: {item['courseName']}")
                print(f"모듈 번호: {item['moduleNumber']}")
                print(f"모듈 제목: {item['moduleTitle']}")
                print(f"모듈 설명: {item['moduleDescription'][:100]}...")
                print(f"일차: {item['day']}")
                print("---")
        
        # JSON 파일 저장 후 확인 단계 수행
        if course_catalog_items and module_lab_items:
            response = input("\nDynamoDB에 업로드하시겠습니까? (y/n): ")
            if response.lower() == 'y':
                upload_to_dynamodb(course_catalog_items, module_lab_items)
            else:
                print("DynamoDB 업로드를 건너뛰었습니다. JSON 파일만 저장되었습니다.")
        else:
            print("추출된 정보가 없어 DynamoDB에 업로드하지 않았습니다.")
        
    except Exception as e:
        print(f"오류 발생: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()