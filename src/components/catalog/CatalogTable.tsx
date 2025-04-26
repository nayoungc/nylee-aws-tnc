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
import { CourseCatalog } from '@/models/catalog';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation(['catalog']);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // 올바른 columnDisplay 형식 사용
  const [preferences, setPreferences] = useState({
    pageSize: 10,
    columnDisplay: [
      { id: 'title', visible: true },
      { id: 'awsCode', visible: true },
      { id: 'version', visible: true },
      { id: 'hours', visible: true },
      { id: 'level', visible: true },
      { id: 'updatedAt', visible: true },
      { id: 'actions', visible: true }
    ]
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
    return new Date(dateString).toLocaleDateString();
  };

  // 레벨에 따른 상태 표시
  const getLevelIndicator = (level?: string) => {
    if (!level) return <StatusIndicator type="info">{t('catalog:table.level.undefined')}</StatusIndicator>;

    switch (level) {
      case '입문':
        return <StatusIndicator type="success">{t('catalog:table.level.beginner')}</StatusIndicator>;
      case '중급':
        return <StatusIndicator type="info">{t('catalog:table.level.intermediate')}</StatusIndicator>;
      case '고급':
        return <StatusIndicator type="warning">{t('catalog:table.level.advanced')}</StatusIndicator>;
      default:
        return <StatusIndicator type="info">{level}</StatusIndicator>;
    }
  };

  // 컬럼 정의
  const columnDefinitions = [
    {
      id: 'title',
      header: t('catalog:table.title'),
      cell: (item: CourseCatalog) => item.title,
      sortingField: 'title',
    },
    {
      id: 'awsCode',
      header: t('catalog:table.awsCode'),
      cell: (item: CourseCatalog) => item.awsCode || '-',
      sortingField: 'awsCode',
    },
    {
      id: 'version',
      header: t('catalog:table.version'),
      cell: (item: CourseCatalog) => item.version,
      sortingField: 'version',
    },
    {
      id: 'hours',
      header: t('catalog:table.hours'),
      cell: (item: CourseCatalog) => (
        item.durations ? t('catalog:table.hoursFormat', { hours: item.durations }) : '-'
      ),
      sortingField: 'hours',
    },
    {
      id: 'level',
      header: t('catalog:table.level'),
      cell: (item: CourseCatalog) => getLevelIndicator(item.level),
      sortingField: 'level',
    },
    {
      id: 'updatedAt',
      header: t('catalog:table.updatedAt'),
      cell: (item: CourseCatalog) => formatDate(item.updatedAt),
      sortingField: 'updatedAt',
    },
    {
      id: 'actions',
      header: t('catalog:table.actions'),
      cell: (item: CourseCatalog) => (
        <Button onClick={() => onViewDetails(item)} variant="link">
          {t('catalog:table.viewDetails')}
        </Button>
      ),
    },
  ];

  // 컬렉션 환경설정 옵션
  const visibleContentOptions = [
    {
      label: t('catalog:preferences.columns.title'),
      options: [
        { id: 'title', label: t('catalog:table.title') },
        { id: 'awsCode', label: t('catalog:table.awsCode') },
        { id: 'version', label: t('catalog:table.version') },
        { id: 'hours', label: t('catalog:table.hours') },
        { id: 'level', label: t('catalog:table.level') },
        { id: 'updatedAt', label: t('catalog:table.updatedAt') }
      ]
    }
  ];

  // visibleColumns 대신에 columnDisplay 배열의 visible이 true인 ID만 필터링
  const visibleColumnIds = preferences.columnDisplay
    .filter(col => col.visible)
    .map(col => col.id);

  return (
    <Table
      loading={loading}
      items={paginatedCatalogs}
      columnDefinitions={columnDefinitions}
      columnDisplay={preferences.columnDisplay}
      ariaLabels={{
        tableLabel: t('catalog:table.tableLabel'),
        allItemsSelectionLabel: ({ selectedItems }) =>
          t('catalog:table.selectionLabel', { count: selectedItems.length }),
        itemSelectionLabel: ({ selectedItems }, item) =>
          `\${item.title} \${
            selectedItems.includes(item)
              ? t('catalog:table.itemSelected')
              : t('catalog:table.itemNotSelected')
          }`
      }}
      selectionType="single"
      trackBy="catalogId"
      empty={
        <Box textAlign="center" color="inherit">
          <b>{t('catalog:table.emptyText')}</b>
          <Box padding={{ bottom: 's' }} variant="p" color="inherit">
            {t('catalog:table.emptyDescription')}
          </Box>
        </Box>
      }
      filter={
        <TextFilter
          filteringText={filterText}
          filteringPlaceholder={t('catalog:table.searchPlaceholder')}
          filteringAriaLabel={t('catalog:table.searchAriaLabel')}
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
          title={t('catalog:preferences.title')}
          confirmLabel={t('catalog:preferences.confirm')}
          cancelLabel={t('catalog:preferences.cancel')}
          preferences={{
            pageSize: preferences.pageSize,
            contentDisplay: preferences.columnDisplay.map(col => ({
              id: col.id,
              visible: col.visible
            }))
          }}
          pageSizePreference={{
            title: t('catalog:preferences.pageSize.title'),
            options: [
              { value: 10, label: t('catalog:preferences.pageSize.items_10') },
              { value: 20, label: t('catalog:preferences.pageSize.items_20') },
              { value: 50, label: t('catalog:preferences.pageSize.items_50') }
            ]
          }}
          visibleContentPreference={{
            title: t('catalog:preferences.columns.title'),
            options: visibleContentOptions
          }}
          onConfirm={({ detail }) => {
            // 새로운 preference 객체 생성
            const newPreferences = {
              pageSize: detail.pageSize ?? preferences.pageSize,
              columnDisplay: preferences.columnDisplay.map(col => ({
                id: col.id,
                visible: detail.contentDisplay?.some(
                  (item: { id: string; visible: boolean }) => 
                    item.id === col.id && item.visible
                ) ?? col.visible
              }))
            };
            
            setPreferences(newPreferences);

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