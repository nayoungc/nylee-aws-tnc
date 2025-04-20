import docx
import pandas as pd
import re
import json
import uuid
from datetime import datetime
import time
from collections import defaultdict  # 이 라인 추가

def extract_course_outline_with_modules_labs(file_path):
    """
    .docx 파일에서 과정 개요를 추출하고, 모듈 및 실습 정보를 파싱하는 함수
    
    Args:
        file_path (str): .docx 파일 경로
        
    Returns:
        dict: 과정별 개요, 모듈, 실습 정보
    """
    print(f"문서 제목: {file_path}")
    
    # 문서 열기
    doc = docx.Document(file_path)
    print(f"문서를 불러왔습니다.")
    print(f"문단 수: {len(doc.paragraphs)}")
    print(f"표 수: {len(doc.tables)}")
    
    # 결과를 저장할 딕셔너리
    result = {
        "course_outlines": {},  # 과정별 개요 전체 내용
        "courses": [],          # 과정 기본 정보
        "all_modules": {},      # 과정별 모듈 정보
        "all_labs": {}          # 과정별 실습 정보
    }
    
    # 과정명 추출을 위해 2줄짜리 표 찾기
    courses = extract_course_names_from_tables(doc)
    print(f"추출된 과정 수: {len(courses)}")
    
    # 고유한 과정명 목록 생성
    unique_course_names = []
    for course in courses:
        if course["course_name"] not in unique_course_names and course["course_name"] != "과정명 추출 실패":
            if "Digital Classroom" not in course["course_name"]:
                unique_course_names.append(course["course_name"])
    
    result["courses"] = courses
    
    print("\n### 과정 개요 및 모듈/실습 정보 추출 중 ###")
    
    # 과정 개요와 모듈/실습 정보 추출
    outlines_with_modules_labs = extract_outlines_with_modules_labs(doc, unique_course_names)
    
    result["course_outlines"] = outlines_with_modules_labs["outlines"]
    result["all_modules"] = outlines_with_modules_labs["modules"]
    result["all_labs"] = outlines_with_modules_labs["labs"]
    
    return result

def extract_course_names_from_tables(doc):
    """
    2줄짜리 표에서 과정명 추출
    """
    courses = []
    
    # 문서 요소 순차적으로 추출 (문단과 표의 실제 순서 파악)
    doc_elements = []
    for para_idx, para in enumerate(doc.paragraphs):
        doc_elements.append(("para", para_idx, para))
    for table_idx, table in enumerate(doc.tables):
        doc_elements.append(("table", table_idx, table))
    
    # 실제 문서 순서대로 요소 정렬
    try:
        all_elements_xml = doc._element.xpath('.//w:p | .//w:tbl')
        doc_elements.sort(key=lambda x: all_elements_xml.index(x[2]._element if x[0] == "para" else x[2]._element))
    except Exception as e:
        print(f"요소 정렬 중 오류: {e}")
        print("문서 요소를 원래 순서대로 유지합니다.")
    
    for i, (elem_type, elem_idx, elem) in enumerate(doc_elements):
        if elem_type == "table" and len(elem.rows) == 2:
            table = elem
            table_idx = elem_idx
            
            # 과정명 추출: 표 바로 직전 문단 확인
            course_name = "과정명 추출 실패"
            for j in range(i-1, max(0, i-5), -1):  # 최대 4개 이전 요소 확인
                if j >= 0 and doc_elements[j][0] == "para":
                    prev_para = doc_elements[j][2]
                    text = prev_para.text.strip()
                    
                    # 빈 문단 건너뛰기
                    if not text:
                        continue
                        
                    # AWS 과정명 패턴 확인
                    if is_aws_course_name(text):
                        course_name = text
                        #print(f"과정명 발견: '{course_name}'")
                        break
            
            # Digital Classroom 과정 제외
            if "Digital Classroom" in course_name:
                # print(f"Digital Classroom 과정 제외: '{course_name}'")
                continue
                
            try:
                # 표 데이터 추출
                headers = []
                values = []
                
                # 첫 번째 행 (헤더)
                for cell in table.rows[0].cells:
                    headers.append(cell.text.strip())
                
                # 두 번째 행 (값)
                for cell in table.rows[1].cells:
                    values.append(cell.text.strip())
                
                # 레벨과 소요 시간 정보 찾기
                level = None
                duration = None
                delivery_method = None
                
                # 헤더와 값을 순회하며 찾기
                for k, header in enumerate(headers):
                    if k < len(values):  # 인덱스 범위 확인
                        header_lower = header.lower()
                        if "레벨" in header_lower or "수준" in header_lower:
                            level = values[k]
                        elif "소요 시간" in header_lower or "기간" in header_lower or "duration" in header_lower:
                            duration = values[k]
                        elif "제공 방법" in header_lower or "제공 방식" in header_lower:
                            delivery_method = values[k]
                
                # 결과 저장
                course_info = {
                    "table_index": table_idx,
                    "course_name": course_name,
                    "level": level,
                    "duration": duration,
                    "delivery_method": delivery_method
                }
                
                courses.append(course_info)
                
            except Exception as e:
                print(f"표 {table_idx+1} 처리 중 오류 발생: {str(e)}")
    
    return courses

