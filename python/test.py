import re

def extract_course_outlines(text):
    # 과정 개요 섹션 찾기
    course_pattern = re.compile(r'([A-Za-z\s]+)\n\n과정 설명.*?\n\n\t과정 개요\n\n\t(.*?)(?=\n\n\n\n\n|\\$)', re.DOTALL)
    
    courses = course_pattern.findall(text)
    print(f"courses = {courses}")
    
    results = []
    
    for course_name, outline_section in courses:
        course_name = course_name.strip()
        
        # 일자별 모듈 찾기 (1일 차, 2일 차, 3일 차 등)
        day_pattern = re.compile(r'(\d일 차)(.*?)(?=\d일 차|\\$)', re.DOTALL)
        days = day_pattern.findall(outline_section)
        
        modules_by_day = {}
        
        if days:  # 일자별로 구분된 경우
            for day, day_content in days:
                # 모듈 추출
                module_pattern = re.compile(r'모듈 (\d+): (.*?)\n(.*?)(?=모듈 \d+:|\\$)', re.DOTALL)
                modules = module_pattern.findall(day_content)
                
                day_modules = []
                for module_num, module_name, module_content in modules:
                    # 실습 추출
                    lab_pattern = re.compile(r'실습[^:]*?: (.*?)(?=\n|\\$)', re.DOTALL)
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
            module_pattern = re.compile(r'모듈 (\d+)[^:]*?: (.*?)\n(.*?)(?=모듈 \d+|\\$)', re.DOTALL)
            modules = module_pattern.findall(outline_section)
            
            course_modules = []
            for module_num, module_name, module_content in modules:
                # 실습 추출
                lab_pattern = re.compile(r'실습[^:]*?: (.*?)(?=\n|\\$)', re.DOTALL)
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
    digital_pattern = re.compile(r'Digital Classroom – (.*?)\n\n과정 설명.*?\n\n\t과정 개요\n\n\t(.*?)(?=\n\n\n\n|\\$)', re.DOTALL)
    digital_courses = digital_pattern.findall(text)
    
    results = []
    
    for course_name, outline_section in digital_courses:
        # 모듈과 실습 추출
        module_pattern = re.compile(r'(모듈 \d+[^:]*?)(?:\n· )?([^\n]*?)(?:\n· .*?실습 \d+: (.*?))?(?=\n\n모듈|\n\n사후|\\$)', re.DOTALL)
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

    print(f"regular_courses = {regular_courses}")
    
    # Digital Classroom 과정 추출
    #digital_courses = extract_digital_classroom_outlines(document_text)
    
    all_courses = regular_courses  #+ digital_courses
    
    # 결과 출력
    for course in all_courses:
        print(f"course = {course}")

        print(regular_courses)
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

# 파일에서 텍스트 읽어오기
def extract_course_info_from_file(filename):
    # 여러 인코딩을 시도합니다
    encodings = ['utf-8', 'cp949', 'euc-kr', 'latin-1']
    
    for encoding in encodings:
        try:
            with open(filename, 'r', encoding=encoding) as f:
                document_text = f.read()
            #print(f"파일을 성공적으로 열었습니다. 사용된 인코딩: {encoding}")
            return process_document(document_text)
        except UnicodeDecodeError:
            print(f"{encoding} 인코딩으로 파일을 읽을 수 없습니다. 다른 인코딩을 시도합니다.")
            continue
    
    # 모든 인코딩 시도 실패
    raise ValueError("지원하는 인코딩으로 파일을 읽을 수 없습니다.")

# 사용 예시
file_path = 'AWS TnC_ILT_DILT.docx'
extract_course_info_from_file(file_path)