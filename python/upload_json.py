import boto3
import json
import logging
from botocore.exceptions import ClientError
from decimal import Decimal

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger()

# DynamoDB에서는 float 대신 Decimal을 사용하므로 JSON 파싱 시 변환
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def load_json_data(file_path):
    """
    JSON 파일에서 데이터를 로드하는 함수
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            # float를 Decimal로 변환
            return json.loads(file.read(), parse_float=Decimal)
    except Exception as e:
        logger.error(f"JSON 파일 '{file_path}' 로드 실패: {str(e)}")
        return []

def import_data_to_dynamodb():
    """
    JSON 파일에서 데이터를 읽어 DynamoDB 테이블에 추가하는 함수
    """
    # DynamoDB 리소스 생성
    dynamodb = boto3.resource('dynamodb')
    
    # 1. 코스 카탈로그 데이터 추가
    catalog_data = load_json_data('Tnc-CourseCatalog.json')
    if catalog_data:
        table = dynamodb.Table('Tnc-CourseCatalog')
        success_count = 0
        
        for item in catalog_data:
            try:
                # 타임스탬프 등 필요한 추가 속성 처리
                response = table.put_item(Item=item)
                success_count += 1
                logger.info(f"과정 '{item.get('title')}' 추가 성공")
            except ClientError as e:
                logger.error(f"과정 '{item.get('title')}' 추가 실패: {e}")
        
        logger.info(f"총 {success_count}/{len(catalog_data)} 과정이 성공적으로 추가되었습니다.")
    
    # 2. 모듈 데이터 추가
    modules_data = load_json_data('Tnc-CourseCatalog-Modules.json')
    if modules_data:
        table = dynamodb.Table('Tnc-CourseCatalog-Modules')
        success_count = 0
        
        for item in modules_data:
            try:
                response = table.put_item(Item=item)
                success_count += 1
                logger.info(f"모듈 '{item.get('title')}' 추가 성공")
            except ClientError as e:
                logger.error(f"모듈 '{item.get('title')}' 추가 실패: {e}")
        
        logger.info(f"총 {success_count}/{len(modules_data)} 모듈이 성공적으로 추가되었습니다.")
    
    # 3. 실습 데이터 추가
    labs_data = load_json_data('Tnc-CourseCatalog-Labs.json')
    if labs_data:
        table = dynamodb.Table('Tnc-CourseCatalog-Labs')
        success_count = 0
        
        for item in labs_data:
            try:
                response = table.put_item(Item=item)
                success_count += 1
                logger.info(f"실습 '{item.get('title')}' 추가 성공")
            except ClientError as e:
                logger.error(f"실습 '{item.get('title')}' 추가 실패: {e}")
        
        logger.info(f"총 {success_count}/{len(labs_data)} 실습이 성공적으로 추가되었습니다.")

def verify_data():
    """
    테이블에 추가된 데이터를 확인하는 함수
    """
    dynamodb = boto3.resource('dynamodb')
    
    # 각 테이블의 항목 수 확인
    tables = ['Tnc-CourseCatalog', 'Tnc-CourseCatalog-Modules', 'Tnc-CourseCatalog-Labs']
    
    for table_name in tables:
        try:
            table = dynamodb.Table(table_name)
            response = table.scan(Select='COUNT')
            item_count = response['Count']
            logger.info(f"{table_name} 테이블의 항목 수: {item_count}")
        except ClientError as e:
            logger.error(f"{table_name} 테이블 스캔 중 오류 발생: {e}")

if __name__ == "__main__":
    import_data_to_dynamodb()
    verify_data()
    logger.info("데이터 가져오기 작업 완료")