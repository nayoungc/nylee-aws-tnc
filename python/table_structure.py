import docx
import pandas as pd
import re

def extract_course_info_from_docx(file_path):
    """
    .docx 파일에서 2줄짜리 표를 추출하고 레벨과 소요 시간 정보를 가져오는 함수
    
    Args:
        file_path (str): .docx 파일 경로
        
    Returns:
        list: 과정 정보 딕셔너리들의 리스트
    """
    print(f"문서 제목: {file_path}")
    
    # 문서 열기
    doc = docx.Document(file_path)
    print(f"문서를 불러왔습니다.")
    
    # 기본 정보 출력
    print(f"문단 수: {len(doc.paragraphs)}")
    print(f"표 수: {len(doc.tables)}")
    
    # 표 정보 저장할 리스트
    two_row_tables = []
    course_info_list = []
    
    # 내장 표 처리
    for idx, table in enumerate(doc.tables):
        # 2줄짜리 표만 필터링
        if len(table.rows) == 2:
            print(f"2줄짜리 표 발견 (표 #{idx+1})")
            
            # 표 데이터 추출
            try:
                headers = []
                values = []
                
                # 첫 번째 행 (헤더)
                for cell in table.rows[0].cells:
                    headers.append(cell.text.strip())
                
                # 두 번째 행 (값)
                for cell in table.rows[1].cells:
                    values.append(cell.text.strip())
                
                # 헤더와 값으로 딕셔너리 생성
                table_data = dict(zip(headers, values))
                two_row_tables.append(table_data)
                
                # 레벨과 소요 시간 정보를 찾음
                level = None
                duration = None
                
                # 헤더에서 "레벨"이나 "수준"이 포함된 열 찾기
                for header, value in table_data.items():
                    if "레벨" in header.lower() or "수준" in header.lower():
                        level = value
                    elif "소요 시간" in header.lower() or "기간" in header.lower() or "duration" in header.lower():
                        duration = value
                
                # 열 이름이 명확하지 않은 경우, 값을 기준으로 추측
                if not level or not duration:
                    for header, value in table_data.items():
                        # 값이 "기초", "중급", "고급" 등을 포함하면 레벨일 가능성 높음
                        if value.lower() in ["기초", "중급", "고급", "초급", "intermediate", "fundamental", "advanced", "basic"]:
                            level = value
                        # 값이 "일" 또는 "시간"을 포함하면 소요 시간일 가능성 높음
                        elif "일" in value or "시간" in value or "hours" in value or "days" in value:
                            duration = value
                
                # 과정명 추출 시도 (표 앞 문단에서)
                course_name = ""
                table_index = doc._element.xpath('.//w:tbl').index(table._element)
                
                # 표 바로 앞 문단 검색 (최대 5개 문단 전까지)
                for i in range(1, 6):
                    if table_index - i >= 0:
                        para_index = get_paragraph_index_before_table(doc, table_index - i)
                        if para_index >= 0:
                            potential_title = doc.paragraphs[para_index].text.strip()
                            if potential_title and len(potential_title) > 5 and not potential_title.startswith('•'):
                                course_name = potential_title
                                break
                
                # 결과 저장
                if level or duration:
                    course_info = {
                        "course_name": course_name,
                        "level": level,
                        "duration": duration,
                        "table_index": idx,
                        "full_table_data": table_data
                    }
                    course_info_list.append(course_info)
                    print(f"추출된 정보: 과정명='{course_name}', 레벨='{level}', 소요 시간='{duration}'")
                
            except Exception as e:
                print(f"표 {idx+1} 처리 중 오류 발생: {str(e)}")
    
    if not two_row_tables:
        print("2줄짜리 표를 찾을 수 없습니다.")
        
        # 표 형식 텍스트 검색 시도
        print("\n문단에서 표 형식 텍스트 검색 중...")
        level_duration_patterns = find_level_duration_patterns(doc.paragraphs)
        if level_duration_patterns:
            course_info_list.extend(level_duration_patterns)
    
    return course_info_list

