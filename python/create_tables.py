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


    # 4. Tnc-CourseCatalog-Materials 테이블 생성
    try:
        response = dynamodb.create_table(
            TableName='Tnc-CourseCatalog-Materials',
            KeySchema=[
                {'AttributeName': 'catalogId', 'KeyType': 'HASH'},
                {'AttributeName': 'materialTypeId', 'KeyType': 'RANGE'}
            ],
            AttributeDefinitions=[
                {'AttributeName': 'catalogId', 'AttributeType': 'S'},
                {'AttributeName': 'materialTypeId', 'AttributeType': 'S'},
                {'AttributeName': 'moduleId', 'AttributeType': 'S'},
                {'AttributeName': 'materialType', 'AttributeType': 'S'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'GSI1',
                    'KeySchema': [
                        {'AttributeName': 'moduleId', 'KeyType': 'HASH'},
                        {'AttributeName': 'materialType', 'KeyType': 'RANGE'}
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
        logger.info(f"테이블 생성 중: Tnc-CourseCatalog-Materials")
    except ClientError as e:
        logger.error(f"테이블 생성 오류 Tnc-CourseCatalog-Materials: {e.response['Error']['Message']}")
    
    # 5. Tnc-CourseCatalog-Quizzes 테이블 생성
    try:
        response = dynamodb.create_table(
            TableName='Tnc-CourseCatalog-Quizzes',
            KeySchema=[
                {'AttributeName': 'catalogId', 'KeyType': 'HASH'},
                {'AttributeName': 'quizTypeId', 'KeyType': 'RANGE'}
            ],
            AttributeDefinitions=[
                {'AttributeName': 'catalogId', 'AttributeType': 'S'},
                {'AttributeName': 'quizTypeId', 'AttributeType': 'S'},
                {'AttributeName': 'quizType', 'AttributeType': 'S'},
                {'AttributeName': 'moduleId', 'AttributeType': 'S'},
                {'AttributeName': 'quizId', 'AttributeType': 'S'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'GSI1',
                    'KeySchema': [
                        {'AttributeName': 'quizType', 'KeyType': 'HASH'},
                        {'AttributeName': 'catalogId', 'KeyType': 'RANGE'}
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
                        {'AttributeName': 'moduleId', 'KeyType': 'HASH'},
                        {'AttributeName': 'quizId', 'KeyType': 'RANGE'}
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
        logger.info(f"테이블 생성 중: Tnc-CourseCatalog-Quizzes")
    except ClientError as e:
        logger.error(f"테이블 생성 오류 Tnc-CourseCatalog-Quizzes: {e.response['Error']['Message']}")
    
    # 나머지 테이블도 비슷한 방식으로 생성... (간략화를 위해 일부만 포함)
    # 6. ioTnc-CourseCatalog-Questions 테이블 생성
    try:
        response = dynamodb.create_table(
            TableName='Tnc-CourseCatalog-Questions',
            KeySchema=[
                {'AttributeName': 'quizId', 'KeyType': 'HASH'},
                {'AttributeName': 'questionNumber', 'KeyType': 'RANGE'}
            ],
            AttributeDefinitions=[
                {'AttributeName': 'quizId', 'AttributeType': 'S'},
                {'AttributeName': 'questionNumber', 'AttributeType': 'S'},
                {'AttributeName': 'catalogId', 'AttributeType': 'S'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'GSI1',
                    'KeySchema': [
                        {'AttributeName': 'catalogId', 'KeyType': 'HASH'}
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
        logger.info(f"테이블 생성 중: Tnc-CourseCatalog-Questions")
    except ClientError as e:
        logger.error(f"테이블 생성 오류 Tnc-CourseCatalog-Questions: {e.response['Error']['Message']}")
    
    # 7. Tnc-Courses 테이블 생성
    try:
        response = dynamodb.create_table(
            TableName='Tnc-Courses',
            KeySchema=[
                {'AttributeName': 'courseId', 'KeyType': 'HASH'},
                {'AttributeName': 'startDate', 'KeyType': 'RANGE'}
            ],
            AttributeDefinitions=[
                {'AttributeName': 'courseId', 'AttributeType': 'S'},
                {'AttributeName': 'startDate', 'AttributeType': 'S'},
                {'AttributeName': 'catalogId', 'AttributeType': 'S'},
                {'AttributeName': 'shareCode', 'AttributeType': 'S'},
                {'AttributeName': 'instructor', 'AttributeType': 'S'},
                {'AttributeName': 'customerId', 'AttributeType': 'S'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'GSI1',
                    'KeySchema': [
                        {'AttributeName': 'catalogId', 'KeyType': 'HASH'},
                        {'AttributeName': 'startDate', 'KeyType': 'RANGE'}
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
                        {'AttributeName': 'shareCode', 'KeyType': 'HASH'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'},
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                },
                {
                    'IndexName': 'GSI3',
                    'KeySchema': [
                        {'AttributeName': 'instructor', 'KeyType': 'HASH'},
                        {'AttributeName': 'startDate', 'KeyType': 'RANGE'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'},
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                },
                {
                    'IndexName': 'GSI4',
                    'KeySchema': [
                        {'AttributeName': 'customerId', 'KeyType': 'HASH'},
                        {'AttributeName': 'startDate', 'KeyType': 'RANGE'}
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
        logger.info(f"테이블 생성 중: Tnc-Courses")
    except ClientError as e:
        logger.error(f"테이블 생성 오류 Tnc-Courses: {e.response['Error']['Message']}")
        
    # 8. Tnc-Customers 테이블 생성
    try:
        response = dynamodb.create_table(
            TableName='Tnc-Customers',
            KeySchema=[
                {'AttributeName': 'customerId', 'KeyType': 'HASH'}
            ],
            AttributeDefinitions=[
                {'AttributeName': 'customerId', 'AttributeType': 'S'},
                {'AttributeName': 'customerName', 'AttributeType': 'S'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'GSI1',
                    'KeySchema': [
                        {'AttributeName': 'customerName', 'KeyType': 'HASH'}
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
        logger.info(f"테이블 생성 중: Tnc-Customers")
    except ClientError as e:
        logger.error(f"테이블 생성 오류 Tnc-Customers: {e.response['Error']['Message']}")

    # 9. Tnc-Courses (개설된 과정 인스턴스) 테이블 생성
    try:
        response = dynamodb.create_table(
            TableName='Tnc-Courses',
            KeySchema=[
                {'AttributeName': 'courseId', 'KeyType': 'HASH'},  # 파티션 키
                {'AttributeName': 'startDate', 'KeyType': 'RANGE'}  # 정렬 키
            ],
            AttributeDefinitions=[
                {'AttributeName': 'courseId', 'AttributeType': 'S'},
                {'AttributeName': 'startDate', 'AttributeType': 'S'},
                {'AttributeName': 'catalogId', 'AttributeType': 'S'},
                {'AttributeName': 'shareCode', 'AttributeType': 'S'},
                {'AttributeName': 'instructor', 'AttributeType': 'S'},
                {'AttributeName': 'customerId', 'AttributeType': 'S'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'GSI1',
                    'KeySchema': [
                        {'AttributeName': 'catalogId', 'KeyType': 'HASH'},
                        {'AttributeName': 'startDate', 'KeyType': 'RANGE'}
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
                        {'AttributeName': 'shareCode', 'KeyType': 'HASH'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'},
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                },
                {
                    'IndexName': 'GSI3',
                    'KeySchema': [
                        {'AttributeName': 'instructor', 'KeyType': 'HASH'},
                        {'AttributeName': 'startDate', 'KeyType': 'RANGE'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'},
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                },
                {
                    'IndexName': 'GSI4',
                    'KeySchema': [
                        {'AttributeName': 'customerId', 'KeyType': 'HASH'},
                        {'AttributeName': 'startDate', 'KeyType': 'RANGE'}
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
        logger.info(f"테이블 생성 중: Tnc-Courses")
    except ClientError as e:
        logger.error(f"테이블 생성 오류 Tnc-Courses: {e.response['Error']['Message']}")

    # 10. Tnc-Course-UserQuizzes (사용자 퀴즈 응시 정보) 테이블 생성
    try:
        response = dynamodb.create_table(
            TableName='Tnc-Course-UserQuizzes',
            KeySchema=[
                {'AttributeName': 'userId', 'KeyType': 'HASH'},  # 파티션 키
                {'AttributeName': 'courseId_quizType_quizId', 'KeyType': 'RANGE'}  # 정렬 키
            ],
            AttributeDefinitions=[
                {'AttributeName': 'userId', 'AttributeType': 'S'},
                {'AttributeName': 'courseId_quizType_quizId', 'AttributeType': 'S'},
                {'AttributeName': 'courseId', 'AttributeType': 'S'},
                {'AttributeName': 'quizId', 'AttributeType': 'S'},
                {'AttributeName': 'completionTime', 'AttributeType': 'S'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'GSI1',
                    'KeySchema': [
                        {'AttributeName': 'courseId', 'KeyType': 'HASH'},
                        {'AttributeName': 'userId', 'KeyType': 'RANGE'}
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
                        {'AttributeName': 'quizId', 'KeyType': 'HASH'},
                        {'AttributeName': 'completionTime', 'KeyType': 'RANGE'}
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
        logger.info(f"테이블 생성 중: Tnc-Course-UserQuizzes")
    except ClientError as e:
        logger.error(f"테이블 생성 오류 Tnc-Course-UserQuizzes: {e.response['Error']['Message']}")

    # 11. Tnc-Course-UserResponses (사용자 퀴즈 문항별 응답) 테이블 생성
    try:
        response = dynamodb.create_table(
            TableName='Tnc-Course-UserResponses',
            KeySchema=[
                {'AttributeName': 'userId_courseId_quizId', 'KeyType': 'HASH'},  # 파티션 키
                {'AttributeName': 'questionNumber_attemptNumber', 'KeyType': 'RANGE'}  # 정렬 키
            ],
            AttributeDefinitions=[
                {'AttributeName': 'userId_courseId_quizId', 'AttributeType': 'S'},
                {'AttributeName': 'questionNumber_attemptNumber', 'AttributeType': 'S'},
                {'AttributeName': 'quizId', 'AttributeType': 'S'},
                {'AttributeName': 'questionNumber', 'AttributeType': 'S'},
                {'AttributeName': 'courseId', 'AttributeType': 'S'},
                {'AttributeName': 'isCorrect', 'AttributeType': 'S'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'GSI1',
                    'KeySchema': [
                        {'AttributeName': 'quizId', 'KeyType': 'HASH'},
                        {'AttributeName': 'questionNumber', 'KeyType': 'RANGE'}
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
                        {'AttributeName': 'courseId', 'KeyType': 'HASH'},
                        {'AttributeName': 'isCorrect', 'KeyType': 'RANGE'}
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
        logger.info(f"테이블 생성 중: Tnc-Course-UserResponses")
    except ClientError as e:
        logger.error(f"테이블 생성 오류 Tnc-Course-UserResponses: {e.response['Error']['Message']}")

    # 12. Tnc-Course-UserSurveys (사용자 설문조사 제출 정보) 테이블 생성
    try:
        response = dynamodb.create_table(
            TableName='Tnc-Course-UserSurveys',
            KeySchema=[
                {'AttributeName': 'randomId', 'KeyType': 'HASH'},  # 파티션 키
                {'AttributeName': 'courseId_surveyType_surveyId', 'KeyType': 'RANGE'}  # 정렬 키
            ],
            AttributeDefinitions=[
                {'AttributeName': 'randomId', 'AttributeType': 'S'},
                {'AttributeName': 'courseId_surveyType_surveyId', 'AttributeType': 'S'},
                {'AttributeName': 'courseId', 'AttributeType': 'S'},
                {'AttributeName': 'surveyType', 'AttributeType': 'S'},
                {'AttributeName': 'surveyId', 'AttributeType': 'S'},
                {'AttributeName': 'completionTime', 'AttributeType': 'S'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'GSI1',
                    'KeySchema': [
                        {'AttributeName': 'courseId', 'KeyType': 'HASH'},
                        {'AttributeName': 'surveyType', 'KeyType': 'RANGE'}
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
                        {'AttributeName': 'surveyId', 'KeyType': 'HASH'},
                        {'AttributeName': 'completionTime', 'KeyType': 'RANGE'}
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
        logger.info(f"테이블 생성 중: Tnc-Course-UserSurveys")
    except ClientError as e:
        logger.error(f"테이블 생성 오류 Tnc-Course-UserSurveys: {e.response['Error']['Message']}")

    # 13. Tnc-Course-UserSurveyResponses (사용자 설문조사 문항별 응답) 테이블 생성
    try:
        response = dynamodb.create_table(
            TableName='Tnc-Course-UserSurveyResponses',
            KeySchema=[
                {'AttributeName': 'randomId_courseId_surveyId', 'KeyType': 'HASH'},  # 파티션 키
                {'AttributeName': 'questionNumber', 'KeyType': 'RANGE'}  # 정렬 키
            ],
            AttributeDefinitions=[
                {'AttributeName': 'randomId_courseId_surveyId', 'AttributeType': 'S'},
                {'AttributeName': 'questionNumber', 'AttributeType': 'S'},
                {'AttributeName': 'surveyId', 'AttributeType': 'S'},
                {'AttributeName': 'courseId', 'AttributeType': 'S'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'GSI1',
                    'KeySchema': [
                        {'AttributeName': 'surveyId', 'KeyType': 'HASH'},
                        {'AttributeName': 'questionNumber', 'KeyType': 'RANGE'}
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
                        {'AttributeName': 'courseId', 'KeyType': 'HASH'},
                        {'AttributeName': 'surveyId', 'KeyType': 'RANGE'}
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
        logger.info(f"테이블 생성 중: Tnc-Course-UserSurveyResponses")
    except ClientError as e:
        logger.error(f"테이블 생성 오류 Tnc-Course-UserSurveyResponses: {e.response['Error']['Message']}")

    # 14. Tnc-SurveyAnalytics (설문조사 분석 데이터) 테이블 생성
    try:
        response = dynamodb.create_table(
            TableName='Tnc-SurveyAnalytics',
            KeySchema=[
                {'AttributeName': 'surveyId', 'KeyType': 'HASH'},  # 파티션 키
                {'AttributeName': 'courseId', 'KeyType': 'RANGE'}  # 정렬 키
            ],
            AttributeDefinitions=[
                {'AttributeName': 'surveyId', 'AttributeType': 'S'},
                {'AttributeName': 'courseId', 'AttributeType': 'S'},
                {'AttributeName': 'updatedAt', 'AttributeType': 'S'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'GSI1',
                    'KeySchema': [
                        {'AttributeName': 'courseId', 'KeyType': 'HASH'},
                        {'AttributeName': 'updatedAt', 'KeyType': 'RANGE'}
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
        logger.info(f"테이블 생성 중: Tnc-SurveyAnalytics")
    except ClientError as e:
        logger.error(f"테이블 생성 오류 Tnc-SurveyAnalytics: {e.response['Error']['Message']}")

    # 15. Tnc-DashboardMetrics (대시보드 지표) 테이블 생성
    try:
        response = dynamodb.create_table(
            TableName='Tnc-DashboardMetrics',
            KeySchema=[
                {'AttributeName': 'metricType', 'KeyType': 'HASH'},  # 파티션 키
                {'AttributeName': 'timeFrame_entityId', 'KeyType': 'RANGE'}  # 정렬 키
            ],
            AttributeDefinitions=[
                {'AttributeName': 'metricType', 'AttributeType': 'S'},
                {'AttributeName': 'timeFrame_entityId', 'AttributeType': 'S'},
                {'AttributeName': 'entityId', 'AttributeType': 'S'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'GSI1',
                    'KeySchema': [
                        {'AttributeName': 'entityId', 'KeyType': 'HASH'},
                        {'AttributeName': 'metricType', 'KeyType': 'RANGE'}
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
        logger.info(f"테이블 생성 중: Tnc-DashboardMetrics")
    except ClientError as e:
        logger.error(f"테이블 생성 오류 Tnc-DashboardMetrics: {e.response['Error']['Message']}")

    # 16. Tnc-Customers (고객사 정보) 테이블 생성
    try:
        response = dynamodb.create_table(
            TableName='Tnc-Customers',
            KeySchema=[
                {'AttributeName': 'customerId', 'KeyType': 'HASH'}  # 파티션 키만 있음
            ],
            AttributeDefinitions=[
                {'AttributeName': 'customerId', 'AttributeType': 'S'},
                {'AttributeName': 'customerName', 'AttributeType': 'S'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'GSI1',
                    'KeySchema': [
                        {'AttributeName': 'customerName', 'KeyType': 'HASH'}
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
        logger.info(f"테이블 생성 중: Tnc-Customers")
    except ClientError as e:
        logger.error(f"테이블 생성 오류 Tnc-Customers: {e.response['Error']['Message']}")

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