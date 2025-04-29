// src/components/common/EnhancedTable.tsx
import React, { useState } from 'react';
import {
  Table,
  Box,
  Button,
  Header,
  Pagination,
  PropertyFilter,
  CollectionPreferences,
  SpaceBetween,
  TextFilter,
  PropertyFilterProps,
  TableProps
} from '@cloudscape-design/components';
import { NonCancelableEventHandler } from '@cloudscape-design/components/internal/events';
import { useAppTranslation } from '@/hooks/useAppTranslation';

/**
 * EnhancedTable의 빈 상태 텍스트 정의
 */
interface EnhancedTableEmptyText {
  title: string;
  subtitle?: string;
  action?: {
    text: string;
    onClick: () => void;
  };
}

/**
 * 필터링 속성의 확장된 타입 정의
 */
interface EnhancedFilteringProperty {
  key: string;
  label: string;
}

/**
 * 배치 액션 타입 정의
 */
interface BatchAction {
  text: string;
  onClick: () => void;
  disabled?: boolean;
}

/**
 * 가시적 콘텐츠 옵션 그룹 타입
 */
interface VisibleContentOptionGroup {
  id: string;
  label: string;
  options: {
    id: string;
    label: string;
  }[];
}

/**
 * EnhancedTable 컴포넌트 Props 정의
 */
export interface EnhancedTableProps<T = any> {
  title: string;
  description?: string;
  columnDefinitions: TableProps.ColumnDefinition<T>[];
  items: T[];
  loading?: boolean;
  loadingText?: string;
  selectionType?: "multi" | "single";
  selectedItems?: T[];
  onSelectionChange?: (items: T[]) => void;
  onRefresh?: () => void;
  actions?: {
    primary?: {
      text: string;
      onClick: () => void;
    };
    secondary?: {
      text: string;
      onClick: () => void;
    }[];
  };
  batchActions?: BatchAction[];
  filteringProperties?: EnhancedFilteringProperty[];
  usePropertyFilter?: boolean;
  defaultSortingColumn?: string;
  defaultSortingDescending?: boolean;
  emptyText?: EnhancedTableEmptyText;
  empty?: string;
  stickyHeader?: boolean;
  stripedRows?: boolean;
  resizableColumns?: boolean;
  visibleContentOptions?: VisibleContentOptionGroup[];
  preferences?: boolean;
  trackBy?: string;
  variant?: TableProps.Variant;
  columnDisplay?: readonly { id: string; visible: boolean }[];
}

/**
 * 고급 테이블 컴포넌트
 */
