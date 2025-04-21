import boto3
import json
import logging
from typing import Dict, List, Any

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def load_json(filename):
    """JSON 파일을 로드합니다."""
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            data = json.load(f)
        logger.info(f"{filename} 파일을 성공적으로 로드했습니다. {len(data)}개 항목")
        return data
    except Exception as e:
        logger.error(f"{filename} 파일 로드 오류: {str(e)}")
        return None

def upload_to_dynamodb(table_name, items, ask_confirmation=True):
    """데이터를 DynamoDB 테이블에 업로드합니다."""
    if not items:
        logger.error(f"업로드할 항목이 없습니다: {table_name}")
        return False
        
    if ask_confirmation:
        confirmation = input(f"{len(items)}개의 항목을 {table_name} 테이블에 업로드하시겠습니까? (y/n): ")
        if confirmation.lower() != 'y':
            logger.info("업로드가 취소되었습니다.")
            return False
    
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(table_name)
    
    # 배치로 항목 추가 (25개 항목 단위로 나눠서 처리)
    batch_size = 25
    for i in range(0, len(items), batch_size):
        batch_items = items[i:i+batch_size]
        with table.batch_writer() as batch:
            for item in batch_items:
                batch.put_item(Item=item)
        logger.info(f"{len(batch_items)}개의 항목을 {table_name} 테이블에 업로드했습니다. ({i+1}-{i+len(batch_items)})")
    
    logger.info(f"총 {len(items)}개의 항목이 {table_name} 테이블에 업로드되었습니다.")
    return True

def main():
    """JSON 파일에서 데이터를 로드하고 DynamoDB에 업로드합니다."""
    
    # AWS 자격 증명 확인
    try:
        boto3.client('sts').get_caller_identity()
    except Exception as e:
        logger.error(f"AWS 자격 증명 오류: {str(e)}")
        logger.error("AWS 자격 증명을 확인하세요.")
        exit(1)
    
    # JSON 파일 로드
    logger.info("JSON 파일을 로드합니다...")
    catalog_data = load_json("course_catalog.json")
    modules_data = load_json("course_modules.json")
    labs_data = load_json("course_labs.json")
    
    if not catalog_data or not modules_data or not labs_data:
        logger.error("하나 이상의 JSON 파일을 로드하는 데 실패했습니다.")
        exit(1)
    
    # 테이블 존재 여부 확인
    dynamodb = boto3.client('dynamodb')
    tables_to_check = ['Tnc-CourseCatalog', 'Tnc-CourseCatalog-Modules', 'Tnc-CourseCatalog-Labs']
    missing_tables = []
    
    for table in tables_to_check:
        try:
            dynamodb.describe_table(TableName=table)
        except:
            missing_tables.append(table)
    
    if missing_tables:
        logger.error(f"다음 테이블이 존재하지 않습니다: {', '.join(missing_tables)}")
        logger.error("먼저 create_tables.py를 실행하여 테이블을 생성하세요.")
        exit(1)
    
    # 데이터 업로드
    logger.info("데이터 업로드를 시작합니다...")
    upload_to_dynamodb("Tnc-CourseCatalog", catalog_data)
    upload_to_dynamodb("Tnc-CourseCatalog-Modules", modules_data)
    upload_to_dynamodb("Tnc-CourseCatalog-Labs", labs_data)
    
    logger.info("데이터 업로드가 완료되었습니다!")

if __name__ == "__main__":
    logger.info("AWS 교육 과정 데이터 DynamoDB 업로드 시작")
    main()
