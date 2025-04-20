import boto3
import json
import os
from decimal import Decimal

def create_json_files():
    """JSON 파일이 없는 경우 생성"""
    
    # courses.json 생성
    if not os.path.exists('courses.json'):
        courses_data = [
            # courses.json 내용 (위에 제공된 내용 그대로 사용)
            # 여기에는 실제 courses.json의 데이터를 넣어주세요
        ]
        with open('courses.json', 'w', encoding='utf-8') as f:
            json.dump(courses_data, f, ensure_ascii=False, indent=4)
        print("courses.json 파일이 생성되었습니다.")
    
    # modules.json 생성
    if not os.path.exists('modules.json'):
        modules_data = [
            # modules.json 내용 (위에 제공된 내용 그대로 사용)
            # 여기에는 실제 modules.json의 데이터를 넣어주세요
        ]
        with open('modules.json', 'w', encoding='utf-8') as f:
            json.dump(modules_data, f, ensure_ascii=False, indent=4)
        print("modules.json 파일이 생성되었습니다.")
    
    print("JSON 파일 생성 완료")

def load_json_data():
    """JSON 파일에서 데이터 로드"""
    
    # courses.json 로드
    with open('courses.json', 'r', encoding='utf-8') as f:
        courses_data = json.load(f)
    
    # modules.json 로드
    with open('modules.json', 'r', encoding='utf-8') as f:
        modules_data = json.load(f)
    
    return courses_data, modules_data

def import_data_to_dynamodb():
    """DynamoDB에 데이터 임포트"""

    # 기본 세션 사용 (환경 변수 또는 IAM 역할에서 자격 증명 가져옴)
    session = boto3.Session(region_name='us-east-1')  # 리전은 필요에 따라 변경하세요
    
    # DynamoDB 리소스 생성
    dynamodb = session.resource('dynamodb')
    
    # 테이블 이름 정의
    course_table_name = 'Tnc-CourseCatalog'
    module_table_name = 'Tnc-CourseCatalog-Modules'
    
    # DynamoDB 클라이언트 생성
    dynamodb_client = session.client('dynamodb')
    
    # 기존 테이블 목록 가져오기
    existing_tables = dynamodb_client.list_tables()['TableNames']
    
    # 과정 테이블 생성 (존재하지 않는 경우)
    if course_table_name not in existing_tables:
        print(f"테이블 생성 중: {course_table_name}")
        dynamodb_client.create_table(
            TableName=course_table_name,
            KeySchema=[
                {'AttributeName': 'id', 'KeyType': 'HASH'}  # 파티션 키
            ],
            AttributeDefinitions=[
                {'AttributeName': 'id', 'AttributeType': 'S'}
            ],
            ProvisionedThroughput={'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
        )
        print(f"테이블 생성 완료: {course_table_name}")
        
        # 테이블이 활성화될 때까지 대기
        waiter = dynamodb_client.get_waiter('table_exists')
        print(f"{course_table_name} 테이블이 활성화될 때까지 대기 중...")
        waiter.wait(TableName=course_table_name)
    else:
        print(f"테이블이 이미 존재합니다: {course_table_name}")
    
    # 모듈 테이블 생성 (존재하지 않는 경우)
    if module_table_name not in existing_tables:
        print(f"테이블 생성 중: {module_table_name}")
        dynamodb_client.create_table(
            TableName=module_table_name,
            KeySchema=[
                {'AttributeName': 'module_id', 'KeyType': 'HASH'},  # 파티션 키
                {'AttributeName': 'course_id', 'KeyType': 'RANGE'}  # 정렬 키
            ],
            AttributeDefinitions=[
                {'AttributeName': 'module_id', 'AttributeType': 'S'},
                {'AttributeName': 'course_id', 'AttributeType': 'S'}
            ],
            ProvisionedThroughput={'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
        )
        print(f"테이블 생성 완료: {module_table_name}")
        
        # 테이블이 활성화될 때까지 대기
        waiter = dynamodb_client.get_waiter('table_exists')
        print(f"{module_table_name} 테이블이 활성화될 때까지 대기 중...")
        waiter.wait(TableName=module_table_name)
    else:
        print(f"테이블이 이미 존재합니다: {module_table_name}")
    
    # 테이블 참조 가져오기
    course_table = dynamodb.Table(course_table_name)
    module_table = dynamodb.Table(module_table_name)
    
    # JSON 파일에서 데이터 로드
    courses_data, modules_data = load_json_data()
    
    # 과정 데이터 삽입
    print("과정 데이터 삽입 중...")
    for course in courses_data:
        # id 필드 추가
        course['id'] = course['course_id']  # id 필드 추가
        
        # DynamoDB는 Decimal 형식을 사용하므로 JSON을 DynamoDB 형식으로 변환
        course_item = json.loads(json.dumps(course), parse_float=Decimal)
        course_table.put_item(Item=course_item)
    print(f"{len(courses_data)}개의 과정 데이터 삽입 완료")
    
    # 모듈 데이터 삽입
    print("모듈 데이터 삽입 중...")
    for module in modules_data:
        # id 필드 추가
        module['id'] = module['module_id']  # id 필드 추가
        
        module_item = json.loads(json.dumps(module), parse_float=Decimal)
        module_table.put_item(Item=module_item)
    print(f"{len(modules_data)}개의 모듈 데이터 삽입 완료")
    
    print("모든 데이터가 성공적으로 DynamoDB에 저장되었습니다!")

def main():
    try:
        # JSON 파일이 없으면 생성
        create_json_files()
        
        # DynamoDB에 데이터 임포트
        import_data_to_dynamodb()
        
    except Exception as e:
        print(f"오류 발생: {e}")

if __name__ == "__main__":
    main()