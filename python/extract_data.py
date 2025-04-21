import docx
import json
import re
import logging
import boto3
import time
import os
from collections import defaultdict

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 과정 코드 매핑 정보 (releases.awstc.com 참조)
COURSE_CODE_MAPPING = {
    "Architecting on AWS": "ARCHAWS",
    "Advanced Architecting on AWS": "ADVARC",
    "AWS Security Best Practices": "AWSSEC",
    "Security Engineering on AWS": "SECAWS",
    "DevOps Engineering on AWS": "DEVOPS",
    "Developing on AWS": "DEVAWS",
    "MLOps Engineering on AWS": "MLPOPS",
    "AWS Well-Architected Best Practices": "AWSWA",
    "Cloud Operations on AWS": "SYSOPS",
    "AWS Technical Essentials": "AWSESS",
    "AWS Cloud Practitioner Essentials": "AWSCPE",
    "Running Containers on Amazon EKS": "AWSEKS",
    "Building Data Lakes on AWS": "AWSDL",
    "Data Warehousing on AWS": "AWSDW",
    "Developing Serverless Solutions on AWS": "AWSSLS",
    "AWS Migration Essentials": "AWSMIG",
    "Building Batch Data Analytics Solutions on AWS": "AWSBDA",
    "Building Data Analytics Solutions Using Amazon Redshift": "AWSRDA",
    "Building Streaming Data Analytics Solutions on AWS": "AWSSDA",
    "Designing and Implementing Storage on AWS": "AWSSTOR",
    "Networking Essentials for Cloud Applications on AWS": "NETAWS",
    "Developing Generative AI Applications on AWS": "GENAI",
    "AWS Cloud Essentials for Business Leaders": "AWSCEL",
    "Generative AI Essentials on AWS": "GENESS",
    "Practical Data Science with Amazon SageMaker": "AWSPDS",
    "Amazon SageMaker Studio for Data Scientists": "AWSSMS",
    "Practical IaC on AWS with Terraform": "AWSIAC",
    "Digital Classroom": "DIGCLS"
}

# 과정 버전 정보
COURSE_VERSION_MAPPING = {
    "ARCHAWS": "3.0",
    "ADVARC": "2.0",
    "SECAWS": "3.1",
    "AWSSEC": "2.0",
    "DEVOPS": "2.5",
    "DEVAWS": "3.2",
    "MLPOPS": "1.0",
    "AWSWA": "2.0",
    "SYSOPS": "3.0",
    "AWSESS": "1.0",
    "AWSCPE": "2.0",
    "AWSEKS": "1.0",
    "AWSDL": "1.5",
    "AWSDW": "2.0",
    "AWSSLS": "1.0",
    "AWSMIG": "1.0",
    "AWSBDA": "1.0",
    "AWSRDA": "1.0",
    "AWSSDA": "1.0",
    "AWSSTOR": "2.0",
    "NETAWS": "1.0",
    "GENAI": "1.0",
    "AWSCEL": "1.0",
    "GENESS": "1.0",
    "AWSPDS": "1.0",
    "AWSSMS": "1.0",
    "AWSIAC": "1.0",
    "DIGCLS": "1.0"
}

def extract_text_from_docx(file_path):
    """워드 문서에서 텍스트, 테이블, 구조를 추출합니다."""
    try:
        doc = docx.Document(file_path)
        
        # 문서의 전체 구조를 저장
        document_structure = []
        
        # 텍스트와 테이블을 순서대로 처리
        for element in doc.element.body:
            if element.tag.endswith('p'):  # 단락
                paragraph = docx.text.paragraph.Paragraph(element, doc)
                if paragraph.text.strip():
                    document_structure.append({"type": "paragraph", "content": paragraph.text})
            
            elif element.tag.endswith('tbl'):  # 테이블
                table = docx.table.Table(element, doc)
                table_data = []
                for row in table.rows:
                    row_data = []
                    for cell in row.cells:
                        # 셀 내용을 텍스트로 변환
                        cell_text = ' '.join([p.text for p in cell.paragraphs]).strip()
                        row_data.append(cell_text)
                    table_data.append(row_data)
                document_structure.append({"type": "table", "content": table_data})
        
        return document_structure
    except Exception as e:
        logger.error(f"문서 추출 오류: {str(e)}")
        return []

