import boto3
import time
import logging
from botocore.exceptions import ClientError

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger()

def create_dynamodb_tables():
    """
    DynamoDB 테이블 3개를 생성하는 함수:
    1. Tnc-CourseCatalog
    2. Tnc-CourseCatalog-Modules
    3. Tnc-CourseCatalog-Labs
    """
    # DynamoDB 클라이언트 생성
    dynamodb = boto3.client('dynamodb')
    
    # 1. Tnc-CourseCatalog 테이블 생성
    try:
        logger.info("Tnc-CourseCatalog 테이블 생성 시작...")
        response = dynamodb.create_table(
            TableName='Tnc-CourseCatalog',
            KeySchema=[
                {'AttributeName': 'catalogId', 'KeyType': 'HASH'},  # 파티션 키
                {'AttributeName': 'title', 'KeyType': 'RANGE'}      # 정렬 키
            ],
            AttributeDefinitions=[
                {'AttributeName': 'catalogId', 'AttributeType': 'S'},
                {'AttributeName': 'title', 'AttributeType': 'S'},
                {'AttributeName': 'version', 'AttributeType': 'S'},
                {'AttributeName': 'awsCode', 'AttributeType': 'S'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'Tnc-CourseCatalog-GSI1',
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
                    'IndexName': 'Tnc-CourseCatalog-GSI2',
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
                'ReadCapacityUnits': 10,
                'WriteCapacityUnits': 5
            },
            DeletionProtectionEnabled=True
        )
        logger.info(f"Tnc-CourseCatalog 테이블 생성 요청 성공: {response['TableDescription']['TableStatus']}")
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceInUseException':
            logger.warning(f"Tnc-CourseCatalog 테이블이 이미 존재합니다.")
        else:
            logger.error(f"Tnc-CourseCatalog 테이블 생성 중 오류 발생: {e}")
    
    # 2. Tnc-CourseCatalog-Modules 테이블 생성
    try:
        logger.info("Tnc-CourseCatalog-Modules 테이블 생성 시작...")
        response = dynamodb.create_table(
            TableName='Tnc-CourseCatalog-Modules',
            KeySchema=[
                {'AttributeName': 'catalogId', 'KeyType': 'HASH'},   # 파티션 키
                {'AttributeName': 'moduleNumber', 'KeyType': 'RANGE'} # 정렬 키
            ],
            AttributeDefinitions=[
                {'AttributeName': 'catalogId', 'AttributeType': 'S'},
                {'AttributeName': 'moduleNumber', 'AttributeType': 'S'},
                {'AttributeName': 'title', 'AttributeType': 'S'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'Tnc-CourseCatalog-Modules-GSI1',
                    'KeySchema': [
                        {'AttributeName': 'title', 'KeyType': 'HASH'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'},
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                }
            ],
            ProvisionedThroughput={
                'ReadCapacityUnits': 10,
                'WriteCapacityUnits': 5
            },
            DeletionProtectionEnabled=True
        )
        logger.info(f"Tnc-CourseCatalog-Modules 테이블 생성 요청 성공: {response['TableDescription']['TableStatus']}")
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceInUseException':
            logger.warning(f"Tnc-CourseCatalog-Modules 테이블이 이미 존재합니다.")
        else:
            logger.error(f"Tnc-CourseCatalog-Modules 테이블 생성 중 오류 발생: {e}")
    
    # 3. Tnc-CourseCatalog-Labs 테이블 생성
    try:
        logger.info("Tnc-CourseCatalog-Labs 테이블 생성 시작...")
        response = dynamodb.create_table(
            TableName='Tnc-CourseCatalog-Labs',
            KeySchema=[
                {'AttributeName': 'catalogId', 'KeyType': 'HASH'},  # 파티션 키
                {'AttributeName': 'labNumber', 'KeyType': 'RANGE'}  # 정렬 키
            ],
            AttributeDefinitions=[
                {'AttributeName': 'catalogId', 'AttributeType': 'S'},
                {'AttributeName': 'labNumber', 'AttributeType': 'S'},
                {'AttributeName': 'moduleId', 'AttributeType': 'S'},
                {'AttributeName': 'title', 'AttributeType': 'S'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'Tnc-CourseCatalog-Labs-GSI1',
                    'KeySchema': [
                        {'AttributeName': 'moduleId', 'KeyType': 'HASH'},
                        {'AttributeName': 'labNumber', 'KeyType': 'RANGE'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'},
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                },
                {
                    'IndexName': 'Tnc-CourseCatalog-Labs-GSI2',
                    'KeySchema': [
                        {'AttributeName': 'title', 'KeyType': 'HASH'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'},
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                }
            ],
            ProvisionedThroughput={
                'ReadCapacityUnits': 10,
                'WriteCapacityUnits': 5
            },
            DeletionProtectionEnabled=True
        )
        logger.info(f"Tnc-CourseCatalog-Labs 테이블 생성 요청 성공: {response['TableDescription']['TableStatus']}")
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceInUseException':
            logger.warning(f"Tnc-CourseCatalog-Labs 테이블이 이미 존재합니다.")
        else:
            logger.error(f"Tnc-CourseCatalog-Labs 테이블 생성 중 오류 발생: {e}")
    
    # 테이블 생성 완료 대기
    logger.info("테이블이 활성 상태가 될 때까지 대기 중...")
    tables = ['Tnc-CourseCatalog', 'Tnc-CourseCatalog-Modules', 'Tnc-CourseCatalog-Labs']
    
    for table_name in tables:
        try:
            waiter = dynamodb.get_waiter('table_exists')
            waiter.wait(
                TableName=table_name,
                WaiterConfig={'Delay': 5, 'MaxAttempts': 20}
            )
            logger.info(f"{table_name} 테이블이 활성화되었습니다.")
        except ClientError as e:
            logger.error(f"{table_name} 테이블 대기 중 오류 발생: {e}")

if __name__ == "__main__":
    create_dynamodb_tables()
    logger.info("모든 테이블 생성 작업 완료")