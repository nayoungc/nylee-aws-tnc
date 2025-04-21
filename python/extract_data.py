import boto3
import json
import os
import docx
import logging
from typing import Dict, List, Any

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def extract_text_from_docx(file_path):
    """워드 문서에서 텍스트를 추출합니다."""
    doc = docx.Document(file_path)
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    return '\n'.join(full_text)

def get_course_version_from_awstc(course_code):
    """releases.awstc.com에서 과정 버전 정보를 가져옵니다."""
    # 참고: 실제 구현에서는 사이트 접근 권한이 필요할 수 있습니다
    default_versions = {
        "ARCHAWS": "3.0",
        "SECUR": "3.1",
        "DEVOPS": "2.5",
        "DEVELOPING": "3.2",
        "MLOPS": "1.0",
        "WELLARCH": "2.0",
        "TECHDCT": "3.0"
    }
    
    return default_versions.get(course_code, "1.0")

def extract_data_with_bedrock(text, prompt_type):
    """AWS Bedrock 모델을 사용하여 텍스트에서 정보를 추출합니다."""
    bedrock_runtime = boto3.client(service_name="bedrock-runtime")
    
    prompts = {
        "catalog": """
        다음 문서는 AWS 교육 과정 카탈로그 정보입니다. 이 텍스트에서 모든 교육 과정에 대한 정보를 추출하여 다음 JSON 형식으로 반환해주세요:
        
        [
          {
            "catalogId": "과정 레벨-과정코드 형식으로",
            "title": "과정 제목",
            "awsCode": "AWS 공식 과정 코드",
            "level": "교육 레벨 (100, 200, 300 중 하나)",
            "delivery_method": "강의형태",
            "duration": "소요 시간",
            "objectives": ["교육 목표1", "교육 목표2", ...],
            "target_audience": ["교육 대상1", "교육 대상2", ...],
            "prerequisites": ["사전 요구사항1", "사전 요구사항2", ...],
            "status": "활성",
            "created_date": "2023-01-01",
            "source_url": "https://releases.awstc.com/과정코드",
            "aws_services": ["관련 서비스1", "관련 서비스2", ...],
            "keywords": ["키워드1", "키워드2", ...]
          },
          ...
        ]
        
        과정 레벨은 초급의 경우 100, 중급의 경우 200, 고급의 경우 300으로 설정하세요.
        """,
        
        "modules": """
        다음 문서는 AWS 교육 과정의 모듈 정보입니다. 이 텍스트에서 각 과정의 모듈 정보를 추출하여 다음 JSON 형식으로 반환해주세요:
        
        [
          {
            "catalogId": "과정 레벨-과정코드 형식으로",
            "moduleNumber": "모듈 번호 (01, 02 등)",
            "moduleId": "카탈로그ID-M번호 형식",
            "module_title": "모듈 제목",
            "description": "모듈 설명",
            "duration": "예상 소요시간",
            "catalog_version": "연결된 카탈로그 버전"
          },
          ...
        ]
        
        각 과정에 포함된 모든 모듈을 추출해주세요.
        """,
        
        "labs": """
        다음 문서는 AWS 교육 과정의 실습 정보입니다. 이 텍스트에서 각 과정의 실습 정보를 추출하여 다음 JSON 형식으로 반환해주세요:
        
        [
          {
            "catalogId": "과정 레벨-과정코드 형식으로",
            "labId": "LAB-일련번호",
            "moduleId": "관련 모듈 ID",
            "labNumber": "실습 번호",
            "lab_title": "실습 제목",
            "description": "실습 설명",
            "duration": "예상 소요시간",
            "difficulty": "난이도 (1-5)",
            "catalog_version": "연결된 카탈로그 버전"
          },
          ...
        ]
        
        각 과정에 포함된 모든 실습을 추출해주세요.
        """
    }
    
    system_message = "당신은 텍스트에서 정보를 추출하여 구조화된 데이터로 반환하는 도우미입니다."
    
    try:
        # Claude 2 모델 사용
        modelId = "anthropic.claude-v2"
        
        # Claude 2는 메시지 형식이 아닌 프롬프트 형식을 사용합니다
        body = json.dumps({
            "prompt": f"\n\nHuman: {prompts[prompt_type]}\n\n문서 내용:\n{text}\n\nAssistant:",
            "max_tokens_to_sample": 4000,
            "temperature": 0.0,
            "stop_sequences": ["\n\nHuman:"]
        })
        
        response = bedrock_runtime.invoke_model(
            modelId=modelId,
            body=body
        )
        
        # Claude 2 응답 파싱
        response_body = json.loads(response.get('body').read().decode('utf-8'))
        text_content = response_body.get('completion', '')
        
        # 결과에서 JSON 부분만 추출
        json_start = text_content.find('[')
        json_end = text_content.rfind(']') + 1
        
        if json_start >= 0 and json_end > json_start:
            json_str = text_content[json_start:json_end]
            try:
                return json.loads(json_str)
            except json.JSONDecodeError:
                logger.error(f"JSON 파싱 오류, 전체 응답: {text_content}")
                return []
        else:
            logger.error(f"JSON 데이터를 찾을 수 없음, 전체 응답: {text_content}")
            return []
    
    except Exception as e:
        logger.error(f"Bedrock API 호출 오류: {str(e)}")
        return []

