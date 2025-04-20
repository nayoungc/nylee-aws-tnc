import docx
import pandas as pd
import re

def extract_tables_from_docx(file_path):
    """
    .docx 파일에서 표를 추출하는 함수
    
    Args:
        file_path (str): .docx 파일 경로
        
    Returns:
        list: pandas DataFrame 형식의 표 리스트, 추가 정보를 담은 딕셔너리
    """
    print(f"문서 제목: {file_path}")
    
    # 문서 열기
    doc = docx.Document(file_path)
    print(f"doc = {doc}")
    
    # 기본 정보 출력
    print(f"문단 수: {len(doc.paragraphs)}")
    
    # 문서 내 몇 개의 문단 샘플링 출력
    for i in range(min(5, len(doc.paragraphs))):
        if doc.paragraphs[i].text.strip():  # 빈 문단이 아닌 경우만
            print(f"문단 {i}: {doc.paragraphs[i].text[:50]}...")
    
    # 표 추출
    tables = []
    raw_tables = []  # 원시 데이터 저장용
    
    # 내장 표 처리
    if doc.tables:
        print(f"문서 내 표 개수: {len(doc.tables)}")
        
        for idx, table in enumerate(doc.tables):
            print(f"표 {idx+1} 처리 중... 행: {len(table.rows)}")
            
            # 표 데이터 추출
            try:
                data = []
                for row in table.rows:
                    row_data = []
                    for cell in row.cells:
                        # 셀 내용 추출 및 공백 정리
                        text = cell.text.strip()
                        row_data.append(text)
                    data.append(row_data)
                
                # 원시 데이터 저장
                raw_tables.append(data)
                
                # 데이터프레임 변환 시도
                if data:
                    if len(data) > 1:  # 헤더와 최소 1개의 행
                        headers = data[0]
                        # 빈 헤더가 있으면 대체
                        for i in range(len(headers)):
                            if not headers[i]:
                                headers[i] = f"Column_{i}"
                        
                        # 데이터프레임 생성
                        df = pd.DataFrame(data[1:], columns=headers)
                        tables.append(df)
                    else:
                        print(f"표 {idx+1}은 데이터가 충분하지 않습니다.")
            except Exception as e:
                print(f"표 {idx+1} 처리 중 오류 발생: {str(e)}")
    else:
        print("문서에서 내장된 표를 찾을 수 없습니다. 텍스트 기반 표 형식 검색을 시도합니다...")
        
        # 텍스트 기반 표 형식 찾기
        text_tables = extract_text_tables(doc.paragraphs)
        if text_tables:
            tables.extend(text_tables)
            print(f"텍스트 기반 표 {len(text_tables)}개 추출됨")
    
    print(f"표 추출 완료: {len(tables)}개의 표 추출됨")
    
    # 결과 반환
    result = {
        "tables": tables,
        "raw_tables": raw_tables,
        "doc_info": {
            "paragraph_count": len(doc.paragraphs),
            "table_count": len(doc.tables)
        }
    }
    
    return result

def extract_text_tables(paragraphs):
    """텍스트에서 표 형식으로 보이는 부분 추출"""
    tables = []
    current_table = []
    in_table = False
    
    # 표 형식 탐지를 위한 패턴
    table_patterns = [
        r'\t{2,}',  # 2개 이상의 탭
        r'\s{4,}',  # 4개 이상의 공백
        r'\|\s*\w+\s*\|',  # |로 둘러싸인 형태
        r'^\s*\d+\s+\w+\s+\w+'  # 숫자로 시작하는 행과 단어들
    ]
    
    for para in paragraphs:
        text = para.text.strip()
        if not text:
            # 빈 줄을 만났을 때 현재 테이블 처리 종료
            if in_table and current_table:
                try:
                    # 표로 변환 시도
                    df = process_text_table(current_table)
                    if not df.empty and df.shape[1] > 1:  # 열이 2개 이상인 경우만
                        tables.append(df)
                except Exception as e:
                    print(f"텍스트 표 변환 중 오류: {str(e)}")
                
                current_table = []
                in_table = False
            continue
        
        # 표 형식인지 확인
        is_table_row = any(re.search(pattern, text) for pattern in table_patterns)
        
        if is_table_row:
            in_table = True
            current_table.append(text)
        elif in_table:
            # 표 형식이 끝났음
            if current_table:
                try:
                    df = process_text_table(current_table)
                    if not df.empty and df.shape[1] > 1:
                        tables.append(df)
                except Exception as e:
                    print(f"텍스트 표 변환 중 오류: {str(e)}")
                
                current_table = []
                in_table = False
    
    # 마지막 표 처리
    if in_table and current_table:
        try:
            df = process_text_table(current_table)
            if not df.empty and df.shape[1] > 1:
                tables.append(df)
        except Exception as e:
            print(f"텍스트 표 변환 중 오류: {str(e)}")
    
    return tables