def extract_outlines_with_modules_labs(doc, course_names):
    """
    문서에서 과정 개요, 모듈 및 실습 정보를 함께 추출
    
    Args:
        doc: 문서 객체
        course_names: 과정명 목록
        
    Returns:
        dict: 과정별 개요, 모듈, 실습 정보
    """
    outlines = {}
    all_modules = {}
    all_labs = {}
    
    # 과정 개요 및 관련 섹션 패턴
    outline_patterns = {
        "start": [r'과정\s*개요', r'교육\s*과정\s*개요'],
        "end": [r'과정\s*마무리', r'리소스', r'사후\s*평가', r'모듈\s*15', r'모듈\s*16']
    }
    
    # 모듈 및 실습 패턴
    module_patterns = [
        r'^모듈\s*(\d+)[:\s-]\s*(.+)',              # 모듈 1: 제목
        r'^Module\s*(\d+)[:\s-]\s*(.+)',            # Module 1: 제목
        r'^(\d+)일\s*차\s*[:：]?\s*(.+)'           # 1일 차: 제목
    ]
    
    lab_patterns = [
        r'^실습\s*(\d+)[:\s-]\s*(.+)',              # 실습 1: 제목
        r'^Lab\s*(\d+)[:\s-]\s*(.+)',               # Lab 1: 제목
        r'^핸즈온\s*랩\s*(\d*)[:\s-]?\s*(.+)'      # 핸즈온랩: 제목
    ]
    
    # 현재 처리 중인 과정과 상태
    current_course = None
    collecting_outline = False
    current_outline = []
    
    # 각 과정별 모듈 및 실습 정보
    course_modules = defaultdict(list)
    course_labs = defaultdict(list)
    
    # 1차 과정 개요 추출
    print("\n=== 과정 개요 섹션 추출 중 ===")
    
    for para in doc.paragraphs:
        text = para.text.strip()
        print(f"text = {text}")
        if not text:
            continue
        
        # 과정명 확인
        matched_course = None
        if is_aws_course_name(text):
            for course_name in course_names:
                if text == course_name or (len(course_name) > 10 and (course_name in text or text in course_name)):
                    matched_course = course_name
                    break
        
        # 새 과정 발견
        if matched_course:
            # 이전 과정의 개요 저장
            if current_course and collecting_outline and current_outline:
                outline_text = '\n'.join(current_outline)
                outlines[current_course] = outline_text
                
                # 개요에서 모듈과 실습 정보 추출
                modules, labs = extract_modules_labs_from_outline(outline_text)
                if modules:
                    course_modules[current_course] = modules
                if labs:
                    course_labs[current_course] = labs
            
            current_course = matched_course
            collecting_outline = False
            current_outline = []
            continue
        
        # 개요 섹션 시작 확인
        if current_course and not collecting_outline:
            for pattern in outline_patterns["start"]:
                if re.search(pattern, text, re.IGNORECASE):
                    collecting_outline = True
                    print(f"'{current_course}' 과정 개요 추출 시작")
                   
                    break
            
            if collecting_outline:
                continue  # 시작 헤더는 개요에 포함하지 않음
        
        # 개요 섹션 끝 확인
        if current_course and collecting_outline:
            end_section = False
            for pattern in outline_patterns["end"]:
                if re.search(pattern, text, re.IGNORECASE) and not any(re.match(p, text, re.IGNORECASE) for p in sum([module_patterns, lab_patterns], [])):
                    end_section = True
                    break
            
            if end_section:
                collecting_outline = False
                print(f"'{current_course}' 과정 개요 추출 완료")
                continue
        
        # 개요 내용 수집
        if current_course and collecting_outline:
            current_outline.append(text)
    
    # 마지막 과정의 개요 저장
    if current_course and collecting_outline and current_outline:
        outline_text = '\n'.join(current_outline)
        outlines[current_course] = outline_text
        
        # 개요에서 모듈과 실습 정보 추출
        modules, labs = extract_modules_labs_from_outline(outline_text)
        if modules:
            course_modules[current_course] = modules
        if labs:
            course_labs[current_course] = labs
    
    # 2차 모듈 및 실습 정보 직접 추출 및 확인
    print("\n=== 모듈 및 실습 정보 추출 중 ===")
    
    for course_name, outline in outlines.items():
        print(f"outline = {outline}")
         
        # 이미 추출된 정보가 있는지 확인
        if course_name not in course_modules or not course_modules[course_name]:
            # 개요에서 직접 추출 시도
            modules, labs = extract_modules_labs_from_outline(outline)
            if modules:
                print(f"'{course_name}'에서 {len(modules)}개 모듈 추출")
                course_modules[course_name] = modules
            if labs:
                print(f"'{course_name}'에서 {len(labs)}개 실습 추출")
                course_labs[course_name] = labs
    
    # 결과 저장
    all_modules.update(course_modules)
    all_labs.update(course_labs)
    
    # 모듈 및 실습 정보 요약 출력
    print("\n=== 추출된 모듈 및 실습 정보 요약 ===")
    modules_count = sum(len(modules) for modules in course_modules.values())
    labs_count = sum(len(labs) for labs in course_labs.values())
    print(f"총 {len(course_modules)}개 과정에서 {modules_count}개 모듈과 {labs_count}개 실습 추출")
    
    return {
        "outlines": outlines,
        "modules": course_modules,
        "labs": course_labs
    }

