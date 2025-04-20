import os
import json
import boto3
import docx
from docx import Document
import time

def extract_text_from_docx(file_path):
    """워드 파일에서 텍스트 추출"""
    try:
        doc = Document(file_path)
        full_text = []
        
        for para in doc.paragraphs:
            if para.text.strip():  # 빈 줄 제외
                full_text.append(para.text.strip())
        
        # 테이블 내용 추출
        for table in doc.tables:
            for row in table.rows:
                row_text = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                if row_text:
                    full_text.append(" | ".join(row_text))
        
        return full_text
    except Exception as e:
        print(f"워드 파일 읽기 오류: {str(e)}")
        return []

def extract_course_sections(paragraphs):
    """워드 문서에서 과정 섹션 추출"""
    # 과정 시작 식별자 - 대표적인 과정 제목들
    course_markers = [
        "AWS Cloud Practitioner Essentials", 
        "Architecting on AWS", 
        "AWS Security Essentials", 
        "AWS Technical Essentials",
        "DevOps Engineering on AWS",
        "Security Engineering on AWS",
        "Developing on AWS",
        "Developing Serverless Solutions on AWS",
        "AWS Cloud Essentials for Business Leaders",
        "AWS Migration Essentials",
        "AWS Well-Architected Best Practices",
        "Building Data Lakes on AWS"
    ]
    
    course_sections = []
    current_section = []
    in_course_section = False
    
    for para in paragraphs:
        # 새로운 과정 섹션의 시작 확인
        if any(marker in para for marker in course_markers):
            # 이전 섹션 저장
            if current_section:
                course_sections.append(current_section)
            
            # 새 섹션 시작
            current_section = [para]
            in_course_section = True
        
        # 현재 과정 섹션에 내용 추가
        elif in_course_section:
            current_section.append(para)
            
            # 과정 섹션 종료 조건 (다음 과정 시작 또는 문서 종료)
            if "Digital Classroom" in para or "과정 개요" in para:
                course_sections.append(current_section)
                current_section = []
                in_course_section = False
    
    # 마지막 섹션 처리
    if current_section:
        course_sections.append(current_section)
    
    return course_sections

def analyze_with_bedrock(section_text):
    """Amazon Bedrock을 사용하여 과정 정보를 JSON으로 구조화"""
    try:
        # Bedrock 클라이언트 생성
        bedrock_runtime = boto3.client(
            service_name='bedrock-runtime',
            region_name='us-east-1'  # Bedrock이 사용 가능한 리전
        )
        
        # 프롬프트 작성
        prompt = f"""
        다음은 AWS 교육 과정에 대한 설명입니다. 이 텍스트를 분석하여 과정에 대한 정보를 추출해주세요.
        
        텍스트:
        {section_text}
        
        결과는 다음과 같은 JSON 형식으로 반환해주세요:
        {{
            "course_id": "과정의 약어 또는 코드 (예: AWS-CPE, AWS-ARCH 등)",
            "course_name": "과정의 전체 이름",
            "level": "과정 레벨 (초급/중급/고급)",
            "duration": "과정 소요 시간 (예: 1일, 2일, 3일)",
            "delivery_method": "강의 방식 (예: 강의식 교육(ILT) 및 실습)",
            "description": "과정에 대한 간략한 설명",
            "objectives": ["과정 목표 1", "과정 목표 2", ...],
            "target_audience": ["대상 1", "대상 2", ...]
        }}
        
        - course_id는 과정 이름의 영문 약어를 사용해 만들어주세요 (예: AWS Cloud Practitioner Essentials -> AWS-CPE)
        - 모든 필드를 최대한 정확하게 작성해주세요
        - 정보를 찾을 수 없는 경우 해당 필드를 제외하세요
        - 최대한 정확하게 분석해주세요
        """
        
        # Claude 모델 선택 (Anthropic Claude)
        model_id = 'anthropic.claude-v2'
        
        # Bedrock API 호출
        response = bedrock_runtime.invoke_model(
            modelId=model_id,
            body=json.dumps({
                "prompt": f"\n\nHuman: {prompt}\n\nAssistant: ",
                "max_tokens_to_sample": 4000,
                "temperature": 0.0,
                "top_p": 1
            })
        )
        
        # 응답 처리
        response_body = json.loads(response['body'].read())
        result = response_body.get('completion', '').strip()
        
        # JSON 부분 추출 (모델이 JSON 이외의 텍스트를 반환할 수 있으므로)
        json_start = result.find('{')
        json_end = result.rfind('}') + 1
        
        if json_start >= 0 and json_end > json_start:
            json_text = result[json_start:json_end]
            return json.loads(json_text)
        else:
            print(f"JSON 형식을 찾을 수 없음: {result}")
            return None
            
    except Exception as e:
        print(f"Bedrock 분석 오류: {str(e)}")
        return None

def process_docx_and_create_courses_json(docx_path, output_json_path):
    """워드 문서를 처리하고 courses.json 파일 생성"""
    # 1. 워드 파일에서 텍스트 추출
    paragraphs = extract_text_from_docx(docx_path)
    if not paragraphs:
        print("워드 파일 내용이 없거나 읽을 수 없습니다.")
        return False
    
    # 2. 과정별 섹션 추출
    course_sections = extract_course_sections(paragraphs)
    if not course_sections:
        print("과정 섹션을 식별할 수 없습니다.")
        return False
    
    # 3. 모든 과정 정보를 저장할 리스트
    all_courses = []
    
    # 4. 각 섹션별로 Bedrock 분석 수행
    for i, section in enumerate(course_sections):
        section_text = "\n".join(section)
        
        print(f"과정 {i+1}/{len(course_sections)} 분석 중...")
        
        # Bedrock 호출 레이트 제한 방지를 위한 딜레이
        time.sleep(3)
        
        # Bedrock 분석
        course_info = analyze_with_bedrock(section_text)
        
        # 분석된 과정 추가
        if course_info:
            all_courses.append(course_info)
            print(f"'{course_info.get('course_name', 'Unknown')}' 과정 정보 추출 완료")
        else:
            print(f"과정 {i+1} 정보 추출 실패")
    
    # 5. 중복 제거 (course_id 기준)
    unique_courses = []
    course_ids = set()
    
    for course in all_courses:
        if course.get('course_id') and course['course_id'] not in course_ids:
            unique_courses.append(course)
            course_ids.add(course['course_id'])
    
    # 6. courses.json 파일 생성
    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(unique_courses, f, ensure_ascii=False, indent=4)
    
    print(f"{len(unique_courses)}개의 과정 정보가 {output_json_path}에 저장되었습니다.")
    return True

def main():
    # 워드 파일 경로 및 결과 JSON 파일 경로 설정
    docx_file_path = "AWS_TnC_ILT_DILT.docx"  # 워드 파일 경로 지정
    output_json_path = "courses.json"
    
    # 처리 실행
    if os.path.exists(docx_file_path):
        process_docx_and_create_courses_json(docx_file_path, output_json_path)
    else:
        print(f"파일이 존재하지 않습니다: {docx_file_path}")

if __name__ == "__main__":
    main()