def process_text_table(text_lines):
    """텍스트 라인들을 표로 변환"""
    # 구분자 추측
    sample_line = text_lines[0]
    
    if '\t' in sample_line:
        delimiter = '\t'
    elif '|' in sample_line:
        # | 기호로 분리된 경우
        processed_lines = []
        for line in text_lines:
            processed_lines.append(line.strip('| \t').replace('|', '\t'))
        return pd.read_csv('\n'.join(processed_lines), sep='\t', engine='python')
    else:
        # 공백을 구분자로 사용하되, 여러 개의 공백은 하나로 취급
        processed_lines = []
        for line in text_lines:
            processed_line = re.sub(r'\s{2,}', '\t', line)
            processed_lines.append(processed_line)
        return pd.read_csv('\n'.join(processed_lines), sep='\t', engine='python')
    
    # 기본 처리: 텍스트를 구분자로 분리하여 DataFrame 생성
    return pd.read_csv('\n'.join(text_lines), sep=delimiter, engine='python')

def print_table_info(result):
    """
    추출된 표 정보를 출력하는 함수
    
    Args:
        result: 추출된 표와 정보를 담은 딕셔너리
    """
    tables = result["tables"]
    raw_tables = result["raw_tables"]
    
    if not tables and not raw_tables:
        print("추출된 표가 없습니다.")
        
        # 원시 텍스트에서 수동으로 표와 유사한 형식 찾기
        print("\n표와 유사한 구조를 수동으로 찾아봅니다...")
        find_table_like_structures(result["doc_info"].get("paragraph_texts", []))
        return
    
    print(f"총 {len(tables)}개의 표가 추출되었습니다.")
    
    if raw_tables and not tables:
        print("\n표 구조는 감지되었으나 변환하지 못했습니다. 원시 데이터:")
        for i, raw_table in enumerate(raw_tables):
            print(f"\n원시 표 {i+1}:")
            for row in raw_table:
                print(" | ".join(row))
    
    for i, table in enumerate(tables):
        print(f"\n표 {i+1}:")
        print(f"- 행 수: {table.shape[0]}")
        print(f"- 열 수: {table.shape[1]}")
        print(f"- 열 이름: {list(table.columns)}")
        print("\n처음 5행:")
        print(table.head())
        print("-" * 50)

def find_table_like_structures(paragraphs_text):
    """문서에서 표와 비슷한 구조를 찾는 함수"""
    # 연속되는 특정 패턴을 가진 문단 그룹 찾기
    
    # 예: 숫자와 문자가 특정 패턴으로 반복되는 경우
    pattern_groups = []
    current_group = []
    
    # 패턴 정의: 레벨, 교육 방식, 소요 시간 등의 패턴
    table_row_patterns = [
        r'^\s*(\w+)\s+(\w[^0-9]+)\s+(\d+일|\d+시간)',  # 레벨 제공방법 소요시간
        r'^\s*\d+\.\s+.+',  # 번호로 시작하는 목록형 데이터
        r'^\s*•\s+.+',  # 불릿으로 시작하는 목록형 데이터
    ]
    
    if not paragraphs_text:
        print("분석할 텍스트가 제공되지 않았습니다.")
        return
    
    for para in paragraphs_text:
        is_table_like = any(re.match(pattern, para) for pattern in table_row_patterns)
        
        if is_table_like:
            current_group.append(para)
        elif current_group:
            if len(current_group) >= 3:  # 최소 3개 연속 행이면 표와 유사하다고 판단
                pattern_groups.append(current_group)
            current_group = []
    
    # 마지막 그룹 처리
    if current_group and len(current_group) >= 3:
        pattern_groups.append(current_group)
    
    # 발견된 패턴 그룹 출력
    if pattern_groups:
        print(f"\n{len(pattern_groups)}개의 표와 유사한 구조를 발견했습니다:")
        for i, group in enumerate(pattern_groups):
            print(f"\n구조 {i+1} (행 {len(group)}개):")
            for line in group[:5]:  # 처음 5줄만 출력
                print(f"  {line}")
            if len(group) > 5:
                print(f"  ... 외 {len(group)-5}개 행")
    else:
        print("표와 유사한 구조를 발견하지 못했습니다.")
        
    # 두 번째 시도: 워드 문서에서 구조화된 콘텐츠를 찾기 위한 다른 패턴 검색
    print("\n특수 형식이나 레이아웃이 있는지 검색합니다...")
    
    # 예: 탭이나 여러 공백을 포함한 줄 찾기
    tab_lines = [p for p in paragraphs_text if '\t' in p]
    if tab_lines:
        print(f"\n탭이 포함된 {len(tab_lines)}개 라인을 발견했습니다 (표일 가능성 있음):")
        for line in tab_lines[:5]:
            print(f"  {line}")
        if len(tab_lines) > 5:
            print(f"  ... 외 {len(tab_lines)-5}개 행")

# 실행 부분
if __name__ == "__main__":
    try:
        import sys
        if len(sys.argv) > 1:
            file_path = sys.argv[1]
        else:
            #file_path = "Instuctor.docx"  # 기본 파일 이름
            file_path = 'AWS TnC_ILT_DILT.docx'
        
        result = extract_tables_from_docx(file_path)
        print_table_info(result)
        
        # 문서 내용 전체를 저장 (선택적)
        doc = docx.Document(file_path)
        with open("extracted_text.txt", "w", encoding="utf-8") as f:
            for para in doc.paragraphs:
                f.write(para.text + "\n")
            print("\n문서 내용을 extracted_text.txt 파일로 저장했습니다.")
            
    except Exception as e:
        print(f"오류 발생: {str(e)}")