def determine_level_code(level_text):
    """레벨 텍스트를 표준 코드로 변환합니다."""
    level_text = level_text.lower()
    if '초급' in level_text:
        return '100'
    elif '중급' in level_text:
        return '200'
    elif '고급' in level_text:
        return '300'
    else:
        return '200'  # 기본값은 중급

def determine_course_code(title):
    """과정 제목에서 코드를 추출합니다."""
    # 매핑에서 직접 찾기
    for key, code in COURSE_CODE_MAPPING.items():
        if key in title:
            return code
    
    # 매핑에 없는 경우 기본 코드 생성
    words = title.split()
    if len(words) >= 2:
        # 단어의 첫 글자들을 조합
        return "".join([word[0] for word in words if word[0].isalpha()])[:6].upper()
    else:
        # 기본값
        return "AWSCRS"

def get_course_version(course_code):
    """과정 코드에 따른 버전 정보를 반환합니다."""
    return COURSE_VERSION_MAPPING.get(course_code, "1.0")

def parse_course_info(document_structure):
    """문서 구조에서 과정 정보를 파싱합니다."""
    courses = []
    current_course = None
    course_details_mode = False
    
    # 과정 패턴 정규식
    course_title_pattern = re.compile(r'^(?:(?:[A-Za-z]+(?: [A-Za-z]+)*) on AWS)|(?:AWS [A-Za-z]+(?: [A-Za-z]+)*)\$')
    
    for i, item in enumerate(document_structure):
        if item["type"] == "paragraph":
            text = item["content"].strip()
            
            # 과정 제목 감지
            if course_title_pattern.match(text) and not course_details_mode:
                # 이전 과정이 있으면 저장
                if current_course:
                    courses.append(current_course)
                
                # 새 과정 시작
                course_code = determine_course_code(text)
                version = get_course_version(course_code)
                current_course = {
                    "title": text,
                    "awsCode": course_code,
                    "version": version,
                    "description": "",
                    "objectives": [],
                    "target_audience": [],
                    "prerequisites": [],
                    "status": "활성",
                    "created_date": "2023-01-01",
                    "source_url": f"https://releases.awstc.com/{course_code}"
                }
                course_details_mode = True
            
            # 과정 설명 추출
            elif course_details_mode and text.startswith("과정 설명") and current_course:
                continue
            
            # 과정 목표 추출
            elif course_details_mode and text.startswith("과정 목표") and current_course:
                course_details_mode = "objectives"
                continue
            
            # 수강 대상 추출
            elif course_details_mode and text.startswith("수강 대상") and current_course:
                course_details_mode = "target_audience"
                continue
            
            # 수강 전 권장사항 추출
            elif course_details_mode and text.startswith("수강 전 권장사항") and current_course:
                course_details_mode = "prerequisites"
                continue
            
            # 등록 정보 (새로운 섹션 시작 가능성) 
            elif course_details_mode and text.startswith("등록") and current_course:
                course_details_mode = False
            
            # 항목 추가
            elif course_details_mode and current_course:
                if course_details_mode == "objectives" and text.strip().startswith("·"):
                    current_course["objectives"].append(text.replace("·", "").strip())
                elif course_details_mode == "target_audience" and text.strip().startswith("·"):
                    current_course["target_audience"].append(text.replace("·", "").strip())
                elif course_details_mode == "prerequisites" and text.strip().startswith("·"):
                    current_course["prerequisites"].append(text.replace("·", "").strip())
                elif isinstance(course_details_mode, bool) and course_details_mode:
                    # 과정 설명
                    if current_course["description"]:
                        current_course["description"] += " " + text
                    else:
                        current_course["description"] = text
        
        # 테이블 처리 (레벨, 제공 방법, 소요 시간 추출)
        elif item["type"] == "table" and current_course:
            table_data = item["content"]
            
            # 2행 이상의 테이블 (레벨, 제공 방법, 소요 시간이 있는 테이블)
            if len(table_data) >= 2:
                for row_idx, row in enumerate(table_data):
                    if row_idx == 0:  # 헤더 건너뛰기
                        continue
                    
                    for col_idx, cell in enumerate(row):
                        # 헤더를 기반으로 값 할당
                        if col_idx < len(table_data[0]):
                            header = table_data[0][col_idx].lower()
                            if "레벨" in header and cell:
                                level_text = cell
                                level_code = determine_level_code(level_text)
                                current_course["level"] = level_code
                                current_course["catalogId"] = f"{level_code}-{current_course['awsCode']}"
                            elif "제공" in header and "방법" in header and cell:
                                current_course["delivery_method"] = cell
                            elif "소요" in header and "시간" in header and cell:
                                current_course["duration"] = cell
    
    # 마지막 과정 추가
    if current_course:
        # catalogId가 없는 경우 기본값 설정
        if "catalogId" not in current_course and "level" in current_course:
            current_course["catalogId"] = f"{current_course['level']}-{current_course['awsCode']}"
        elif "catalogId" not in current_course:
            level_code = "200"  # 기본값은 중급
            current_course["level"] = level_code
            current_course["catalogId"] = f"{level_code}-{current_course['awsCode']}"
        
        courses.append(current_course)
    
    return courses

