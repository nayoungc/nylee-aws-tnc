import docx
import re
import boto3
import uuid
from datetime import datetime

def extract_course_info(file_path):
    """문서에서 과정 정보를 추출하는 함수"""
    doc = docx.Document(file_path)
    
    # 텍스트 내용 추출
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    
    document_text = '\n'.join(full_text)
    
    # 과정 정보를 저장할 리스트
    courses = []
    
    # 패턴: 과정명 다음에 과정 설명이 오는 패턴
    course_patterns = re.finditer(r'([\w\s-]+)\n+과정 설명\n+(.*?)\n+수준\t제공 방법\t소요 시간\n+([\w가-힣]+)\t([\w가-힣\s-]+)\t(\d+[일시간])', document_text, re.DOTALL)
    
    for match in course_patterns:
        course_name = match.group(1).strip()
        course_description = match.group(2).strip()
        level = match.group(3).strip()
        delivery_method = match.group(4).strip()
        duration = match.group(5).strip()
        
        # 과정 목표 추출
        objectives_match = re.search(fr'{re.escape(course_name)}.*?과정 목표.*?\n(.*?)수강 대상', document_text, re.DOTALL)
        objectives = ""
        if objectives_match:
            objectives_text = objectives_match.group(1).strip()
            # 목표 항목 추출 (불릿 또는 숫자로 시작하는 항목)
            objective_items = re.findall(r'[•\-\*]\s*(.*?)(?:\n|\$)', objectives_text)
            if not objective_items:  # 불릿이 없으면 일반 텍스트로 간주
                objectives = objectives_text
            else:
                objectives = '\n'.join([f"• {item.strip()}" for item in objective_items])
        
        # 수강 대상 추출
        audience_match = re.search(fr'{re.escape(course_name)}.*?수강 대상.*?\n(.*?)수강 전 권장 사항', document_text, re.DOTALL)
        audience = ""
        if audience_match:
            audience_text = audience_match.group(1).strip()
            # 대상 항목 추출
            audience_items = re.findall(r'[•\-\*]\s*(.*?)(?:\n|\$)', audience_text)
            if not audience_items:  # 불릿이 없으면 일반 텍스트로 간주
                audience = audience_text
            else:
                audience = '\n'.join([f"• {item.strip()}" for item in audience_items])
        
        # 모듈 정보 추출
        modules = []
        modules_match = re.search(fr'{re.escape(course_name)}.*?과정 개요.*?\n(.*?)(?:(?=과정 설명)|\$)', document_text, re.DOTALL)
        
        if modules_match:
            modules_text = modules_match.group(1)
            # 모듈 패턴: "모듈 X: 제목" 또는 "Day X: 제목"
            module_patterns = re.finditer(r'(?:모듈|Day|모듈\s*\d+\s*-|모듈\s*\d+:)\s*(\d+)?[:\s-]?\s*([^\n]+)', modules_text)
            
            for module_match in module_patterns:
                module_number = module_match.group(1) if module_match.group(1) else ""
                module_title = module_match.group(2).strip()
                
                # 모듈 내용 (불릿 포인트 등)
                module_content_pattern = re.search(fr'{re.escape(module_title)}(.*?)(?=(?:모듈|Day|모듈\s*\d+\s*-|모듈\s*\d+:)|\$)', modules_text, re.DOTALL)
                module_content = ""
                if module_content_pattern:
                    module_content = module_content_pattern.group(1).strip()
                
                modules.append({
                    "number": module_number,
                    "title": module_title,
                    "content": module_content
                })
        
        # 실습 정보 추출
        labs = []
        labs_match = re.finditer(r'실습\s*(\d+)?:?\s*([^\n]+)', document_text)
        
        for lab_match in labs_match:
            lab_number = lab_match.group(1) if lab_match.group(1) else ""
            lab_title = lab_match.group(2).strip()
            
            labs.append({
                "number": lab_number,
                "title": lab_title
            })
        
        course_info = {
            "id": str(uuid.uuid4()),  # 고유 ID 생성
            "name": course_name,
            "description": course_description,
            "level": level,
            "deliveryMethod": delivery_method,
            "duration": duration,
            "objectives": objectives,
            "audience": audience,
            "modules": modules,
            "labs": labs,
            "createdAt": datetime.now().isoformat()
        }
        
        courses.append(course_info)
    
    return courses