def extract_modules_labs_from_outline(outline_text):
    """
    과정 개요 텍스트에서 모듈 및 실습 정보를 추출
    
    Args:
        outline_text (str): 과정 개요 텍스트
        
    Returns:
        tuple: (모듈 목록, 실습 목록)
    """
    modules = []
    labs = []
    
    # 모듈 패턴
    module_patterns = [
        r'^모듈\s*(\d+)[:\s-]\s*(.+)',              # 모듈 1: 제목
        r'^Module\s*(\d+)[:\s-]\s*(.+)',            # Module 1: 제목
        r'^(\d+)일\s*차\s*[:：]?\s*(.+)'           # 1일 차: 제목
    ]
    
    # 실습 패턴
    lab_patterns = [
        r'^실습\s*(\d+)[:\s-]\s*(.+)',              # 실습 1: 제목
        r'^Lab\s*(\d+)[:\s-]\s*(.+)',               # Lab 1: 제목
        r'^핸즈온\s*랩\s*(\d*)[:\s-]?\s*(.+)'      # 핸즈온랩: 제목
    ]
    
    lines = outline_text.split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # 모듈 패턴 확인
        for pattern in module_patterns:
            match = re.match(pattern, line, re.IGNORECASE)
            if match:
                module_num = match.group(1)
                module_title = match.group(2).strip()
                
                # 모듈명이 너무 길거나 불릿 포인트로 시작하면 제외
                if len(module_title) < 200 and not module_title.startswith('•'):
                    modules.append({
                        "module_number": module_num,
                        "module_title": module_title
                    })
                break
        
        # 실습 패턴 확인
        for pattern in lab_patterns:
            match = re.match(pattern, line, re.IGNORECASE)
            if match:
                lab_num = match.group(1) if match.group(1) else "N/A"
                lab_title = match.group(2).strip()
                
                # 실습명이 너무 길거나 불릿 포인트로 시작하면 제외
                if len(lab_title) < 200 and not lab_title.startswith('•'):
                    labs.append({
                        "lab_number": lab_num,
                        "lab_title": lab_title
                    })
                break
    
    return modules, labs

