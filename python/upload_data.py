import boto3
import json
import logging
from botocore.exceptions import ClientError

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger()

def load_data_from_json(file_name):
    """
    JSON 파일에서 데이터를 로드하는 함수
    """
    try:
        with open(file_name, 'r', encoding='utf-8') as file:
            data = json.load(file)
        return data
    except Exception as e:
        logger.error(f"JSON 파일 '{file_name}' 로드 실패: {str(e)}")
        return None

def save_to_dynamodb():
    """
    3개의 JSON 파일을 각 DynamoDB 테이블에 저장하는 함수
    """
    # DynamoDB 클라이언트 생성
    dynamodb = boto3.resource('dynamodb')
    
    # 1. 과정 카탈로그 데이터 저장
    course_catalog_data = load_data_from_json('Tnc-CourseCatalog.json')
    if course_catalog_data:
        try:
            table = dynamodb.Table('Tnc-CourseCatalog')
            success_count = 0
            
            for item in course_catalog_data:
                response = table.put_item(Item=item)
                success_count += 1
                
            logger.info(f"Tnc-CourseCatalog 테이블에 {success_count}개의 과정이 성공적으로 저장되었습니다.")
        except ClientError as e:
            logger.error(f"Tnc-CourseCatalog 테이블에 데이터 저장 실패: {e.response['Error']['Message']}")
    
    # 2. 모듈 데이터 저장
    modules_data = load_data_from_json('Tnc-CourseCatalog-Modules.json')
    if modules_data:
        try:
            table = dynamodb.Table('Tnc-CourseCatalog-Modules')
            success_count = 0
            
            for module in modules_data:
                response = table.put_item(Item=module)
                success_count += 1
                
            logger.info(f"Tnc-CourseCatalog-Modules 테이블에 {success_count}개의 모듈이 성공적으로 저장되었습니다.")
        except ClientError as e:
            logger.error(f"Tnc-CourseCatalog-Modules 테이블에 데이터 저장 실패: {e.response['Error']['Message']}")
    
    # 3. 실습 데이터 저장
    labs_data = load_data_from_json('Tnc-CourseCatalog-Labs.json')
    if labs_data:
        try:
            table = dynamodb.Table('Tnc-CourseCatalog-Labs')
            success_count = 0
            
            for lab in labs_data:
                response = table.put_item(Item=lab)
                success_count += 1
                
            logger.info(f"Tnc-CourseCatalog-Labs 테이블에 {success_count}개의 실습이 성공적으로 저장되었습니다.")
        except ClientError as e:
            logger.error(f"Tnc-CourseCatalog-Labs 테이블에 데이터 저장 실패: {e.response['Error']['Message']}")

if __name__ == "__main__":
    save_to_dynamodb()