def get_paragraph_index_before_table(doc, table_index):
    """표 앞에 있는 문단 인덱스 찾기"""
    # 문서의 모든 요소 확인
    all_elements = []
    for i, paragraph in enumerate(doc.paragraphs):
        all_elements.append(('paragraph', i, paragraph._element))
    for i, table in enumerate(doc.tables):
        all_elements.append(('table', i, table._element))
    
    # 요소 순서대로 정렬
    all_elements.sort(key=lambda x: doc._element.xpath('.//w:p | .//w:tbl').index(x[2]))
    
    # 지정된 테이블 바로 앞의 문단 찾기
    for i, (elem_type, elem_index, _) in enumerate(all_elements):
        if elem_type == 'table' and elem_index == table_index:
            if i > 0 and all_elements[i-1][0] == 'paragraph':
                return all_elements[i-1][1]
    
    return -1

def find_level_duration_patterns(paragraphs):
    """문단에서 레벨과 소요 시간 패턴 찾기"""
    results = []
    
    # 레벨 및 소요 시간 패턴
    level_pattern = r'(레벨|수준|level)[\s:]*([가-힣a-zA-Z]+)'  # 레벨: 중급
    duration_pattern = r'(소요\s*시간|기간|duration)[\s:]*([\d가-힣a-zA-Z\s]+)'  # 소요 시간: 3일
    
    # 과정명과 연관된 레벨/시간 찾기
    current_course = ""
    level = ""
    duration = ""
    
    for i, para in enumerate(paragraphs):
        text = para.text.strip()
        if not text:
            # 빈 줄이면서 이전에 과정/레벨/시간 정보가 있으면 결과 저장
            if current_course and (level or duration):
                results.append({
                    "course_name": current_course,
                    "level": level,
                    "duration": duration
                })
                current_course = ""
                level = ""
                duration = ""
            continue
        
        # 과정명으로 보이는 텍스트 (특정 패턴이나 위치에 따라 판단)
        if len(text) > 10 and ("과정" in text or "AWS" in text or "Amazon" in text):
            if not text.startswith('•') and not re.match(r'^\d+\.', text):
                current_course = text
        
        # 레벨 찾기
        level_match = re.search(level_pattern, text, re.IGNORECASE)
        if level_match:
            level = level_match.group(2).strip()
        
        # 소요 시간 찾기 
        duration_match = re.search(duration_pattern, text, re.IGNORECASE)
        if duration_match:
            duration = duration_match.group(2).strip()
        
        # 직접적인 표현이 없는 경우, 값을 기준으로 판단
        if not level and ("기초" in text or "중급" in text or "고급" in text or "초급" in text):
            for level_term in ["기초", "중급", "고급", "초급"]:
                if level_term in text:
                    level = level_term
                    break
        
        if not duration and ("일" in text or "시간" in text):
            # "N일" 또는 "N시간" 패턴 찾기
            time_match = re.search(r'(\d+\s*[일시간])', text)
            if time_match:
                duration = time_match.group(1)
    
    # 마지막 항목 처리
    if current_course and (level or duration):
        results.append({
            "course_name": current_course,
            "level": level,
            "duration": duration
        })
    
    return results

def extract_and_save_course_info(file_path):
    """과정 정보 추출 및 저장 메인 함수"""
    # 과정 정보 추출
    course_info = extract_course_info_from_docx(file_path)
    
    print("\n===== 추출된 과정 정보 요약 =====")
    if course_info:
        print(f"총 {len(course_info)}개 과정 정보 추출")
        
        # DataFrame으로 변환하여 정리된 형태로 출력
        df = pd.DataFrame(course_info)
        if 'full_table_data' in df.columns:
            df = df.drop('full_table_data', axis=1)  # 전체 표 데이터는 출력에서 제외
        
        print("\n추출된 정보:")
        print(df)
        
        # CSV로 저장
        csv_filename = "extracted_course_info.csv"
        df.to_csv(csv_filename, index=False, encoding='utf-8-sig')
        print(f"\n추출된 정보를 {csv_filename}에 저장했습니다.")
        
        return course_info
    else:
        print("추출된 과정 정보가 없습니다.")
        return []

# 실행 부분
if __name__ == "__main__":
    try:
        import sys
        if len(sys.argv) > 1:
            file_path = sys.argv[1]
        else:
            file_path = 'AWS TnC_ILT_DILT.docx'  # 기본 파일 이름
        
        course_info = extract_and_save_course_info(file_path)
        
        # 문서 내용 전체를 저장 (선택적)
        doc = docx.Document(file_path)
        with open("extracted_text.txt", "w", encoding="utf-8") as f:
            for para in doc.paragraphs:
                f.write(para.text + "\n")
            print("\n문서 내용을 extracted_text.txt 파일로 저장했습니다.")
            
    except Exception as e:
        print(f"오류 발생: {str(e)}")