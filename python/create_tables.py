import boto3
from botocore.exceptions import ClientError
import time
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def delete_table_if_exists(table_name):
    """지정된 테이블이 존재하면 삭제합니다."""
    dynamodb = boto3.client('dynamodb')
    
    try:
        # 테이블 존재 여부 확인
        dynamodb.describe_table(TableName=table_name)
        logger.info(f"테이블이 존재합니다: {table_name}, 삭제를 시작합니다.")
        
        # 테이블 삭제
        dynamodb.delete_table(TableName=table_name)
        logger.info(f"테이블 삭제 요청 완료: {table_name}")
        
        # 테이블 삭제 완료 대기
        waiter = dynamodb.get_waiter('table_not_exists')
        waiter.wait(TableName=table_name)
        logger.info(f"테이블이 성공적으로 삭제되었습니다: {table_name}")
        
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceNotFoundException':
            logger.info(f"테이블이 존재하지 않습니다: {table_name}")
        else:
            logger.error(f"테이블 삭제 중 오류 발생: {str(e)}")
            raise e

def create_course_catalog_tables():
    """AWS 교육 과정 관련 기본 DynamoDB 테이블들을 생성합니다."""
    
    # 기존 테이블 삭제
    tables_to_create = [
        'Tnc-CourseCatalog', 
        'Tnc-CourseCatalog-Modules', 
        'Tnc-CourseCatalog-Labs'
    ]
    
    for table in tables_to_create:
        delete_table_if_exists(table)
    
    # 테이블 생성 시작
    dynamodb = boto3.client('dynamodb')
    
    # 1. Tnc-CourseCatalog 테이블 생성
    try:
        response = dynamodb.create_table(
            TableName='Tnc-CourseCatalog',
            KeySchema=[
                {'AttributeName': 'catalogId', 'KeyType': 'HASH'},  # 파티션 키
                {'AttributeName': 'version', 'KeyType': 'RANGE'}    # 정렬 키
            ],
            AttributeDefinitions=[
                {'AttributeName': 'catalogId', 'AttributeType': 'S'},
                {'AttributeName': 'version', 'AttributeType': 'S'},
                {'AttributeName': 'title', 'AttributeType': 'S'},
                {'AttributeName': 'awsCode', 'AttributeType': 'S'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'GSI1',
                    'KeySchema': [
                        {'AttributeName': 'title', 'KeyType': 'HASH'},
                        {'AttributeName': 'version', 'KeyType': 'RANGE'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'},
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                },
                {
                    'IndexName': 'GSI2',
                    'KeySchema': [
                        {'AttributeName': 'awsCode', 'KeyType': 'HASH'},
                        {'AttributeName': 'version', 'KeyType': 'RANGE'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'},
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                }
            ],
            ProvisionedThroughput={
                'ReadCapacityUnits': 5,
                'WriteCapacityUnits': 5
            }
        )
        logger.info(f"테이블 생성 중: Tnc-CourseCatalog")
    except ClientError as e:
        logger.error(f"테이블 생성 오류 Tnc-CourseCatalog: {e.response['Error']['Message']}")
    
    # 2. Tnc-CourseCatalog-Modules 테이블 생성
    try:
        response = dynamodb.create_table(
            TableName='Tnc-CourseCatalog-Modules',
            KeySchema=[
                {'AttributeName': 'catalogId', 'KeyType': 'HASH'},
                {'AttributeName': 'moduleNumber', 'KeyType': 'RANGE'}
            ],
            AttributeDefinitions=[
                {'AttributeName': 'catalogId', 'AttributeType': 'S'},
                {'AttributeName': 'moduleNumber', 'AttributeType': 'S'},
                {'AttributeName': 'moduleId', 'AttributeType': 'S'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'GSI1',
                    'KeySchema': [
                        {'AttributeName': 'moduleId', 'KeyType': 'HASH'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'},
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                }
            ],
            ProvisionedThroughput={
                'ReadCapacityUnits': 5,
                'WriteCapacityUnits': 5
            }
        )
        logger.info(f"테이블 생성 중: Tnc-CourseCatalog-Modules")
    except ClientError as e:
        logger.error(f"테이블 생성 오류 Tnc-CourseCatalog-Modules: {e.response['Error']['Message']}")
    
    # 3. Tnc-CourseCatalog-Labs 테이블 생성
    try:
        response = dynamodb.create_table(
            TableName='Tnc-CourseCatalog-Labs',
            KeySchema=[
                {'AttributeName': 'catalogId', 'KeyType': 'HASH'},
                {'AttributeName': 'labId', 'KeyType': 'RANGE'}
            ],
            AttributeDefinitions=[
                {'AttributeName': 'catalogId', 'AttributeType': 'S'},
                {'AttributeName': 'labId', 'AttributeType': 'S'},
                {'AttributeName': 'moduleId', 'AttributeType': 'S'},
                {'AttributeName': 'labNumber', 'AttributeType': 'S'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'GSI1',
                    'KeySchema': [
                        {'AttributeName': 'moduleId', 'KeyType': 'HASH'},
                        {'AttributeName': 'labNumber', 'KeyType': 'RANGE'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'},
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                }
            ],
            ProvisionedThroughput={
                'ReadCapacityUnits': 5,
                'WriteCapacityUnits': 5
            }
        )
        logger.info(f"테이블 생성 중: Tnc-CourseCatalog-Labs")
    except ClientError as e:
        logger.error(f"테이블 생성 오류 Tnc-CourseCatalog-Labs: {e.response['Error']['Message']}")

    # 테이블 생성 완료 대기
    for table in tables_to_create:
        try:
            logger.info(f"{table} 테이블 생성 상태 확인 중...")
            wait_for_table_creation(table)
        except Exception as e:
            logger.error(f"테이블 상태 확인 오류 {table}: {str(e)}")

def wait_for_table_creation(table_name):
    """테이블이 생성될 때까지 대기합니다."""
    dynamodb = boto3.client('dynamodb')
    
    max_retries = 10
    retries = 0
    
    while retries < max_retries:
        try:
            response = dynamodb.describe_table(TableName=table_name)
            status = response['Table']['TableStatus']
            
            if status == 'ACTIVE':
                logger.info(f"테이블 {table_name}이(가) 성공적으로 생성되었습니다!")
                return True
            
            logger.info(f"테이블 {table_name} 상태: {status} - 대기 중...")
            time.sleep(5)  # 5초 대기
            retries += 1
        except ClientError as e:
            logger.error(f"테이블 상태 확인 오류: {str(e)}")
            return False
    
    logger.warning(f"테이블 {table_name} 생성 시간 초과")
    return False

if __name__ == "__main__":
    logger.info("DynamoDB 테이블 생성 시작")
    create_course_catalog_tables()
    logger.info("DynamoDB 테이블 생성 완료")