import pandas as pd
from docx import Document
import re

def extract_tables_from_docx(file_path):
    """
    .docx 파일에서 표를 추출하는 함수
    
    Args:
        file_path (str): .docx 파일 경로
        
    Returns:
        list: pandas DataFrame 형식의 표 리스트
    """
    try:
        # 문서 열기
        doc = Document(file_path)
        tables = []
        print(f"doc = {doc}")

        # 문서에서 표 추출
        for table in doc.tables:
            # 표 데이터 추출
            data = []
            for i, row in enumerate(table.rows):
                row_data = []
                for cell in row.cells:
                    # 셀 내용 추출 및 공백 정리
                    text = cell.text.strip()
                    row_data.append(text)
                data.append(row_data)
            
            # 데이터가 충분히 있는 경우만 처리
            if data and len(data) > 1:  # 적어도 헤더와 한 행의 데이터
                # 첫 번째 행을 헤더로 사용
                headers = data[0]
                df = pd.DataFrame(data[1:], columns=headers)
                tables.append(df)
        
        # 문서 내용에서 텍스트 형식의 표도 추출 (탭이나 공백으로 구분된)
        text_tables = extract_tables_from_text('\n'.join(paragraph.text for paragraph in doc.paragraphs))
        tables.extend(text_tables)
        
        return tables
    
    except Exception as e:
        print(f"문서 처리 중 오류 발생: {e}")
        return []

def extract_tables_from_text(text):
    """
    텍스트에서 표 형식의 데이터를 추출
    """
    # 원래 함수의 로직을 여기에 구현
    # (간결함을 위해 생략)
    return []

def print_table_info(tables):
    """
    추출된 표 정보를 출력하는 함수
    
    Args:
        tables (list): 추출된 표 리스트 (DataFrame 형식)
    """
    if not tables:
        print("추출된 표가 없습니다.")
        return
    
    print(f"총 {len(tables)}개의 표가 추출되었습니다.")
    
    for i, table in enumerate(tables):
        print(f"\n표 {i+1}:")
        print(f"- 행 수: {table.shape[0]}")
        print(f"- 열 수: {table.shape[1]}")
        print(f"- 열 이름: {list(table.columns)}")
        print("\n처음 5행:")
        print(table.head())
        print("-" * 50)

# 사용 예:
tables = extract_tables_from_docx('Instuctor.docx')
print_table_info(tables)