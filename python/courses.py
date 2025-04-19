import re
import boto3
import json
import uuid
from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any, Optional
from datetime import datetime

# 데이터 클래스 정의
@dataclass
class Module:
    title: str
    topics: List[str] = field(default_factory=list)

@dataclass
class Lab:
    title: str
    description: str = ""

@dataclass
class Course:
    title: str
    description: str = ""
    level: str = ""
    delivery_method: str = ""
    duration: str = ""
    objectives: List[str] = field(default_factory=list)
    audience: List[str] = field(default_factory=list)
    prerequisites: List[str] = field(default_factory=list)
    registration_link: str = ""
    modules: List[Module] = field(default_factory=list)
    labs: List[Lab] = field(default_factory=list)

def extract_courses_from_text(text: str) -> List[Course]:
    """텍스트에서 과정 정보 추출"""
    courses = []
    
    # 정규 표현식 패턴으로 과정 블록 찾기
    course_blocks = re.findall(r'([^\n]+)\n\n과정 설명\n\n(.*?)(?=\n\n\t레벨\n\t제공 방법\n\t소요 시간|\n\n\n\n\n)', text, re.DOTALL)
    
    for title, content_block in course_blocks:
        course = Course(title=title.strip())
        
        # 설명 추출
        description_match = re.search(r'과정 설명\n\n(.*?)(?=\n\n\t레벨)', content_block, re.DOTALL)
        if description_match:
            course.description = description_match.group(1).strip()
        
        # 레벨, 제공 방법, 소요 시간 추출
        level_match = re.search(r'\t레벨\n\n\t([^\n]+)', content_block)
        if level_match:
            course.level = level_match.group(1).strip()
            
        delivery_match = re.search(r'\t제공 방법\n\n\t([^\n]+)', content_block)
        if delivery_match:
            course.delivery_method = delivery_match.group(1).strip()
            
        duration_match = re.search(r'\t소요 시간\n\n\t([^\n]+)', content_block)
        if duration_match:
            course.duration = duration_match.group(1).strip()
        
        # 과정 목표 추출
        objectives_match = re.search(r'과정 목표\n\n이 과정에서 배우게 될 내용은 다음과 같습니다.\n\n(.*?)(?=\n\n수강 대상|\n\n등록)', content_block, re.DOTALL)
        if objectives_match:
            objectives_text = objectives_match.group(1)
            course.objectives = [obj.strip() for obj in re.findall(r'·\s*(.*?)(?=\n·|\n\n|\$)', objectives_text, re.DOTALL)]
        
        # 수강 대상 추출
        audience_match = re.search(r'수강 대상\n\n이 과정의 대상은 다음과 같습니다.\n\n(.*?)(?=\n\n수강 전 권장 사항|\n\n등록)', content_block, re.DOTALL)
        if audience_match:
            audience_text = audience_match.group(1)
            course.audience = [aud.strip() for aud in re.findall(r'·\s*(.*?)(?=\n·|\n\n|\$)', audience_text, re.DOTALL)]
        
        # 수강 전 권장 사항 추출
        prereq_match = re.search(r'수강 전 권장 사항\n\n이 과정을 수강하려면 다음 조건을 갖추는 것이 좋습니다.\n\n(.*?)(?=\n\n등록)', content_block, re.DOTALL)
        if prereq_match:
            prereq_text = prereq_match.group(1)
            course.prerequisites = [pre.strip() for pre in re.findall(r'·\s*(.*?)(?=\n·|\n\n|\$)', prereq_text, re.DOTALL)]
        
        # 등록 링크 추출
        reg_match = re.search(r'등록\n\n(.*?)(?=\n\n\t과정 개요|\n\n)', content_block, re.DOTALL)
        if reg_match:
            course.registration_link = reg_match.group(1).strip()
        
        # 과정 개요(모듈) 추출
        modules_section_match = re.search(r'\t과정 개요\n\n(.*?)(?=\n\n\d일 차|\n\n모듈|\n\n\$)', content_block, re.DOTALL)
        if modules_section_match:
            modules_text = modules_section_match.group(1)
            
            # 모듈 파싱
            module_blocks = re.findall(r'모듈 (\d+)[^:]*:\s*([^\n]+)\n\n(·[^모듈]*?)(?=모듈|\n\n\n|\$)', modules_text, re.DOTALL)
            if module_blocks:
                for _, title, topics_text in module_blocks:
                    module = Module(title=title.strip())
                    topics = re.findall(r'·\s*(.*?)(?=\n·|\n\n|\$)', topics_text, re.DOTALL)
                    module.topics = [topic.strip() for topic in topics]
                    course.modules.append(module)
            else:
                # 일 차 기준으로 모듈 추출 시도
                day_modules = re.findall(r'(\d일 차)\n\n(.*?)(?=\n\n\d일 차|\n\n\$)', content_block, re.DOTALL)
                for day, content in day_modules:
                    module = Module(title=f"{day} 강의 내용")
                    topics = re.findall(r'·\s*(.*?)(?=\n·|\n\n|\$)|모듈 \d+[^:]*:\s*([^\n]+)', content, re.DOTALL)
                    module.topics = [t[0] or t[1] for t in topics if t[0] or t[1]]
                    course.modules.append(module)
        
        # 실습 추출
        labs_match = re.findall(r'실습 (\d+)[^:]*:\s*([^\n]+)(?:\n\n([^실습].*?))?(?=\n\n실습|\n\n\n|\$)', content_block, re.DOTALL)
        
        for _, title, description in labs_match:
            lab = Lab(
                title=title.strip(),
                description=description.strip() if description else ""
            )
            course.labs.append(lab)
        
        courses.append(course)
    
    return courses

