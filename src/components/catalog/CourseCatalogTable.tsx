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
import { CourseCatalog } from '@/models/courseCatalog';
import { useAppTranslation } from '@/hooks/useAppTranslation';

interface CatalogTableProps {
  catalogs: CourseCatalog[];
  loading: boolean;
  onViewDetails: (catalog: CourseCatalog) => void;
}

const CourseCatalogTable: React.FC<CatalogTableProps> = ({
  catalogs,
  loading,
  onViewDetails
}) => {
  const { t } = useAppTranslation();
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // 올바른 columnDisplay 형식 사용
  const [preferences, setPreferences] = useState({
    pageSize: 10,
    columnDisplay: [
      { id: 'course_name', visible: true },
      { id: 'course_id', visible: true },
      { id: 'version', visible: true },
      { id: 'duration', visible: true },
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
      catalog.course_name.toLowerCase().includes(searchText) ||
      (catalog.course_id?.toLowerCase().includes(searchText) || false) ||
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
    if (!level) return <StatusIndicator type="info">{t('catalog_level_undefined')}</StatusIndicator>;

    switch (level) {
      case 'beginner':
        return <StatusIndicator type="success">{t('catalog_level_beginner')}</StatusIndicator>;
      case 'intermediate':
        return <StatusIndicator type="info">{t('catalog_level_intermediate')}</StatusIndicator>;
      case 'advanced':
        return <StatusIndicator type="warning">{t('catalog_level_advanced')}</StatusIndicator>;
      default:
        return <StatusIndicator type="info">{level}</StatusIndicator>;
    }
  };

  // 컬럼 정의
  const columnDefinitions = [
    {
      id: 'course_name',
      header: t('catalog_field_title'),
      cell: (item: CourseCatalog) => item.course_name,
      sortingField: 'course_name',
    },
    {
      id: 'course_id',
      header: t('catalog_field_aws_code'),
      cell: (item: CourseCatalog) => item.course_id || '-',
      sortingField: 'course_id',
    },
    {
      id: 'version',
      header: t('catalog_field_version'),
      cell: (item: CourseCatalog) => '1.0', // 기본값 표시
      sortingField: 'version',
    },
    {
      id: 'duration',
      header: t('catalog_field_duration'),
      cell: (item: CourseCatalog) => (
        item.duration ? `\${item.duration} \${t('hours')}` : '-'
      ),
      sortingField: 'duration',
    },
    {
      id: 'level',
      header: t('catalog_field_level'),
      cell: (item: CourseCatalog) => getLevelIndicator(item.level),
      sortingField: 'level',
    },
    {
      id: 'updatedAt',
      header: t('catalog_field_updated_at'),
      cell: (item: CourseCatalog) => formatDate(item.updatedAt),
      sortingField: 'updatedAt',
    },
    {
      id: 'actions',
      header: t('field_actions'),
      cell: (item: CourseCatalog) => (
        <Button onClick={() => onViewDetails(item)} variant="link">
          {t('catalog_action_view_details')}
        </Button>
      ),
    },
  ];

  // 컬렉션 환경설정 옵션
  const visibleContentOptions = [
    {
      label: t('catalog_preferences_columns_title'),
      options: [
        { id: 'course_name', label: t('catalog_field_title') },
        { id: 'course_id', label: t('catalog_field_aws_code') },
        { id: 'version', label: t('catalog_field_version') },
        { id: 'duration', label: t('catalog_field_duration') },
        { id: 'level', label: t('catalog_field_level') },
        { id: 'updatedAt', label: t('catalog_field_updated_at') }
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
        tableLabel: t('catalog_table_label'),
        allItemsSelectionLabel: ({ selectedItems }) =>
          t('catalog_selection_label', { count: selectedItems.length }),
        itemSelectionLabel: ({ selectedItems }, item) =>
          `\${item.course_name} \${
            selectedItems.includes(item)
              ? t('catalog_item_selected')
              : t('catalog_item_not_selected')
          }`
      }}
      selectionType="single"
      trackBy="id"
      empty={
        <Box textAlign="center" color="inherit">
          <b>{t('empty_state_title')}</b>
          <Box padding={{ bottom: 's' }} variant="p" color="inherit">
            {t('empty_state_message')}
          </Box>
        </Box>
      }
      filter={
        <TextFilter
          filteringText={filterText}
          filteringPlaceholder={t('catalog_search_placeholder')}
          filteringAriaLabel={t('catalog_search_aria_label')}
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
          title={t('catalog_preferences_title')}
          confirmLabel={t('confirm')}
          cancelLabel={t('cancel')}
          preferences={{
            pageSize: preferences.pageSize,
            contentDisplay: preferences.columnDisplay.map(col => ({
              id: col.id,
              visible: col.visible
            }))
          }}
          pageSizePreference={{
            title: t('catalog_preferences_page_size_title'),
            options: [
              { value: 10, label: t('catalog_preferences_page_size_items_10') },
              { value: 20, label: t('catalog_preferences_page_size_items_20') },
              { value: 50, label: t('catalog_preferences_page_size_items_50') }
            ]
          }}
          visibleContentPreference={{
            title: t('catalog_preferences_columns_title'),
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

export default CourseCatalogTable;