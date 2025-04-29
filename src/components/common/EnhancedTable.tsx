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
import { useAppTranslation } from '@/hooks/useAppTranslation';

interface EnhancedTableEmptyText {
  title: string;
  subtitle?: string;
  action?: {
    text: string;
    onClick: () => void;
  };
}

// 필터링 속성의 확장된 타입 정의
interface EnhancedFilteringProperty {
  key: string;
  label: string;
}

// 테이블 변형 타입
type TableVariant = TableProps.Variant; // "container" | "borderless" | "embedded" | "stacked" | "full-page"

interface EnhancedTableProps {
  title: string;
  description?: string;
  columnDefinitions: any[];
  items: any[];
  loading?: boolean;
  loadingText?: string;
  selectionType?: "multi" | "single";
  selectedItems?: any[];
  onSelectionChange?: (items: any[]) => void;
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
  batchActions?: {
    text: string;
    onClick: () => void;
    disabled?: boolean;
  }[];
  filteringProperties?: EnhancedFilteringProperty[];
  usePropertyFilter?: boolean;
  defaultSortingColumn?: string;
  defaultSortingDescending?: boolean;
  emptyText?: EnhancedTableEmptyText;
  empty?: string;
  stickyHeader?: boolean;
  stripedRows?: boolean;
  resizableColumns?: boolean;
  visibleContentOptions?: any[];
  preferences?: boolean;
  trackBy?: string;
  variant?: TableVariant;
  // 올바른 형식의 columnDisplay 타입 정의 
  columnDisplay?: readonly TableProps.ColumnDisplayProperties[];
}

const EnhancedTable: React.FC<EnhancedTableProps> = ({
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
}) => {
  const { t } = useAppTranslation();
  
  const [sortingColumn, setSortingColumn] = useState<any>(
    defaultSortingColumn ? { sortingField: defaultSortingColumn } : undefined
  );
  const [sortingDescending, setSortingDescending] = useState<boolean>(defaultSortingDescending);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [selectedVisibleContent, setSelectedVisibleContent] = useState<any[]>(
    visibleContentOptions ? visibleContentOptions.map(group => group.options.map((o: any) => o.id)).flat() : []
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
  const sortedItems = [...paginatedItems].sort((a, b) => {
    if (!sortingColumn) return 0;
    
    const aValue = a[sortingColumn.sortingField];
    const bValue = b[sortingColumn.sortingField];
    
    if (aValue === bValue) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;
    
    if (typeof aValue === 'string') {
      return sortingDescending ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    }
    
    return sortingDescending ? bValue - aValue : aValue - bValue;
  });

  // 페이지 변경 핸들러
  const handlePaginationChange = ({ detail }: { detail: { currentPageIndex: number } }) => {
    setCurrentPageIndex(detail.currentPageIndex);
  };

  // 열 정렬 핸들러 수정
  const handleSortingChange = (event: any) => {
    const { sortingColumn, isDescending = false } = event.detail;
    setSortingColumn(sortingColumn);
    setSortingDescending(isDescending);
  };

  // 가시적 콘텐츠 선택 처리
  const handleVisibleContentChange = ({ detail }: { detail: { visibleContent: any[] } }) => {
    setSelectedVisibleContent(detail.visibleContent);
  };

  // 기본 설정 변경 처리 수정
  const handlePreferencesChange = (event: any) => {
    const { pageSize = 20, visibleContent = [] } = event.detail;
    setPageSize(pageSize);
    setSelectedVisibleContent(visibleContent);
  };

  // 필터링 변경 처리 - 타입 수정
  const handleFilterChange = (event: any) => {
    // 필요한 경우 깊은 복사로 readonly 문제 해결
    const tokens = [...event.detail.tokens];
    setFilteringQuery({
      tokens,
      operation: event.detail.operation
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

  // selectedVisibleContent를 기반으로 ColumnDisplayProperties 배열 생성
  let effectiveColumnDisplay: readonly TableProps.ColumnDisplayProperties[] | undefined = columnDisplay;
  
  // selectedVisibleContent를 기반으로 기본 columnDisplay 생성
  if (!effectiveColumnDisplay && selectedVisibleContent.length > 0) {
    effectiveColumnDisplay = selectedVisibleContent.map(id => ({
      id,
      visible: true
    }));
  }

  return (
    <Table
      columnDefinitions={columnDefinitions}
      items={sortedItems}
      loading={loading}
      loadingText={finalLoadingText} // 다국어 지원 로딩 텍스트
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
};

export default EnhancedTable;