def save_courses_to_dynamodb(courses: List[Course], table_name: str, region: str = 'ap-northeast-2'):
    """과정 데이터를 DynamoDB에 저장"""
    dynamodb = boto3.resource('dynamodb', region_name=region)
    table = dynamodb.Table(table_name)
    timestamp = datetime.now().isoformat()
    batch_size = 25  # DynamoDB 배치 쓰기 제한
    
    total_items = 0
    
    for course in courses:
        # 과정 ID 생성 (UUID v4)
        course_id = str(uuid.uuid4())
        
        # 과정 메타데이터 항목
        course_item = {
            'PK': f"COURSE#{course_id}",
            'SK': f"METADATA#{course_id}",
            'id': course_id,
            'title': course.title,
            'description': course.description,
            'level': course.level,
            'deliveryMethod': course.delivery_method,
            'duration': course.duration,
            'registrationLink': course.registration_link,
            'type': 'Course',
            'createdAt': timestamp,
            'updatedAt': timestamp
        }
        
        if course.objectives:
            course_item['objectives'] = course.objectives
            
        if course.audience:
            course_item['audience'] = course.audience
            
        if course.prerequisites:
            course_item['prerequisites'] = course.prerequisites
            
        # 과정 메타데이터 항목 저장
        try:
            table.put_item(Item=course_item)
            total_items += 1
            
            # 모듈 항목 저장
            for idx, module in enumerate(course.modules):
                module_index = str(idx).zfill(3)  # 001, 002, 003, ...
                module_item = {
                    'PK': f"COURSE#{course_id}",
                    'SK': f"MODULE#{module_index}",
                    'id': f"{course_id}#MODULE#{module_index}",
                    'title': module.title,
                    'topics': module.topics if module.topics else [],
                    'moduleOrder': idx,
                    'type': 'Module',
                    'courseId': course_id,
                    'createdAt': timestamp,
                    'updatedAt': timestamp
                }
                table.put_item(Item=module_item)
                total_items += 1
            
            # 실습 항목 저장
            for idx, lab in enumerate(course.labs):
                lab_index = str(idx).zfill(3)  # 001, 002, 003, ...
                lab_item = {
                    'PK': f"COURSE#{course_id}",
                    'SK': f"LAB#{lab_index}",
                    'id': f"{course_id}#LAB#{lab_index}",
                    'title': lab.title,
                    'description': lab.description,
                    'labOrder': idx,
                    'type': 'Lab',
                    'courseId': course_id,
                    'createdAt': timestamp,
                    'updatedAt': timestamp
                }
                table.put_item(Item=lab_item)
                total_items += 1
                
            print(f"저장 완료: '{course.title}' (모듈 {len(course.modules)}개, 실습 {len(course.labs)}개)")
            
        except Exception as e:
            print(f"오류 발생 - 과정 '{course.title}' 저장 중: {str(e)}")
    
    print(f"전체 {len(courses)}개 과정에서 총 {total_items}개 항목 저장 완료")

def main():
    # 설정값
    TABLE_NAME = 'Tnc-CourseCatalog'
    REGION = 'us-east-1'  # 필요하면 변경
    INPUT_FILE = 'aws_courses.txt'
    
    try:
        # 파일 읽기
        with open(INPUT_FILE, 'r', encoding='utf-8') as f:
            text = f.read()
        
        # 과정 추출
        courses = extract_courses_from_text(text)
        print(f"{len(courses)}개의 과정 추출 완료")
        
        # 디버깅용 JSON 저장
        with open('extracted_courses.json', 'w', encoding='utf-8') as f:
            json.dump([asdict(course) for course in courses], f, ensure_ascii=False, indent=2)
        
        # DynamoDB에 저장
        save_courses_to_dynamodb(courses, TABLE_NAME, REGION)
        
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    main()