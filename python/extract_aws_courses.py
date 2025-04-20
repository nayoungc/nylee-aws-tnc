import docx
import re
import boto3
import uuid
import json
from datetime import datetime
from collections import defaultdict

def extract_course_data(docx_path):
    """
    .docx 파일에서 과정 정보를 추출하는 함수
    
    Args:
        docx_path (str): .docx 파일 경로
        
    Returns:
        tuple: (과정 정보 목록, 모듈/실습 정보 목록)
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
        print(f"{i+1}. {course['courseName']}")
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
    
    Args:
        doc: 문서 객체
        
    Returns:
        list: 과정 정보 목록
    """
    courses = []
    
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
        course_id = str(uuid.uuid4())
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
        print(f"과정 정보 추출 완료: {course['courseName']}")
    
    return courses

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

def extract_modules_and_labs(doc, course, start_table_index):
    """
    과정에 대한 모듈 및 실습 정보 추출
    """
    modules = []
    labs = []
    
    # 모듈 및 실습 패턴
    module_patterns = [
        r'모듈\s*(\d+)[:\s-]\s*(.+?)(?=\n|\$)',
        r'Module\s*(\d+)[:\s-]\s*(.+?)(?=\n|\$)',
        r'(\d+)일\s*차\s*[:：]?\s*(.+?)(?=\n|\$)'
    ]
    
    lab_patterns = [
        r'실습\s*(\d+)[:\s-]\s*(.+?)(?=\n|\$)',
        r'Lab\s*(\d+)[:\s-]\s*(.+?)(?=\n|\$)',
        r'핸즈온\s*랩\s*(\d*)[:\s-]?\s*(.+?)(?=\n|\$)'
    ]
    
    # 과정 개요 섹션 찾기
    in_outline_section = False
    search_range = min(len(doc.paragraphs), start_table_index + 500)
    
    for i in range(start_table_index, search_range):
        if i < len(doc.paragraphs):
            text = doc.paragraphs[i].text.strip()
            
            # 과정 개요 섹션 확인
            if "과정 개요" in text or "교육 과정 개요" in text:
                in_outline_section = True
                continue
                
            if in_outline_section:
                # 개요 섹션 종료 조건
                if any(pattern in text for pattern in ["과정 마무리", "리소스", "사후 평가"]):
                    in_outline_section = False
                    break
                
                # 모듈 및 실습 정보 추출
                for pattern in module_patterns:
                    for match in re.finditer(pattern, text, re.IGNORECASE):
                        module_num = match.group(1)
                        module_title = match.group(2).strip()
                        if module_title and len(module_title) < 200:
                            modules.append({
                                "module_number": module_num,
                                "module_title": module_title
                            })
                
                for pattern in lab_patterns:
                    for match in re.finditer(pattern, text, re.IGNORECASE):
                        lab_num = match.group(1) if match.group(1) else "N/A"
                        lab_title = match.group(2).strip()
                        if lab_title and len(lab_title) < 200:
                            labs.append({
                                "lab_number": lab_num,
                                "lab_title": lab_title
                            })
    
    # 모듈/실습 테이블 확인
    for i, table in enumerate(doc.tables):
        if i > start_table_index and is_module_table(table):
            table_modules, table_labs = extract_modules_labs_from_table(table)
            modules.extend(table_modules)
            labs.extend(table_labs)
    
    # 중복 제거
    unique_modules = []
    seen_module_titles = set()
    for module in modules:
        key = f"{module['module_number']}:{module['module_title']}"
        if key not in seen_module_titles:
            seen_module_titles.add(key)
            unique_modules.append(module)
    
    unique_labs = []
    seen_lab_titles = set()
    for lab in labs:
        key = f"{lab['lab_number']}:{lab['lab_title']}"
        if key not in seen_lab_titles:
            seen_lab_titles.add(key)
            unique_labs.append(lab)
    
    course["modules"] = unique_modules
    course["labs"] = unique_labs

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