def parse_modules_and_labs(document_structure, courses):
    """문서 구조에서 모듈 및 실습 정보를 추출합니다."""
    modules = []
    labs = []
    
    current_course = None
    current_module = None
    in_course_section = False
    
    # 디버깅을 위한 테이블 수집
    all_tables = []
    course_tables = {}
    
    logger.info("모듈 및 실습 추출 시작...")
    
    # 먼저 각 과정에 해당하는 섹션을 식별
    for i, item in enumerate(document_structure):
        if item["type"] == "paragraph":
            text = item["content"].strip()
            # 과정 제목 패턴
            course_title_pattern = re.compile(r'^(?:(?:[A-Za-z]+(?: [A-Za-z]+)*) on AWS)|(?:AWS [A-Za-z]+(?: [A-Za-z]+)*)\$')
            
            if course_title_pattern.match(text):
                # 현재 과정 찾기
                for course in courses:
                    if course["title"] == text:
                        current_course = course
                        in_course_section = True
                        course_tables[course["title"]] = []
                        logger.info(f"과정 섹션 발견: {course['title']}")
                        break
        
        # 테이블 수집 (디버깅용)
        if item["type"] == "table":
            all_tables.append((i, item["content"]))
            if current_course:
                course_tables[current_course["title"]].append((i, item["content"]))
    
    # 테이블 구조 로깅 (디버깅용)
    logger.info(f"문서에서 총 {len(all_tables)}개 테이블 발견")
    for course_title, tables in course_tables.items():
        logger.info(f"과정 '{course_title}'에서 {len(tables)}개 테이블 발견")
    
    # 각 과정별로 테이블 탐색
    for course in courses:
        catalog_id = course.get("catalogId")
        course_title = course.get("title")
        version = course.get("version", "1.0")
        
        if not course_title or course_title not in course_tables:
            continue
        
        logger.info(f"과정 '{course_title}'의 모듈 및 실습 검색 중...")
        
        # 이 과정에 속한 모든 테이블 검사
        for idx, table_data in course_tables[course_title]:
            # 테이블 헤더를 문자열로 변환하여 검사
            table_header_text = " ".join([str(cell) for cell in table_data[0]] if table_data and len(table_data) > 0 else [])
            logger.info(f"테이블 {idx} 헤더: {table_header_text[:50]}...")
            
            # 테이블 전체 내용 검사
            table_content = []
            for row in table_data:
                row_content = " ".join([str(cell) for cell in row])
                table_content.append(row_content)
            
            table_full_text = "\n".join(table_content)
            
            # 과정 개요 테이블 또는 모듈/실습 정보가 포함된 테이블 확인
            if "과정 개요" in table_full_text or "모듈" in table_full_text or "실습" in table_full_text:
                logger.info(f"과정 '{course_title}'의 모듈/실습 정보가 포함된 테이블 발견")
                
                # 모든 테이블 셀을 검사
                module_counter = 0
                lab_counter = 0
                
                for row_idx, row in enumerate(table_data):
                    for cell_idx, cell in enumerate(row):
                        cell_text = str(cell)
                        
                        # 모듈 정보 추출
                        module_matches = re.findall(r'모듈\s*(\d+)[:：]\s*(.*?)(?=\$|\n)', cell_text)
                        for match in module_matches:
                            module_num = match[0].zfill(2)  # 01, 02 형식
                            module_title = match[1].strip()
                            
                            module_id = f"{catalog_id}-M{module_num}"
                            new_module = {
                                "catalogId": catalog_id,
                                "moduleNumber": module_num,
                                "moduleId": module_id,
                                "module_title": module_title,
                                "description": "",
                                "duration": "2시간",  # 기본값
                                "catalog_version": version
                            }
                            modules.append(new_module)
                            current_module = new_module
                            module_counter += 1
                        
                        # 모듈 번호와 이름이 별도의 셀에 있는 경우도 처리
                        if re.match(r'^모듈\s*\d+\$', cell_text) and cell_idx + 1 < len(row):
                            module_num_match = re.search(r'모듈\s*(\d+)', cell_text)
                            if module_num_match:
                                module_num = module_num_match.group(1).zfill(2)
                                module_title = str(row[cell_idx + 1]).strip()
                                
                                module_id = f"{catalog_id}-M{module_num}"
                                new_module = {
                                    "catalogId": catalog_id,
                                    "moduleNumber": module_num,
                                    "moduleId": module_id,
                                    "module_title": module_title,
                                    "description": "",
                                    "duration": "2시간",  # 기본값
                                    "catalog_version": version
                                }
                                modules.append(new_module)
                                current_module = new_module
                                module_counter += 1
                        
                        # 1일 차, 2일 차 형식의 모듈 처리
                        day_module_match = re.search(r'(\d+)[일차]\s*', cell_text)
                        if day_module_match and not re.search(r'모듈', cell_text):
                            day_num = day_module_match.group(1)
                            module_num = day_num.zfill(2)  # 01, 02 형식
                            module_title = f"{day_num}일 차"
                            
                            module_id = f"{catalog_id}-M{module_num}"
                            new_module = {
                                "catalogId": catalog_id,
                                "moduleNumber": module_num,
                                "moduleId": module_id,
                                "module_title": module_title,
                                "description": "",
                                "duration": "8시간",  # 기본값 (1일)
                                "catalog_version": version
                            }
                            modules.append(new_module)
                            current_module = new_module
                            module_counter += 1
                        
                        # 실습 정보 추출
                        lab_patterns = [
                            r'실습\s*(\d+)[:：]\s*(.*?)(?=\$|\n)',
                            r'랩\s*(\d+)[:：]\s*(.*?)(?=\$|\n)',
                            r'핸즈온\s*랩\s*(\d+)[:：]\s*(.*?)(?=\$|\n)',
                            r'Hands-on\s*Lab\s*(\d+)[:：]\s*(.*?)(?=\$|\n)'
                        ]
                        
                        for pattern in lab_patterns:
                            lab_matches = re.findall(pattern, cell_text)
                            for match in lab_matches:
                                lab_num = match[0].zfill(2)
                                lab_title = match[1].strip()
                                
                                # 모듈이 있으면 현재 모듈과 연결
                                module_id = current_module["moduleId"] if current_module else f"{catalog_id}-M01"
                                
                                lab_id = f"LAB-{catalog_id}-{lab_num}"
                                new_lab = {
                                    "catalogId": catalog_id,
                                    "labId": lab_id,
                                    "moduleId": module_id,
                                    "labNumber": lab_num,
                                    "lab_title": lab_title,
                                    "description": lab_title,
                                    "duration": "30분",  # 기본값
                                    "difficulty": "3",  # 기본값
                                    "catalog_version": version
                                }
                                labs.append(new_lab)
                                lab_counter += 1
                
                logger.info(f"과정 '{course_title}'에서 {module_counter}개 모듈, {lab_counter}개 실습 추출")
    
    # 중복 제거
    unique_modules = []
    seen_module_ids = set()
    for module in modules:
        module_id = module.get("moduleId")
        if module_id and module_id not in seen_module_ids:
            seen_module_ids.add(module_id)
            unique_modules.append(module)
    
    unique_labs = []
    seen_lab_ids = set()
    for lab in labs:
        lab_id = lab.get("labId")
        if lab_id and lab_id not in seen_lab_ids:
            seen_lab_ids.add(lab_id)
            unique_labs.append(lab)
    
    logger.info(f"총 {len(unique_modules)}개 모듈, {len(unique_labs)}개 실습 추출 완료 (중복 제거 후)")
    return unique_modules, unique_labs