def is_aws_course_name(text):
    """
    텍스트가 AWS 과정명인지 확인
    
    Args:
        text: 확인할 텍스트
        
    Returns:
        bool: AWS 과정명 여부
    """
    # 과정명으로 볼 수 있는 조건
    if not text or len(text) < 5 or len(text) > 100:
        return False
    
    # 1. 일반적인 제외 패턴
    exclude_patterns = [
        r'^모듈',
        r'^실습',
        r'^•',
        r'^-',
        r'^참고:',
        r'^주의:',
        r'^과정 설명',
        r'^Digital Classroom',  # Digital Classroom으로 시작하는 경우
    ]
    
    for pattern in exclude_patterns:
        if re.match(pattern, text):
            return False
    
    # 2. AWS 과정명 패턴 확인 (우선순위 순)
    aws_patterns = [
        r'^AWS .+',                 # AWS로 시작하는 과정명
        r'^Amazon .+',              # Amazon으로 시작하는 과정명
        r'.+ on AWS\$',              # on AWS로 끝나는 과정명
        r'.*AWS.*',                 # AWS가 포함된 과정명
        r'.*Amazon.*',              # Amazon이 포함된 과정명
        r'.*Cloud.*',               # Cloud가 포함된 과정명
    ]
    
    for pattern in aws_patterns:
        if re.match(pattern, text):
            return True
    
    return False

def save_to_files(result):
    """
    추출된 데이터를 파일로 저장
    
    Args:
        result: 추출된 정보
    """
    courses = result["courses"]
    course_outlines = result["course_outlines"]
    all_modules = result["all_modules"]
    all_labs = result["all_labs"]
    
    # Digital Classroom 과정 필터링
    filtered_courses = [info for info in courses if "Digital Classroom" not in info["course_name"]]
    
    # 1. 과정 정보 (courses_info.json)
    courses_data = []
    for info in filtered_courses:
        course_name = info["course_name"]
        if course_name == "과정명 추출 실패":
            continue
        
        # 과정 개요 가져오기
        outline = course_outlines.get(course_name, "")
        print(f"과정 개요 : {outline}")

        course_dict = {
            "courseId": str(uuid.uuid4()),  # 각 과정에 고유 ID 부여
            "courseName": course_name,
            "level": info["level"] if info["level"] else "",
            "duration": info["duration"] if info["duration"] else "",
            "deliveryMethod": info["delivery_method"] if info.get("delivery_method") else "",
            "outline": outline,
            "createdAt": datetime.now().isoformat(),
            "updatedAt": datetime.now().isoformat()
        }
        courses_data.append(course_dict)
    
    # 2. 모듈과 실습 정보 (modules_labs_info.json)
    modules_labs_data = []
    
    print(f"courses_data : {courses_data}")
    # 모든 과정에 대해 모듈과 실습 정보 추가
    for course_dict in courses_data:
        course_name = course_dict["courseName"]
        course_id = course_dict["courseId"]
        
        # 모듈 정보 추가
        if course_name in all_modules:
            for idx, module in enumerate(all_modules[course_name]):
                module_id = f"{course_id}#module#{idx+1}"
                module_item = {
                    "courseId": course_id,
                    "id": module_id,
                    "courseName": course_name,
                    "moduleNumber": module["module_number"],
                    "moduleTitle": module["module_title"],
                    "type": "module",
                    "createdAt": datetime.now().isoformat(),
                    "updatedAt": datetime.now().isoformat()
                }
                modules_labs_data.append(module_item)
        
        # 실습 정보 추가
        if course_name in all_labs:
            for idx, lab in enumerate(all_labs[course_name]):
                lab_id = f"{course_id}#lab#{idx+1}"
                lab_item = {
                    "courseId": course_id,
                    "id": lab_id,
                    "courseName": course_name,
                    "labNumber": lab["lab_number"],
                    "labTitle": lab["lab_title"],
                    "type": "lab",
                    "createdAt": datetime.now().isoformat(),
                    "updatedAt": datetime.now().isoformat()
                }
                modules_labs_data.append(lab_item)
    
    # JSON 형식으로 저장
    with open("courses_info.json", "w", encoding="utf-8") as f:
        json.dump(courses_data, f, ensure_ascii=False, indent=2)
    print(f"과정 정보를 'courses_info.json'에 저장했습니다. (총 {len(courses_data)}개 과정)")
    
    with open("modules_labs_info.json", "w", encoding="utf-8") as f:
        json.dump(modules_labs_data, f, ensure_ascii=False, indent=2)
    print(f"모듈과 실습 정보를 'modules_labs_info.json'에 저장했습니다. (총 {len(modules_labs_data)}개 항목)")
    
    # 디버깅용 추가 정보 저장
    # 개요 전체 내용과 추출된 모듈/실습 정보 저장
    debug_data = {
        "outlines": {},
        "extracted_modules": {},
        "extracted_labs": {}
    }
    
    for course_name in all_modules.keys():
        if course_name in course_outlines:
            debug_data["outlines"][course_name] = course_outlines[course_name]
            debug_data["extracted_modules"][course_name] = all_modules.get(course_name, [])
            debug_data["extracted_labs"][course_name] = all_labs.get(course_name, [])
    
    with open("debug_outlines_modules_labs.json", "w", encoding="utf-8") as f:
        json.dump(debug_data, f, ensure_ascii=False, indent=2)
    print(f"디버깅용 상세 정보를 'debug_outlines_modules_labs.json'에 저장했습니다.")

