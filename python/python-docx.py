import os
import json
import boto3
from decimal import Decimal
import argparse

# 리전 설정
REGION_NAME = 'us-east-1'  # 필요에 따라 변경
BEDROCK_REGION = 'us-east-1'  # Bedrock 사용 가능한 리전

# 테이블 이름 정의
COURSE_TABLE_NAME = 'Tnc-CourseCatalog'
MODULE_TABLE_NAME = 'Tnc-CourseCatalog-Modules'

def load_json_data():
    """JSON 파일에서 데이터 로드"""
    courses_data = []
    modules_data = []
    
    # courses.json 로드
    if os.path.exists('courses.json'):
        with open('courses.json', 'r', encoding='utf-8') as f:
            courses_data = json.load(f)
        print(f"courses.json에서 {len(courses_data)}개 과정 정보 로드 완료")
    else:
        print("courses.json 파일이 존재하지 않습니다.")
    
    # modules.json 로드
    if os.path.exists('modules.json'):
        with open('modules.json', 'r', encoding='utf-8') as f:
            modules_data = json.load(f)
        print(f"modules.json에서 {len(modules_data)}개 모듈 정보 로드 완료")
    else:
        print("modules.json 파일이 존재하지 않습니다.")
    
    return courses_data, modules_data

def import_data_to_dynamodb():
    """DynamoDB에 데이터 임포트"""
    # 세션 생성
    session = boto3.Session(region_name=REGION_NAME)
    
    # DynamoDB 리소스 생성
    dynamodb = session.resource('dynamodb')
    
    # JSON 파일에서 데이터 로드
    courses_data, modules_data = load_json_data()
    
    # 데이터가 없으면 종료
    if not courses_data and not modules_data:
        print("로드된 데이터가 없습니다. 프로그램을 종료합니다.")
        return False
    
    # 테이블 참조 가져오기 (테이블이 이미 존재한다고 가정)
    course_table = dynamodb.Table(COURSE_TABLE_NAME)
    module_table = dynamodb.Table(MODULE_TABLE_NAME)
    
    # 과정 데이터 삽입 - 기존 테이블 구조에 맞춰 id 키 사용
    if courses_data:
        print("과정 데이터 삽입 중...")
        for course in courses_data:
            # DynamoDB는 Decimal 형식을 사용하므로 JSON을 DynamoDB 형식으로 변환
            course_item = json.loads(json.dumps(course), parse_float=Decimal)
            
            # id 키를 course_id 값으로 설정하고 나머지 필드는 그대로 유지
            item_to_put = {
                'id': course['course_id']  # course_id 값을 id 키로 사용
            }
            # 다른 모든 필드 추가
            for k, v in course_item.items():
                if k != 'id':  # id 필드가 있다면 건너뛰기
                    item_to_put[k] = v
            
            course_table.put_item(Item=item_to_put)
            
        print(f"{len(courses_data)}개의 과정 데이터 삽입 완료")
    
    # 모듈 데이터 삽입
    if modules_data:
        print("모듈 데이터 삽입 중...")
        for module in modules_data:
            module_item = json.loads(json.dumps(module), parse_float=Decimal)
            module_table.put_item(Item=module_item)
        print(f"{len(modules_data)}개의 모듈 데이터 삽입 완료")
    
    print("모든 데이터가 성공적으로 DynamoDB에 저장되었습니다!")
    return True

def create_sample_modules_json():
    """샘플 modules.json 파일 생성 (모듈 데이터가 없는 경우)"""
    sample_modules = [
        {
            "module_id": "AWS-CPE-M1",
            "course_id": "AWS-CPE",
            "module_number": 1,
            "module_name": "Amazon Web Services 소개",
            "module_type": "강의",
            "module_description": "AWS 용어집, 클라우드 컴퓨팅 유형, AWS를 이용한 클라우드 컴퓨팅"
        },
        {
            "module_id": "AWS-CPE-M2",
            "course_id": "AWS-CPE",
            "module_number": 2,
            "module_name": "클라우드 컴퓨팅",
            "module_type": "강의",
            "module_description": "AWS에서의 컴퓨팅, AWS 컴퓨팅 서비스, 카테고리 심층 분석: 서버리스"
        },
        {
            "module_id": "AWS-CPE-LAB1",
            "course_id": "AWS-CPE",
            "module_number": "LAB1",
            "module_name": "Amazon Simple Storage Service(S3) 입문",
            "module_type": "실습",
            "module_description": "S3 버킷 생성 및 객체 업로드/다운로드 실습"
        },
        {
            "module_id": "AWS-ARCH-M1",
            "course_id": "AWS-ARCH",
            "module_number": 1,
            "module_name": "아키텍팅 기본 사항",
            "module_type": "강의",
            "module_description": "AWS 서비스 및 인프라, 인프라 모델, AWS API 도구, 인프라 보안, Well-Architected Framework"
        },
        {
            "module_id": "AWS-ARCH-LAB1",
            "course_id": "AWS-ARCH",
            "module_number": "LAB1",
            "module_name": "AWS API 도구를 사용한 EC2 인스턴스 배포 살펴보기",
            "module_type": "실습",
            "module_description": "AWS Management Console과 CLI를 활용한 EC2 인스턴스 배포 실습"
        },
        {
            "module_id": "AWS-SE-M1",
            "course_id": "AWS-SE",
            "module_number": 1,
            "module_name": "AWS 기반 보안",
            "module_type": "강의",
            "module_description": "AWS 클라우드의 보안 설계 원칙, AWS 공동 책임 모델"
        }
    ]
    
    with open('modules.json', 'w', encoding='utf-8') as f:
        json.dump(sample_modules, f, ensure_ascii=False, indent=4)
    print(f"{len(sample_modules)}개의 샘플 모듈 정보가 modules.json에 저장되었습니다.")

def main():
    try:
        parser = argparse.ArgumentParser(description='AWS 교육 과정 정보 DynamoDB 저장 프로그램')
        parser.add_argument('--create-modules', action='store_true', 
                           help='modules.json이 없으면 샘플 파일 생성')
        args = parser.parse_args()
        
        print("AWS 교육 과정 정보 DynamoDB 저장 프로그램을 시작합니다.")
        
        # modules.json이 없고 샘플 생성 옵션이 활성화된 경우
        if args.create_modules and not os.path.exists('modules.json'):
            create_sample_modules_json()
        
        # DynamoDB에 데이터 임포트
        success = import_data_to_dynamodb()
        
        if success:
            print("프로그램 실행이 성공적으로 완료되었습니다.")
        else:
            print("프로그램이 오류와 함께 종료되었습니다.")
        
    except Exception as e:
        print(f"오류 발생: {e}")

if __name__ == "__main__":
    main()