def extract_modules_labs_from_table(table):
    """
    테이블에서 모듈과 실습 정보 추출
    """
    headers = [cell.text.strip().lower() for cell in table.rows[0].cells]
    
    # 헤더에서 모듈과 실습 열의 인덱스 찾기
    module_index = None
    module_content_index = None
    lab_index = None
    
    for i, header in enumerate(headers):
        if '모듈' in header:
            module_index = i
        elif any(word in header for word in ['주제', '내용', '제목']):
            module_content_index = i
        elif '실습' in header:
            lab_index = i
    
    modules = []
    labs = []
    
    # 데이터 행 처리
    for row in table.rows[1:]:
        cells = [cell.text.strip() for cell in row.cells]
        
        # 빈 행 건너뛰기
        if not any(cells):
            continue
            
        # 모듈 정보 추출
        if module_index is not None and module_index < len(cells):
            module_name = cells[module_index]
            if module_name:
                module_content = ""
                if module_content_index is not None and module_content_index < len(cells):
                    module_content = cells[module_content_index]
                
                modules.append({
                    "module_number": extract_module_number(module_name),
                    "module_title": module_content or module_name
                })
        
        # 실습 정보 추출
        if lab_index is not None and lab_index < len(cells):
            lab_content = cells[lab_index]
            if lab_content:
                labs.append({
                    "lab_number": extract_lab_number(lab_content),
                    "lab_title": lab_content
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
    
    Args:
        courses: 추출된 과정 정보 목록
        
    Returns:
        tuple: (과정 카탈로그 아이템 목록, 모듈/실습 아이템 목록)
    """
    course_catalog_items = []
    module_lab_items = []
    
    for course in courses:
        course_id = course["courseId"]
        
        # 1. Tnc-CourseCatalog 테이블용 아이템
        course_item = {
            'id': course_id,  # 기본 키
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
                'id': module_id,  # 기본 키
                'courseId': course_id,
                'courseName': course['courseName'],
                'moduleNumber': module['module_number'],
                'moduleTitle': module['module_title'],
                'type': 'module',
                'createdAt': course['createdAt'],
                'updatedAt': course['updatedAt']
            }
            module_lab_items.append(module_item)
        
        # 실습 정보
        for i, lab in enumerate(course.get('labs', [])):
            lab_id = f"{course_id}#lab#{i+1}"
            lab_item = {
                'id': lab_id,  # 기본 키
                'courseId': course_id,
                'courseName': course['courseName'],
                'labNumber': lab['lab_number'],
                'labTitle': lab['lab_title'],
                'type': 'lab',
                'createdAt': course['createdAt'],
                'updatedAt': course['updatedAt']
            }
            module_lab_items.append(lab_item)
    
    return course_catalog_items, module_lab_items

def save_to_json_files(course_catalog_items, module_lab_items):
    """
    추출된 정보를 JSON 파일로 저장
    
    Args:
        course_catalog_items: 과정 카탈로그 아이템 목록
        module_lab_items: 모듈/실습 아이템 목록
    """
    # JSON 직렬화 처리를 위한 도우미 함수
    def json_serial(obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        raise TypeError(f"Type {type(obj)} not serializable")
    
    # 1. 과정 카탈로그 정보 저장
    with open('courses_catalog.json', 'w', encoding='utf-8') as f:
        json.dump(course_catalog_items, f, ensure_ascii=False, indent=2, default=json_serial)
    
    # 2. 모듈/실습 정보 저장
    with open('courses_modules_labs.json', 'w', encoding='utf-8') as f:
        json.dump(module_lab_items, f, ensure_ascii=False, indent=2, default=json_serial)
    
    print(f"\n파일 저장 완료:")
    print(f"- 과정 카탈로그: courses_catalog.json ({len(course_catalog_items)}개 항목)")
    print(f"- 모듈/실습 정보: courses_modules_labs.json ({len(module_lab_items)}개 항목)")

def upload_to_dynamodb(course_catalog_items, module_lab_items):
    """
    아이템을 DynamoDB 테이블에 업로드
    
    Args:
        course_catalog_items: Tnc-CourseCatalog 테이블용 아이템 목록
        module_lab_items: Tnc-CourseCatalog-Modules 테이블용 아이템 목록
    """
    try:
        # DynamoDB 클라이언트 초기화
        dynamodb = boto3.resource('dynamodb')
        course_table = dynamodb.Table('Tnc-CourseCatalog')
        module_table = dynamodb.Table('Tnc-CourseCatalog-Modules')
        
        print("\n=== DynamoDB 업로드 중 ===")
        
        # 1. 과정 카탈로그 정보 업로드
        for item in course_catalog_items:
            course_table.put_item(Item=item)
        print(f"{len(course_catalog_items)}개 과정 정보 업로드 완료")
        
        # 2. 모듈/실습 정보 업로드
        for item in module_lab_items:
            module_table.put_item(Item=item)
        print(f"{len(module_lab_items)}개 모듈/실습 정보 업로드 완료")
        
        print("\nDynamoDB 업로드 완료!")
        
    except Exception as e:
        print(f"DynamoDB 업로드 중 오류 발생: {str(e)}")
        import traceback
        traceback.print_exc()

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