def enhance_with_claude(data, data_type):
    """Claude 2 모델을 사용하여 데이터를 보강합니다."""
    if not data:
        return data
    
    try:
        # Bedrock 클라이언트 생성
        bedrock_runtime = boto3.client(service_name="bedrock-runtime")
        
        # 데이터 타입에 따른 프롬프트
        prompts = {
            "course": """
            다음은 AWS 교육 과정 정보입니다. 이 데이터를 검토하고, 비어 있거나 불완전한 필드가 있다면 
            합리적인 값으로 채워주세요. 특히 다음 필드에 주목해주세요:
            - description: 과정에 대한 간략한 설명
            - objectives: 학습 목표 목록
            - target_audience: 교육 대상자 목록
            - prerequisites: 선수 조건 목록
            
            원본 데이터를 JSON 형식으로 반환하고, 변경된 필드를 주석으로 표시해주세요.
            """,
            
            "module": """
            다음은 AWS 교육 과정의 모듈 정보입니다. 이 데이터를 검토하고, 필요한 경우 모듈에 대한 설명(description)을
            추가해주세요. 원본 데이터를 JSON 형식으로 반환하세요.
            """,
            
            "lab": """
            다음은 AWS 교육 과정의 실습 정보입니다. 이 데이터를 검토하고, 비어 있거나 불완전한 필드가 있다면
            합리적인 값으로 채워주세요. 특히 다음 필드에 주목해주세요:
            - description: 실습에 대한 설명
            - difficulty: 1-5 사이의 난이도
            
            원본 데이터를 JSON 형식으로 반환하세요.
            """
        }
        
        # 데이터 일부만 처리 (API 호출 최소화)
        sample_size = min(5, len(data))
        enhanced_data = data.copy()
        
        for i in range(sample_size):
            item_json = json.dumps(data[i], ensure_ascii=False, indent=2)
            
            # Claude 2 모델 사용
            modelId = "anthropic.claude-v2"
            
            body = json.dumps({
                "prompt": f"\n\nHuman: {prompts[data_type]}\n\n{item_json}\n\nAssistant:",
                "max_tokens_to_sample": 4000,
                "temperature": 0.2,
                "stop_sequences": ["\n\nHuman:"]
            })
            
            response = bedrock_runtime.invoke_model(
                modelId=modelId,
                body=body
            )
            
            # 응답 처리
            response_body = json.loads(response.get('body').read().decode('utf-8'))
            text_content = response_body.get('completion', '')
            
            # JSON 추출 시도
            try:
                # JSON 부분 추출
                json_start = text_content.find('{')
                json_end = text_content.rfind('}') + 1
                
                if json_start >= 0 and json_end > json_start:
                    json_str = text_content[json_start:json_end]
                    enhanced_item = json.loads(json_str)
                    enhanced_data[i] = enhanced_item
            except:
                logger.warning(f"Claude 응답에서 JSON을 파싱하는 데 실패했습니다: {text_content[:100]}...")
            
            # API 호출 제한 방지를 위한 지연
            time.sleep(1)
        
        return enhanced_data
    
    except Exception as e:
        logger.error(f"Claude API 호출 중 오류: {str(e)}")
        return data