def save_to_dynamodb(courses):
    """추출된 과정 정보를 DynamoDB에 저장하는 함수"""
    try:
        # DynamoDB 클라이언트 초기화
        dynamodb = boto3.resource('dynamodb')
        catalog_table = dynamodb.Table('TnC-CourseCatalog')
        modules_table = dynamodb.Table('TnC-CourseCatalog-Modules')
        
        for course in courses:
            # 기본 과정 정보를 카탈로그 테이블에 저장
            catalog_item = {
                "courseId": course["id"],
                "name": course["name"],
                "description": course["description"],
                "level": course["level"],
                "deliveryMethod": course["deliveryMethod"],
                "duration": course["duration"],
                "objectives": course["objectives"],
                "audience": course["audience"],
                "createdAt": course["createdAt"]
            }
            
            catalog_table.put_item(Item=catalog_item)
            print(f"과정 '{course['name']}'을(를) TnC-CourseCatalog에 저장했습니다.")
            
            # 모듈 정보를 모듈 테이블에 저장
            for i, module in enumerate(course["modules"]):
                module_item = {
                    "courseId": course["id"],
                    "moduleId": f"{course['id']}#module#{i+1}",
                    "courseTitle": course["name"],
                    "moduleNumber": module["number"] or str(i+1),
                    "moduleTitle": module["title"],
                    "moduleContent": module["content"],
                    "type": "module",
                    "createdAt": course["createdAt"]
                }
                
                modules_table.put_item(Item=module_item)
                print(f"모듈 '{module['title']}'을(를) TnC-CourseCatalog-Modules에 저장했습니다.")
            
            # 실습 정보를 모듈 테이블에 저장
            for i, lab in enumerate(course["labs"]):
                lab_item = {
                    "courseId": course["id"],
                    "moduleId": f"{course['id']}#lab#{i+1}",
                    "courseTitle": course["name"],
                    "labNumber": lab["number"] or str(i+1),
                    "labTitle": lab["title"],
                    "type": "lab",
                    "createdAt": course["createdAt"]
                }
                
                modules_table.put_item(Item=lab_item)
                print(f"실습 '{lab['title']}'을(를) TnC-CourseCatalog-Modules에 저장했습니다.")
        
        return True
    
    except Exception as e:
        print(f"DynamoDB 저장 중 오류 발생: {str(e)}")
        return False

def main():
    #file_path = "Instuctor.docx"
    file_path = 'AWS TnC_ILT_DILT.docx'
    
    print(f"'{file_path}'에서 과정 정보 추출 중...")
    courses = extract_course_info(file_path)
    
    print(f"총 {len(courses)}개의 과정을 추출했습니다.")
    
    # 추출된 과정 정보 출력 (저장 전 확인용)
    for i, course in enumerate(courses):
        print(f"\n[{i+1}] {course['name']}")
        print(f"레벨: {course['level']}")
        print(f"소요 시간: {course['duration']}")
        print(f"모듈 수: {len(course['modules'])}")
        print(f"실습 수: {len(course['labs'])}")
    
    # 확인 후 저장할지 결정
    confirmation = input("\n위 정보를 DynamoDB에 저장하시겠습니까? (y/n): ")
    
    if confirmation.lower() == 'y':
        success = save_to_dynamodb(courses)
        if success:
            print("\n모든 과정 정보가 DynamoDB에 성공적으로 저장되었습니다.")
        else:
            print("\n일부 데이터 저장에 실패했습니다. 오류 메시지를 확인하세요.")
    else:
        print("\n저장이 취소되었습니다.")

if __name__ == "__main__":
    main()