def print_sample_course_outline(result):
    """
    샘플 과정의 개요와 추출된 모듈/실습 정보를 출력
    
    Args:
        result: 추출된 정보
    """
    course_outlines = result["course_outlines"]
    all_modules = result["all_modules"]
    all_labs = result["all_labs"]
    
    # 모듈이 있는 과정 찾기
    sample_course = None
    for course, modules in all_modules.items():
        if modules:
            sample_course = course
            break
    
    if not sample_course:
        print("\n모듈이 추출된 과정이 없습니다.")
        return
    
    print(f"\n=== 샘플 과정: {sample_course} ===")
    
    # 과정 개요 출력 (처음 15줄만)
    outline = course_outlines.get(sample_course, "")
    outline_lines = outline.split('\n')
    print("\n[과정 개요] (처음 15줄)")
    for line in outline_lines[:15]:
        print(line)
    if len(outline_lines) > 15:
        print(f"... 외 {len(outline_lines) - 15}줄")
    
    # 추출된 모듈 정보 출력
    modules = all_modules.get(sample_course, [])
    print(f"\n[추출된 모듈] (총 {len(modules)}개)")
    for i, module in enumerate(modules):
        print(f"모듈 {module['module_number']}: {module['module_title']}")
        if i >= 9:  # 최대 10개만 표시
            print(f"... 외 {len(modules) - 10}개 모듈")
            break
    
    # 추출된 실습 정보 출력
    labs = all_labs.get(sample_course, [])
    print(f"\n[추출된 실습] (총 {len(labs)}개)")
    for i, lab in enumerate(labs):
        print(f"실습 {lab['lab_number']}: {lab['lab_title']}")
        if i >= 9:  # 최대 10개만 표시
            print(f"... 외 {len(labs) - 10}개 실습")
            break

def main():
    """메인 실행 함수"""
    try:
        # 문서 파일 경로 설정
        import sys
        if len(sys.argv) > 1:
            file_path = sys.argv[1]
        else:
            file_path = 'AWS TnC_ILT_DILT.docx'  # 기본 파일 이름
        
        # 과정 정보 추출
        start_time = time.time()
        result = extract_course_outline_with_modules_labs(file_path)
        end_time = time.time()
        
        print(f"\n처리 완료! 소요 시간: {end_time - start_time:.2f}초")
        
        # 샘플 과정 정보 출력
        print_sample_course_outline(result)
        
        # 추출된 데이터를 2개 파일로 저장
        save_to_files(result)
        
    except Exception as e:
        print(f"오류 발생: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()