function EnhancedTable<T extends Record<string, any> = any>({
  title,
  description,
  columnDefinitions,
  items,
  loading = false,
  loadingText,
  selectionType,
  selectedItems = [],
  onSelectionChange = () => {},
  onRefresh,
  actions,
  batchActions,
  filteringProperties = [],
  usePropertyFilter = true,
  defaultSortingColumn,
  defaultSortingDescending = false,
  emptyText,
  empty,
  stickyHeader = false,
  stripedRows = false,
  resizableColumns = false,
  visibleContentOptions,
  preferences = false,
  trackBy = 'id',
  variant,
  columnDisplay
}: EnhancedTableProps<T>): React.ReactElement {
  const { t } = useAppTranslation();
  
  const [sortingColumn, setSortingColumn] = useState<TableProps.ColumnDefinition<T> | null>(
    defaultSortingColumn ? columnDefinitions.find(col => col.id === defaultSortingColumn) || null : null
  );
  const [sortingDescending, setSortingDescending] = useState<boolean>(defaultSortingDescending);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [selectedVisibleContent, setSelectedVisibleContent] = useState<string[]>(
    visibleContentOptions 
      ? visibleContentOptions.flatMap(group => 
          group.options.map((option) => option.id)
        ) 
      : []
  );
  const [filteringQuery, setFilteringQuery] = useState<PropertyFilterProps.Query>({ tokens: [], operation: "and" });

  // 테이블 헤더 렌더링
  const tableHeader = (
    <Header
      variant="awsui-h1-sticky"
      actions={
        <SpaceBetween direction="horizontal" size="xs">
          {onRefresh && (
            <Button
              iconName="refresh"
              onClick={onRefresh}
              ariaLabel={t('table_refresh_aria_label')}
              disabled={loading}
            />
          )}
          {batchActions && batchActions.length > 0 && selectedItems.length > 0 && (
            batchActions.map((action, idx) => (
              <Button
                key={idx}
                disabled={action.disabled}
                onClick={action.onClick}
              >
                {action.text}
              </Button>
            ))
          )}
          {actions?.secondary && actions.secondary.map((action, idx) => (
            <Button
              key={idx}
              onClick={action.onClick}
            >
              {action.text}
            </Button>
          ))}
          {actions?.primary && (
            <Button
              variant="primary"
              onClick={actions.primary.onClick}
            >
              {actions.primary.text}
            </Button>
          )}
        </SpaceBetween>
      }
      description={description}
      counter={
        items.length > 0 
          ? `(\${items.length})`
          : undefined
      }
    >
      {title}
    </Header>
  );

  // 페이지네이션 계산
  const paginatedItems = items.slice((currentPageIndex - 1) * pageSize, currentPageIndex * pageSize);
  const pagesCount = Math.ceil(items.length / pageSize);

  // 기본 정렬 적용
  const sortedItems = [...paginatedItems].sort((a: T, b: T) => {
    if (!sortingColumn || !sortingColumn.sortingField) return 0;
    
    const sortField = sortingColumn.sortingField as keyof T;
    
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue === bValue) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortingDescending ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    }
    
    // 숫자 비교
    return sortingDescending ? (Number(bValue) - Number(aValue)) : (Number(aValue) - Number(bValue));
  });

  // 페이지 변경 핸들러
  const handlePaginationChange = ({ detail }: { detail: { currentPageIndex: number } }) => {
    setCurrentPageIndex(detail.currentPageIndex);
  };

  // 열 정렬 핸들러
  const handleSortingChange = ({ detail }: { 
    detail: { sortingColumn: TableProps.ColumnDefinition<T> | null; isDescending?: boolean } 
  }) => {
    setSortingColumn(detail.sortingColumn);
    setSortingDescending(detail.isDescending || false);
  };

  // 기본 설정 변경 처리
  const handlePreferencesChange: NonCancelableEventHandler<CollectionPreferences.Preferences> = (event) => {
    const { detail } = event;
    if (detail.pageSize) {
      setPageSize(detail.pageSize);
    }
    if (detail.visibleContent) {
      setSelectedVisibleContent([...detail.visibleContent]);
    }
  };

  // 필터링 변경 처리
  const handleFilterChange = ({ detail }: { detail: PropertyFilterProps.Query }) => {
    setFilteringQuery({
      tokens: [...detail.tokens],
      operation: detail.operation
    });
  };

  // PropertyFilter를 위한 필터링 속성 변환
  const formattedFilteringProperties = filteringProperties.map(prop => ({
    key: prop.key,
    propertyLabel: prop.label,
    groupValuesLabel: `\${prop.label} values`,
    operators: [':', '!:', '=', '!='] as const
  }));

  // 로딩 텍스트 - 제공된 값 또는 다국어 기본값 사용
  const finalLoadingText = loadingText || t('common:loading', '로딩 중...');

  // selectedVisibleContent를 기반으로 ColumnDisplay 생성
  const effectiveColumnDisplay = columnDisplay || (
    selectedVisibleContent.length > 0 ? 
      selectedVisibleContent.map(id => ({ id, visible: true })) : 
      undefined
  );

  return (
    <Table<T>
      columnDefinitions={columnDefinitions}
      items={sortedItems}
      loading={loading}
      loadingText={finalLoadingText}
      selectionType={selectionType}
      selectedItems={selectedItems}
      onSelectionChange={({ detail }) => onSelectionChange(detail.selectedItems)}
      header={tableHeader}
      filter={
        usePropertyFilter && filteringProperties.length > 0 ? (
          <PropertyFilter
            i18nStrings={{
              filteringAriaLabel: t('table_filtering_aria_label'),
              filteringPlaceholder: t('table_filtering_placeholder'),
              groupValuesText: t('table_filtering_group_values', { count: 0 }).replace('0', '{count}'),
              operationAndText: t('table_filtering_operation_and'),
              operationOrText: t('table_filtering_operation_or'),
              operatorContainsText: t('contains'),
              operatorDoesNotContainText: t('does_not_contain'),
              operatorEqualsText: t('equals'),
              operatorDoesNotEqualText: t('not_equals')
            }}
            countText={t('table_filtering_count_text', { count: items.length })}
            filteringProperties={formattedFilteringProperties}
            query={filteringQuery}
            onChange={handleFilterChange}
          />
        ) : null
      }
      pagination={
        <Pagination
          currentPageIndex={currentPageIndex}
          pagesCount={pagesCount}
          onChange={handlePaginationChange}
          ariaLabels={{
            nextPageLabel: t('pagination_next'),
            previousPageLabel: t('pagination_previous'),
            pageLabel: (pageNumber) => t('pagination_page_label', { pageNumber })
          }}
        />
      }
      preferences={preferences ? (
        <CollectionPreferences
          title={t('table_preferences_title')}
          confirmLabel={t('confirm')}
          cancelLabel={t('cancel')}
          pageSizePreference={{
            title: t('table_preferences_page_size_title'),
            options: [
              { value: 10, label: "10" },
              { value: 20, label: "20" },
              { value: 50, label: "50" },
              { value: 100, label: "100" }
            ]
          }}
          visibleContentPreference={visibleContentOptions ? {
            title: t('table_preferences_visible_content_title'),
            options: visibleContentOptions
          } : undefined}
          onConfirm={handlePreferencesChange}
        />
      ) : undefined}
      sortingColumn={sortingColumn}
      sortingDescending={sortingDescending}
      onSortingChange={handleSortingChange}
      stickyHeader={stickyHeader}
      stripedRows={stripedRows}
      resizableColumns={resizableColumns}
      columnDisplay={effectiveColumnDisplay}
      trackBy={trackBy}
      variant={variant}
      empty={
        empty ? empty : 
        emptyText ? (
          <Box textAlign="center" color="inherit">
            <Box variant="h2" padding="s">
              {emptyText.title}
            </Box>
            {emptyText.subtitle && (
              <Box variant="p" padding={{ bottom: 's' }} color="inherit">
                {emptyText.subtitle}
              </Box>
            )}
            {emptyText.action && (
              <Button onClick={emptyText.action.onClick}>
                {emptyText.action.text}
              </Button>
            )}
          </Box>
        ) : undefined
      }
    />
  );
}

export default EnhancedTable;