import re
import pandas as pd
from collections import defaultdict

def extract_course_outlines(text):
    # 과정 개요 섹션 찾기
    course_pattern = re.compile(r'([A-Za-z\s]+)\n\n과정 설명.*?\n\n\t과정 개요\n\n\t(.*?)(?=\n\n\n\n\n|\$)', re.DOTALL)
    courses = course_pattern.findall(text)
    
    results = []
    
    for course_name, outline_section in courses:
        course_name = course_name.strip()
        
        # 일자별 모듈 찾기 (1일 차, 2일 차, 3일 차 등)
        day_pattern = re.compile(r'(\d일 차)(.*?)(?=\d일 차|\$)', re.DOTALL)
        days = day_pattern.findall(outline_section)
        
        modules_by_day = {}
        
        if days:  # 일자별로 구분된 경우
            for day, day_content in days:
                # 모듈 추출
                module_pattern = re.compile(r'모듈 (\d+): (.*?)\n(.*?)(?=모듈 \d+:|\$)', re.DOTALL)
                modules = module_pattern.findall(day_content)
                
                day_modules = []
                for module_num, module_name, module_content in modules:
                    # 실습 추출
                    lab_pattern = re.compile(r'실습[^:]*?: (.*?)(?=\n|\$)', re.DOTALL)
                    labs = lab_pattern.findall(module_content)
                    
                    day_modules.append({
                        "모듈번호": f"모듈 {module_num}",
                        "모듈명": module_name.strip(),
                        "실습": labs
                    })
                
                modules_by_day[day] = day_modules
            
            results.append({
                "과정명": course_name,
                "일자별 모듈": modules_by_day
            })
            
        else:  # 일자 구분 없이 모듈만 있는 경우
            # 모듈 추출
            module_pattern = re.compile(r'모듈 (\d+)[^:]*?: (.*?)\n(.*?)(?=모듈 \d+|\$)', re.DOTALL)
            modules = module_pattern.findall(outline_section)
            
            course_modules = []
            for module_num, module_name, module_content in modules:
                # 실습 추출
                lab_pattern = re.compile(r'실습[^:]*?: (.*?)(?=\n|\$)', re.DOTALL)
                labs = lab_pattern.findall(module_content)
                
                course_modules.append({
                    "모듈번호": f"모듈 {module_num}",
                    "모듈명": module_name.strip(),
                    "실습": labs
                })
            
            results.append({
                "과정명": course_name,
                "모듈": course_modules
            })
    
    return results

def extract_digital_classroom_outlines(text):
    # Digital Classroom 과정 찾기
    digital_pattern = re.compile(r'Digital Classroom – (.*?)\n\n과정 설명.*?\n\n\t과정 개요\n\n\t(.*?)(?=\n\n\n\n|\$)', re.DOTALL)
    digital_courses = digital_pattern.findall(text)
    
    results = []
    
    for course_name, outline_section in digital_courses:
        # 모듈과 실습 추출
        module_pattern = re.compile(r'(모듈 \d+[^:]*?)(?:\n· )?([^\n]*?)(?:\n· .*?실습 \d+: (.*?))?(?=\n\n모듈|\n\n사후|\$)', re.DOTALL)
        modules = module_pattern.findall(outline_section)
        
        course_modules = []
        for module_num, module_name, lab_name in modules:
            module_data = {
                "모듈번호": module_num.strip(),
                "모듈명": module_name.strip()
            }
            
            if lab_name:
                module_data["실습"] = [lab_name.strip()]
            else:
                module_data["실습"] = []
                
            course_modules.append(module_data)
        
        results.append({
            "과정명": f"Digital Classroom - {course_name.strip()}",
            "모듈": course_modules
        })
    
    return results

def process_document(document_text):
    # 일반 과정 추출
    regular_courses = extract_course_outlines(document_text)
    
    # Digital Classroom 과정 추출
    digital_courses = extract_digital_classroom_outlines(document_text)
    
    all_courses = regular_courses + digital_courses
    
    # 결과 출력
    for course in all_courses:
        print(f"\n{'='*80}\n{course['과정명']}\n{'='*80}")
        
        if "일자별 모듈" in course:
            for day, modules in course["일자별 모듈"].items():
                print(f"\n{day}")
                for module in modules:
                    print(f"- {module['모듈번호']}: {module['모듈명']}")
                    if module["실습"]:
                        print(f"  실습: {', '.join(module['실습'])}")
        else:
            for module in course["모듈"]:
                print(f"- {module['모듈번호']}: {module['모듈명']}")
                if module["실습"]:
                    print(f"  실습: {', '.join(module['실습'])}")

    return all_courses

# 파일에서 텍스트 읽어오기 (여기서는 document_text 변수에 문서 내용이 있다고 가정)
def extract_course_info_from_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        document_text = f.read()
    
    return process_document(document_text)

# 사용 예시
# results = extract_course_info_from_file('aws_courses.txt')

# 실제로는 외부에서 문서 텍스트를 받아서 처리
def main(document_text):
    return process_document(document_text)

# 결과를 엑셀로 저장하는 추가 기능
# def save_to_excel(courses, filename='aws_course_outlines.xlsx'):
#     with pd.ExcelWriter(filename) as writer:
#         for course in courses:
#             course_name = course['과정명']
            
#             if "일자별 모듈" in course:
#                 # 일자별로 시트 생성
#                 for day, modules in course["일자별 모듈"].items():
#                     df = pd.DataFrame(modules)
#                     # 실습 리스트를 문자열로 변환
#                     df['실습'] = df['실습'].apply(lambda x: ', '.join(x) if x else '없음')
#                     sheet_name = f"{course_name[:20]}_{day}"[:31]  # 엑셀 시트명 길이 제한
#                     df.to_excel(writer, sheet_name=sheet_name, index=False)
#             else:
#                 # 단일 시트로 생성
#                 df = pd.DataFrame(course["모듈"])
#                 # 실습 리스트를 문자열로 변환
#                 df['실습'] = df['실습'].apply(lambda x: ', '.join(x) if x else '없음')
#                 sheet_name = f"{course_name[:30]}"
#                 df.to_excel(writer, sheet_name=sheet_name, index=False)
    
#     print(f"\n과정 개요가 {filename}에 저장되었습니다.")

file_path = 'AWS TnC_ILT_DILT.docx'
results = extract_course_info_from_file(file_path)
save_to_excel(results)