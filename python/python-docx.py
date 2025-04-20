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

def is_course_title(line):
    """과정 제목인지 확인"""
    course_keywords = [
        "AWS Cloud Practitioner Essentials",
        "Architecting on AWS",
        "AWS Security Essentials",
        "Security Engineering on AWS",
        "DevOps Engineering on AWS",
        "Developing on AWS",
        "AWS Technical Essentials",
        "AWS Well-Architected Best Practices",
        "Data Warehousing on AWS",
        "Developing Serverless Solutions on AWS",
        "Building Data Lakes on AWS",
        "MLOps Engineering on AWS",
        "Migrating to AWS",
        "Running Containers on Amazon",
        "Networking Essentials for Cloud",
        "Amazon SageMaker",
        "Designing and Implementing Storage",
        "Building Streaming Data Analytics",
        "Building Batch Data Analytics",
        "AWS Well-Architected",
        "AWS Cloud Essentials",
        "AWS Migration Essentials",
        "Build Modern Applications with AWS NoSQL",
        "Practical Data Science",
        "Advanced AWS Well-Architected",
        "Practical IaC on AWS",
        "Generative AI Essentials"
    ]
    
    # 제목에 교육 과정명이 포함되어 있는지 확인
    for keyword in course_keywords:
        if keyword in line:
            # 일부 예외 처리
            if "Digital Classroom" in line:
                return False
            if "과정 개요" in line:
                return False
            return True
    return False

def get_course_id(title):
    """과정 제목에서 과정 ID 추출"""
    # 과정 ID 매핑 - 더 많은 과정 추가
    mapping = {
        "Cloud Practitioner Essentials": "AWS-CPE",
        "Architecting on AWS": "AWS-ARCH",
        "AWS Security Essentials": "AWS-SE",
        "Security Engineering on AWS": "AWS-SEC",
        "DevOps Engineering on AWS": "AWS-DEVOPS",
        "Developing on AWS": "AWS-DEV",
        "AWS Technical Essentials": "AWS-TE",
        "AWS Well-Architected Best Practices": "AWS-WABP",
        "Data Warehousing on AWS": "AWS-DW",
        "Developing Serverless Solutions": "AWS-DSVS",
        "Building Data Lakes": "AWS-BDLAS",
        "MLOps Engineering": "AWS-MLOPS",
        "Migrating to AWS": "AWS-MIG",
        "Running Containers": "AWS-REKS",
        "Networking Essentials": "AWS-NETESS",
        "SageMaker Studio": "AWS-SMD", 
        "Designing and Implementing Storage": "AWS-DSIS",
        "Building Streaming Data": "AWS-BSDA",
        "Building Batch Data": "AWS-BBDA",
        "AWS Cloud Essentials for Business": "AWS-CBEL",
        "AWS Migration Essentials": "AWS-MIGESS",
        "Build Modern Applications with AWS NoSQL": "AWS-NOSQL",
        "Practical Data Science": "AWS-PDS",
        "Advanced AWS Well-Architected": "AWS-AWABP",
        "Practical IaC": "AWS-IaC",
        "Generative AI Essentials": "AWS-GOE"
    }
    
    for key, value in mapping.items():
        if key in title:
            return value
    
    # 매핑에 없는 경우 ID 생성
    first_words = re.sub(r'[^a-zA-Z\s]', '', title).split()[:3]
    if first_words:
        course_id = "AWS-" + ''.join([word[0] for word in first_words])
        return course_id
    return "AWS-UNKNOWN"

def extract_all_course_content(paragraphs):
    """모든 과정 내용 추출"""
    courses_content = []
    current_course = None
    course_lines = []
    
    for line in paragraphs:
        if is_course_title(line):
            # 이전 과정 저장
            if current_course:
                courses_content.append({
                    'course_id': current_course,
                    'content': course_lines
                })
            
            # 새 과정 시작
            current_course = get_course_id(line)
            course_lines = [line]
        elif current_course:
            # 현재 과정에 내용 추가
            course_lines.append(line)
            
            # 과정 종료 검사
            if "Digital Classroom" in line or "Overview	" in line:
                courses_content.append({
                    'course_id': current_course,
                    'content': course_lines
                })
                current_course = None
                course_lines = []
    
    # 마지막 과정 저장
    if current_course and course_lines:
        courses_content.append({
            'course_id': current_course,
            'content': course_lines
        })
    
    return courses_content

