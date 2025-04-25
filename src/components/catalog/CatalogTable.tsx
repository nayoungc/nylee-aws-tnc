// src/components/catalog/CatalogTable.tsx
import React, { useState } from 'react';
import {
  Table,
  Box,
  Button,
  TextFilter,
  Pagination,
  CollectionPreferences,
  StatusIndicator
} from '@cloudscape-design/components';
import { CourseCatalog } from '@models/catalog';

interface CatalogTableProps {
  catalogs: CourseCatalog[];
  loading: boolean;
  onViewDetails: (catalog: CourseCatalog) => void;
}

const CatalogTable: React.FC<CatalogTableProps> = ({
  catalogs,
  loading,
  onViewDetails
}) => {
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [preferences, setPreferences] = useState<{
    pageSize: number;
    visibleColumns: string[];
  }>({
    pageSize: 10,
    visibleColumns: ['title', 'awsCode', 'version', 'hours', 'level', 'updatedAt']
  });

  // 필터링된 데이터
  const filteredCatalogs = catalogs.filter(catalog => {
    if (!filterText) return true;
    const searchText = filterText.toLowerCase();

    return (
      catalog.title.toLowerCase().includes(searchText) ||
      (catalog.awsCode?.toLowerCase().includes(searchText) || false) ||
      (catalog.description?.toLowerCase().includes(searchText) || false)
    );
  });

  // 페이지네이션 적용
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCatalogs = filteredCatalogs.slice(startIndex, startIndex + pageSize);

  // 날짜 포맷팅 함수
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  // 레벨에 따른 상태 표시
  const getLevelIndicator = (level?: string) => {
    if (!level) return <StatusIndicator type="info">미정</StatusIndicator>;

    switch (level) {
      case '입문':
        return <StatusIndicator type="success">입문</StatusIndicator>;
      case '중급':
        return <StatusIndicator type="info">중급</StatusIndicator>;
      case '고급':
        return <StatusIndicator type="warning">고급</StatusIndicator>;
      default:
        return <StatusIndicator type="info">{level}</StatusIndicator>;
    }
  };

  // 컬럼 정의
  const columnDefinitions = [
    {
      id: 'title',
      header: '제목',
      cell: (item: CourseCatalog) => item.title,
      sortingField: 'title',
    },
    {
      id: 'awsCode',
      header: 'AWS 코드',
      cell: (item: CourseCatalog) => item.awsCode || '-',
      sortingField: 'awsCode',
    },
    {
      id: 'version',
      header: '버전',
      cell: (item: CourseCatalog) => item.version,
      sortingField: 'version',
    },
    {
      id: 'hours',
      header: '수강 시간',
      cell: (item: CourseCatalog) => (item.hours ? `\${item.hours}시간` : '-'),
      sortingField: 'hours',
    },
    {
      id: 'level',
      header: '난이도',
      cell: (item: CourseCatalog) => getLevelIndicator(item.level),
      sortingField: 'level',
    },
    {
      id: 'updatedAt',
      header: '최종 수정일',
      cell: (item: CourseCatalog) => formatDate(item.updatedAt),
      sortingField: 'updatedAt',
    },
    {
      id: 'actions',
      header: '작업',
      cell: (item: CourseCatalog) => (
        <Button onClick={() => onViewDetails(item)} variant="link">
          상세 보기
        </Button>
      ),
    },
  ];

  // 컬렉션 환경설정 옵션
  const visibleContentOptions = [
    {
      label: '표시할 열',
      options: [
        { id: 'title', label: '제목' },
        { id: 'awsCode', label: 'AWS 코드' },
        { id: 'version', label: '버전' },
        { id: 'hours', label: '수강 시간' },
        { id: 'level', label: '난이도' },
        { id: 'updatedAt', label: '최종 수정일' }
      ]
    }
  ];

  return (
    <Table
      loading={loading}
      items={paginatedCatalogs}
      columnDefinitions={columnDefinitions}
      visibleColumns={preferences.visibleColumns}
      ariaLabels={{
        tableLabel: '과정 카탈로그',
        allItemsSelectionLabel: ({ selectedItems }) =>
          `\${selectedItems.length} 항목 선택됨`,
        itemSelectionLabel: ({ selectedItems }, item) =>
          `\${item.title} \${selectedItems.includes(item) ? '선택됨' : '선택 안됨'}`
      }}
      selectionType="single"
      trackBy="catalogId"
      empty={
        <Box textAlign="center" color="inherit">
          <b>데이터 없음</b>
          <Box padding={{ bottom: 's' }} variant="p" color="inherit">
            검색 결과가 없거나 과정 카탈로그가 존재하지 않습니다.
          </Box>
        </Box>
      }
      filter={
        <TextFilter
          filteringText={filterText}
          filteringPlaceholder="과정 카탈로그 검색..."
          filteringAriaLabel="과정 카탈로그 검색"
          onChange={({ detail }) => setFilterText(detail.filteringText)}
        />
      }
      pagination={
        <Pagination
          currentPageIndex={currentPage}
          pagesCount={Math.max(1, Math.ceil(filteredCatalogs.length / pageSize))}
          onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
        />
      }
      preferences={
        <CollectionPreferences
          title="환경 설정"
          confirmLabel="확인"
          cancelLabel="취소"
          preferences={{
            pageSize: preferences.pageSize,
            visibleContent: preferences.visibleColumns
          }}
          pageSizePreference={{
            title: "페이지 크기",
            options: [
              { value: 10, label: "10개 항목" },
              { value: 20, label: "20개 항목" },
              { value: 50, label: "50개 항목" }
            ]
          }}
          visibleContentPreference={{
            title: "표시할 열",
            options: visibleContentOptions
          }}
          onConfirm={({ detail }) => {
            setPreferences({
              pageSize: detail.pageSize ?? preferences.pageSize, // 기본값 제공
              visibleColumns: detail.visibleContent ? [...detail.visibleContent] : preferences.visibleColumns // 복사본 생성
            });

            // pageSize가 있을 때만 설정
            if (detail.pageSize !== undefined) {
              setPageSize(detail.pageSize);
            }
          }}
        />
      }
    />
  );
};

export default CatalogTable;