def save_to_json(data, filename):
    """데이터를 JSON 파일로 저장합니다."""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    logger.info(f"{filename} 파일에 {len(data)}개의 항목이 저장되었습니다.")

def main():
    """메인 함수: 문서 처리 및 JSON 파일 저장"""
    try:
        # 1. 문서 구조 추출
        logger.info("문서 구조 추출 중...")
        document_structure = extract_text_from_docx("AWS TnC_ILT_DILT.docx")
        logger.info(f"문서 구조 추출 완료: {len(document_structure)} 항목")
        
        # 2. 과정 정보 파싱
        logger.info("과정 정보 파싱 중...")
        courses = parse_course_info(document_structure)
        logger.info(f"{len(courses)}개 과정 정보 파싱 완료")
        
        # 3. 모듈 및 실습 정보 파싱
        logger.info("모듈 및 실습 정보 파싱 중...")
        modules, labs = parse_modules_and_labs(document_structure, courses)
        logger.info(f"{len(modules)}개 모듈, {len(labs)}개 실습 정보 파싱 완료")
        
        # 4. Claude 모델을 사용한 데이터 보강 (선택적)
        try:
            logger.info("AWS 자격 증명 확인 중...")
            boto3.client('sts').get_caller_identity()
            
            use_claude = input("Claude 모델을 사용하여 데이터 보강을 시도하시겠습니까? (y/n): ").strip().lower() == 'y'
            
            if use_claude:
                logger.info("Claude 모델을 사용하여 일부 데이터 보강 중...")
                
                # 데이터가 많아 일부만 보강
                if courses:
                    courses_sample = courses[:min(3, len(courses))]
                    enhanced_courses = enhance_with_claude(courses_sample, "course")
                    # 원본 데이터 업데이트
                    for i, course in enumerate(enhanced_courses):
                        courses[i] = course
                
                if modules:
                    modules_sample = modules[:min(3, len(modules))]
                    enhanced_modules = enhance_with_claude(modules_sample, "module")
                    # 원본 데이터 업데이트
                    for i, module in enumerate(enhanced_modules):
                        modules[i] = module
                
                if labs:
                    labs_sample = labs[:min(3, len(labs))]
                    enhanced_labs = enhance_with_claude(labs_sample, "lab")
                    # 원본 데이터 업데이트
                    for i, lab in enumerate(enhanced_labs):
                        labs[i] = lab
                
                logger.info("데이터 보강 완료")
        
        except Exception as e:
            logger.warning(f"Claude 모델을 사용한 데이터 보강 실패: {str(e)}")
        
        # 5. JSON 파일 저장
        save_to_json(courses, "course_catalog.json")
        save_to_json(modules, "course_modules.json")
        save_to_json(labs, "course_labs.json")
        
        logger.info("""
        ======================================================
        데이터 추출 및 JSON 저장이 완료되었습니다!
        
        생성된 파일:
        - course_catalog.json: 과정 정보
        - course_modules.json: 모듈 정보
        - course_labs.json: 실습 정보
        
        파일을 확인한 후 DynamoDB 테이블에 업로드할 수 있습니다.
        ======================================================
        """)
        
        return True
    
    except Exception as e:
        logger.error(f"처리 중 오류 발생: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return False

if __name__ == "__main__":
    main()