def save_to_json(data, filename):
    """데이터를 JSON 파일로 저장합니다."""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    logger.info(f"{filename} 파일이 생성되었습니다.")

def process_documents():
    """워드 문서를 처리하고 데이터를 추출하여 JSON으로 저장합니다."""
    
    # 1. 문서에서 텍스트 추출
    try:
        tnc_text = extract_text_from_docx("AWS TnC_ILT_DILT.docx")
        logger.info(f"문서에서 텍스트 추출 완료: {len(tnc_text)} 문자")
    except Exception as e:
        logger.error(f"문서 텍스트 추출 오류: {str(e)}")
        return False
    
    # 2. Bedrock 모델을 이용한 데이터 추출
    logger.info("카탈로그 정보 추출 중...")
    catalog_data = extract_data_with_bedrock(tnc_text, "catalog")
    if not catalog_data:
        logger.error("카탈로그 데이터 추출 실패")
        return False
    
    logger.info("모듈 정보 추출 중...")
    modules_data = extract_data_with_bedrock(tnc_text, "modules")
    if not modules_data:
        logger.error("모듈 데이터 추출 실패")
        return False
    
    logger.info("실습 정보 추출 중...")
    labs_data = extract_data_with_bedrock(tnc_text, "labs")
    if not labs_data:
        logger.error("실습 데이터 추출 실패")
        return False
    
    # 3. 버전 정보 추가
    for item in catalog_data:
        aws_code = item.get("awsCode", "")
        version = get_course_version_from_awstc(aws_code)
        item["version"] = version
        
        # 버전 정보를 모듈과 실습 데이터에도 포함시킴
        catalog_id = item.get("catalogId", "")
        if catalog_id:
            for module in modules_data:
                if module.get("catalogId") == catalog_id:
                    module["catalog_version"] = version
            
            for lab in labs_data:
                if lab.get("catalogId") == catalog_id:
                    lab["catalog_version"] = version
    
    # 4. 데이터를 JSON 파일로 저장
    save_to_json(catalog_data, "course_catalog.json")
    save_to_json(modules_data, "course_modules.json")
    save_to_json(labs_data, "course_labs.json")
    
    logger.info("\nJSON 파일 생성이 완료되었습니다.")
    logger.info("파일을 확인한 후 upload_data.py를 실행하여 DynamoDB에 업로드할 수 있습니다.")
    return True

if __name__ == "__main__":
    logger.info("AWS 교육 과정 데이터 추출 시작")
    
    # AWS 자격 증명 확인
    try:
        boto3.client('sts').get_caller_identity()
    except Exception as e:
        logger.error(f"AWS 자격 증명 오류: {str(e)}")
        logger.error("AWS 자격 증명을 확인하세요.")
        exit(1)
    
    # 데이터 추출 및 JSON 저장
    process_documents()