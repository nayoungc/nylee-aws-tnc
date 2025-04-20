import os
import json
import re
from docx import Document

# 워드 파일 경로
DOCX_FILE_PATH = "AWS TnC_ILT_DILT.docx"

def extract_text_from_docx(file_path):
    """워드 파일에서 텍스트 추출"""
    try:
        doc = Document(file_path)
        paragraphs = []
        
        # 단락 텍스트 추출
        for para in doc.paragraphs:
            if para.text.strip():
                paragraphs.append(para.text.strip())
        
        # 테이블 내용 추출
        for table in doc.tables:
            for row in table.rows:
                row_text = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                if row_text:
                    paragraphs.append(" | ".join(row_text))
        
        return paragraphs
    except Exception as e:
        print(f"워드 파일 읽기 오류: {str(e)}")
        return []

def identify_course_sections(paragraphs):
    """과정 섹션 식별"""
    course_sections = {}
    current_course_id = None
    in_course_section = False
    module_start = False
    
    # 과정 ID 매핑
    course_id_mapping = {
        "AWS Cloud Practitioner Essentials": "AWS-CPE",
        "Architecting on AWS": "AWS-ARCH",
        "AWS Security Essentials": "AWS-SE",
        "DevOps Engineering on AWS": "AWS-DEVOPS",
        "Security Engineering on AWS": "AWS-SEC",
        "Developing on AWS": "AWS-DEV",
        "AWS Technical Essentials": "AWS-TE",
        "AWS Well-Architected Best Practices": "AWS-WABP",
        "Data Warehousing on AWS": "AWS-DW",
        "Developing Serverless Solutions on AWS": "AWS-DSVS",
        "Building Data Lakes on AWS": "AWS-BDLAS",
        "MLOps Engineering on AWS": "AWS-MLOPS"
    }
    
    i = 0
    while i < len(paragraphs):
        line = paragraphs[i]
        
        # 과정 제목 식별
        for course_name, course_id in course_id_mapping.items():
            if course_name in line and "Digital Classroom" not in line:
                current_course_id = course_id
                in_course_section = True
                module_start = False
                if current_course_id not in course_sections:
                    course_sections[current_course_id] = []
                break
        
        # 모듈 정보 수집
        if in_course_section:
            # 모듈 시작 식별
            if "모듈 1:" in line or "모듈 1 " in line or "모듈1:" in line or "Module 1:" in line or "모듈 0:" in line:
                module_start = True
            
            # 모듈 정보 수집
            if module_start and current_course_id:
                course_sections[current_course_id].append(line)
            
            # 섹션 종료 식별
            if "Digital Classroom" in line or "과정 마무리" in line or "과정 요약" in line:
                in_course_section = False
        
        i += 1
    
    return course_sections

def extract_modules_from_sections(course_sections):
    """섹션에서 모듈 및 실습 정보 추출"""
    all_modules = []
    
    for course_id, section_lines in course_sections.items():
        # 모듈 및 실습 패턴 식별
        module_pattern = re.compile(r'모듈\s*(\d+)[:\s]+(.*?)\$', re.IGNORECASE)
        lab_pattern = re.compile(r'(실습|핸즈온랩|랩)\s*(\d+)[:\s]+(.*?)\$', re.IGNORECASE)
        
        # 현재 처리 중인 모듈 정보
        current_module = None
        module_desc_lines = []
        
        for line in section_lines:
            # 모듈 식별
            module_match = module_pattern.search(line)
            if module_match:
                # 이전 모듈 저장
                if current_module and current_module["module_type"] == "강의":
                    current_module["module_description"] = " ".join(module_desc_lines).strip()
                    all_modules.append(current_module)
                    module_desc_lines = []
                
                # 새 모듈 생성
                module_num = module_match.group(1)
                module_name = module_match.group(2).strip()
                current_module = {
                    "module_id": f"{course_id}-M{module_num}",
                    "course_id": course_id,
                    "module_number": int(module_num),
                    "module_name": module_name,
                    "module_type": "강의",
                    "module_description": ""
                }
                continue
            
            # 실습 식별
            lab_match = lab_pattern.search(line)
            if lab_match:
                # 이전 모듈 저장
                if current_module and current_module["module_type"] == "강의":
                    current_module["module_description"] = " ".join(module_desc_lines).strip()
                    all_modules.append(current_module)
                    module_desc_lines = []
                
                # 새 실습 생성
                lab_num = lab_match.group(2)
                lab_name = lab_match.group(3).strip()
                current_module = {
                    "module_id": f"{course_id}-LAB{lab_num}",
                    "course_id": course_id,
                    "module_number": f"LAB{lab_num}",
                    "module_name": lab_name,
                    "module_type": "실습",
                    "module_description": ""
                }
                continue
            
            # 모듈/실습 설명 수집
            if current_module:
                # 다음 모듈/실습이 아닐 경우에만 설명에 추가
                if not module_pattern.search(line) and not lab_pattern.search(line):
                    module_desc_lines.append(line)
        
        # 마지막 모듈 저장
        if current_module:
            current_module["module_description"] = " ".join(module_desc_lines).strip()
            all_modules.append(current_module)
    
    # 모듈이 없는 과정에 대한 기본 모듈 추가
    all_course_ids = set(course_sections.keys())
    courses_with_modules = set(module["course_id"] for module in all_modules)
    
    for course_id in all_course_ids - courses_with_modules:
        all_modules.append({
            "module_id": f"{course_id}-M1",
            "course_id": course_id,
            "module_number": 1,
            "module_name": "과정 개요",
            "module_type": "강의",
            "module_description": "과정 내용 개요 및 소개"
        })
    
    return all_modules

def create_modules_json_from_docx():
    """워드 파일에서 모듈 정보를 추출하여 modules.json 생성"""
    if not os.path.exists(DOCX_FILE_PATH):
        print(f"파일이 존재하지 않습니다: {DOCX_FILE_PATH}")
        return False
    
    # 워드 파일에서 텍스트 추출
    print(f"{DOCX_FILE_PATH} 파일에서 텍스트 추출 중...")
    paragraphs = extract_text_from_docx(DOCX_FILE_PATH)
    if not paragraphs:
        print("워드 파일에서 텍스트를 추출할 수 없습니다.")
        return False
    
    print("과정 섹션 식별 중...")
    course_sections = identify_course_sections(paragraphs)
    print(f"{len(course_sections)}개의 과정 섹션 식별됨")
    
    print("모듈 및 실습 정보 추출 중...")
    modules_data = extract_modules_from_sections(course_sections)
    print(f"{len(modules_data)}개의 모듈/실습 정보 추출 완료")
    
    # modules.json 파일에 저장
    with open('modules.json', 'w', encoding='utf-8') as f:
        json.dump(modules_data, f, ensure_ascii=False, indent=4)
    
    print(f"{len(modules_data)}개의 모듈/실습 정보가 modules.json에 저장되었습니다.")
    return True

def main():
    try:
        print("AWS 교육 과정 모듈 정보 추출 프로그램을 시작합니다.")
        success = create_modules_json_from_docx()
        if success:
            print("모듈 정보 추출 및 JSON 생성 완료!")
        else:
            print("모듈 정보 추출 실패")
    except Exception as e:
        print(f"오류 발생: {str(e)}")

if __name__ == "__main__":
    main()