def extract_modules_and_labs(course_content):
    """과정 내용에서 모듈과 실습 추출"""
    modules = []
    course_id = course_content['course_id']
    content = course_content['content']
    
    # 다양한 모듈/실습 패턴
    module_patterns = [
        r'모듈\s*(\d+)[:\s]+(.*?)\$',
        r'Module\s*(\d+)[:\s]+(.*?)\$',
        r'모듈 (\d+)[-\s:]+(.*?)\$',
        r'\s*(\d+)\.\s+(.*?)\$'  # 1. 모듈 이름 형식
    ]
    
    lab_patterns = [
        r'실습\s*(\d+)[:\s]+(.*?)\$',
        r'핸즈온랩\s*(\d+)[:\s]+(.*?)\$',
        r'랩\s*(\d+)[:\s]+(.*?)\$',
        r'Lab\s*(\d+)[:\s]+(.*?)\$',
        r'실습 (\d+)[-\s:]+(.*?)\$',
        r'연습\s*실습\s*(\d+)[:\s]+(.*?)\$',
        r'실습[:\s]+(\d+)[:\s]+(.*?)\$'
    ]
    
    # 내용 분석을 위한 상태 변수
    current_module = None
    description_lines = []
    
    # 내용 분석
    i = 0
    while i < len(content):
        line = content[i]
        
        # 모듈 패턴 확인
        module_found = False
        for pattern in module_patterns:
            match = re.search(pattern, line, re.IGNORECASE)
            if match:
                # 이전 모듈 저장
                if current_module and description_lines:
                    current_module['module_description'] = ' '.join(description_lines).strip()
                    modules.append(current_module)
                
                module_num = match.group(1)
                module_name = match.group(2).strip()
                
                # 모듈 이름에서 "모듈 x:" 부분 제거
                if ":" in module_name:
                    module_name = module_name.split(":", 1)[1].strip()
                
                # 새 모듈 생성
                current_module = {
                    'module_id': f"{course_id}-M{module_num}",
                    'course_id': course_id,
                    'module_number': int(module_num),
                    'module_name': module_name,
                    'module_type': '강의',
                    'module_description': ''
                }
                description_lines = []
                module_found = True
                break
        
        if module_found:
            i += 1
            continue
        
        # 실습 패턴 확인
        lab_found = False
        for pattern in lab_patterns:
            match = re.search(pattern, line, re.IGNORECASE)
            if match:
                # 이전 모듈 저장
                if current_module and description_lines:
                    current_module['module_description'] = ' '.join(description_lines).strip()
                    modules.append(current_module)
                
                lab_num = match.group(1)
                lab_name = match.group(2).strip()
                
                # 실습 이름에서 "실습 x:" 부분 제거
                if ":" in lab_name:
                    lab_name = lab_name.split(":", 1)[1].strip()
                
                # 새 실습 생성
                current_module = {
                    'module_id': f"{course_id}-LAB{lab_num}",
                    'course_id': course_id,
                    'module_number': f"LAB{lab_num}",
                    'module_name': lab_name,
                    'module_type': '실습',
                    'module_description': ''
                }
                description_lines = []
                lab_found = True
                break
        
        if lab_found:
            i += 1
            continue
        
        # 모듈/실습 설명 수집
        if current_module:
            # 다음 모듈/실습이 시작되는지 확인
            is_next_section = False
            for pattern in module_patterns + lab_patterns:
                if re.search(pattern, line, re.IGNORECASE):
                    is_next_section = True
                    break
            
            # 다음 섹션이 아니면 설명에 추가
            if not is_next_section:
                # 너무 긴 줄이거나 특정 패턴은 무시
                if len(line) < 200 and "과정 개요" not in line and "소요 시간" not in line:
                    description_lines.append(line)
        
        i += 1
    
    # 마지막 모듈 저장
    if current_module and description_lines:
        current_module['module_description'] = ' '.join(description_lines).strip()
        modules.append(current_module)
    
    # 모듈이 없는 경우 기본 모듈 추가
    if not modules:
        modules.append({
            'module_id': f"{course_id}-M1",
            'course_id': course_id,
            'module_number': 1,
            'module_name': '과정 개요',
            'module_type': '강의',
            'module_description': ''.join(content[:min(5, len(content))])  # 처음 5줄을 설명으로 사용
        })
    
    return modules

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
    
    print("과정 내용 추출 중...")
    course_contents = extract_all_course_content(paragraphs)
    print(f"{len(course_contents)}개의 과정 내용 추출됨")
    
    # 각 과정에서 모듈/실습 추출
    all_modules = []
    for course in course_contents:
        print(f"'{course['course_id']}' 과정의 모듈/실습 추출 중...")
        modules = extract_modules_and_labs(course)
        all_modules.extend(modules)
        print(f"'{course['course_id']}' 과정에서 {len(modules)}개의 모듈/실습 추출 완료")
    
    # 중복 제거 (module_id 기준)
    unique_modules = []
    seen_ids = set()
    for module in all_modules:
        if module['module_id'] not in seen_ids:
            unique_modules.append(module)
            seen_ids.add(module['module_id'])
    
    # 모듈 정렬 (course_id, module_number로)
    unique_modules.sort(key=lambda m: (m['course_id'], str(m['module_number'])))
    
    # modules.json 파일에 저장
    with open('modules.json', 'w', encoding='utf-8') as f:
        json.dump(unique_modules, f, ensure_ascii=False, indent=4)
    
    print(f"{len(unique_modules)}개의 모듈/실습 정보가 modules.json에 저장되었습니다.")
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