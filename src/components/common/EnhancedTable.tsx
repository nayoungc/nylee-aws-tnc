// src/components/common/EnhancedTable.tsx
import React, { useState } from 'react';
import {
  Table,
  Box,
  Button,
  TextFilter,
  Pagination,
  Header,
  SpaceBetween,
  ButtonDropdown,
  StatusIndicator
} from '@cloudscape-design/components';
import { useTranslation } from 'react-i18next';

// import 대신 Table에서 추출한 타입을 사용
type TableColumnDefinition<T> = Parameters<typeof Table<T>>[0]["columnDefinitions"][0];
type TableProps<T> = Parameters<typeof Table<T>>[0];
type SortingColumn<T> = NonNullable<TableProps<T>["sortingColumn"]>;

interface EnhancedTableProps<T> {
  title: string;
  description?: string;
  columnDefinitions: TableColumnDefinition<T>[];
  items: T[];
  loading?: boolean;
  selectionType?: "single" | "multi";
  onSelectionChange?: (items: T[]) => void;
  onRefresh?: () => void;
  actions?: {
    primary?: {
      text: string;
      onClick: () => void;
      disabled?: boolean;
    };
    secondary?: {
      text: string;
      onClick: () => void;
      disabled?: boolean;
    }[];
  };
  batchActions?: {
    text: string;
    onClick: () => void;
    disabled?: boolean;
  }[];
  filteringProperties?: { key: string; label: string }[];
  pagination?: boolean;
  stickyHeader?: boolean;
  stripedRows?: boolean;
  resizableColumns?: boolean;
}

const EnhancedTable = <T extends object>({
  title,
  description,
  columnDefinitions,
  items,
  loading = false,
  selectionType,
  onSelectionChange,
  onRefresh,
  actions,
  batchActions,
  filteringProperties = [],
  pagination = true,
  stickyHeader = true,
  stripedRows = true,
  resizableColumns = true
}: EnhancedTableProps<T>) => {
  const { t } = useTranslation();
  
  // 상태 관리
  const [selectedItems, setSelectedItems] = useState<T[]>([]);
  const [filteringText, setFilteringText] = useState('');
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [sortingColumn, setSortingColumn] = useState<SortingColumn<T> | undefined>(undefined);
  const [sortingDescending, setSortingDescending] = useState(false);

  // 페이지 크기
  const pageSize = 10;
  
  // 필터링된 아이템
  const filteredItems = React.useMemo(() => {
    if (!filteringText || filteringText.trim() === '') {
      return items;
    }
    
    const lowercaseFilteringText = filteringText.toLowerCase();
    
    return items.filter(item => {
      return filteringProperties.some(prop => {
        const value = item[prop.key as keyof T];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(lowercaseFilteringText);
      });
    });
  }, [items, filteringText, filteringProperties]);
  
  // 정렬된 아이템
  const sortedItems = React.useMemo(() => {
    if (!sortingColumn?.sortingField) return filteredItems;
    
    const { sortingField } = sortingColumn;
    
    return [...filteredItems].sort((a, b) => {
      const aValue = a[sortingField as keyof T];
      const bValue = b[sortingField as keyof T];
      
      // null, undefined 처리
      if (aValue === null || aValue === undefined) return sortingDescending ? 1 : -1;
      if (bValue === null || bValue === undefined) return sortingDescending ? -1 : 1;
      
      // 동일 값 처리
      if (aValue === bValue) return 0;
      
      // 정렬 방향에 따른 비교
      const compareResult = aValue < bValue ? -1 : 1;
      return sortingDescending ? -compareResult : compareResult;
    });
  }, [filteredItems, sortingColumn, sortingDescending]);
  
  // 페이지 아이템
  const paginatedItems = React.useMemo(() => {
    if (!pagination) return sortedItems;
    
    const startIndex = (currentPageIndex - 1) * pageSize;
    return sortedItems.slice(startIndex, startIndex + pageSize);
  }, [sortedItems, currentPageIndex, pagination]);

  return (
    <Table
      loading={loading}
      loadingText={t('common:loading')}
      columnDefinitions={columnDefinitions as any}
      items={paginatedItems}
      trackBy="id"
      selectionType={selectionType}
      selectedItems={selectedItems}
      onSelectionChange={({ detail }) => {
        setSelectedItems(detail.selectedItems);
        if (onSelectionChange) {
          onSelectionChange(detail.selectedItems);
        }
      }}
      stickyHeader={stickyHeader}
      stripedRows={stripedRows}
      resizableColumns={resizableColumns}
      header={
        <Header
          variant="h2"
          description={description}
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              {onRefresh && (
                <Button 
                  iconName="refresh"
                  onClick={onRefresh}
                  ariaLabel={t('common:refresh')}
                />
              )}
              
              {/* 선택한 항목에 대한 배치 액션 */}
              {batchActions && selectedItems.length > 0 && (
                <ButtonDropdown
                  items={batchActions.map(action => ({
                    text: action.text,
                    id: action.text,
                    disabled: action.disabled,
                    disabledReason: action.disabled ? t('common:action_disabled') : undefined
                  }))}
                  onItemClick={({ detail }) => {
                    const selectedAction = batchActions.find(a => a.text === detail.id);
                    if (selectedAction) selectedAction.onClick();
                  }}
                >
                  {t('common:actions')}
                </ButtonDropdown>
              )}
              
              {/* 보조 액션 버튼 */}
              {actions?.secondary?.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.onClick}
                  disabled={action.disabled}
                >
                  {action.text}
                </Button>
              ))}
              
              {/* 기본 액션 버튼 */}
              {actions?.primary && (
                <Button
                  variant="primary"
                  onClick={actions.primary.onClick}
                  disabled={actions.primary.disabled}
                >
                  {actions.primary.text}
                </Button>
              )}
            </SpaceBetween>
          }
        >
          {title}
        </Header>
      }
      filter={
        filteringProperties.length > 0 && (
          <TextFilter
            filteringText={filteringText}
            filteringPlaceholder={t('common:search_placeholder')}
            filteringAriaLabel={t('common:search_aria_label')}
            onChange={({ detail }) => setFilteringText(detail.filteringText)}
          />
        )
      }
      pagination={
        pagination && (
          <Pagination
            currentPageIndex={currentPageIndex}
            onChange={({ detail }) => setCurrentPageIndex(detail.currentPageIndex)}
            pagesCount={Math.max(1, Math.ceil(sortedItems.length / pageSize))}
            ariaLabels={{
              nextPageLabel: t('common:pagination.next_page'),
              previousPageLabel: t('common:pagination.previous_page'),
              pageLabel: (pageNumber) => t('common:pagination.page_label', { pageNumber })
            }}
          />
        )
      }
      sortingColumn={sortingColumn as any}
      sortingDescending={sortingDescending}
      onSortingChange={({ detail }) => {
        setSortingColumn(detail.sortingColumn);
        setSortingDescending(detail.isDescending ?? false);
      }}
      empty={
        <Box textAlign="center" padding="l">
          <b>{t('common:no_data.title')}</b>
          <Box padding={{ bottom: 's' }} variant="p">
            {t('common:no_data.description')}
          </Box>
        </Box>
      }
      wrapLines
      variant="full-page"
    />
  );
};

export default EnhancedTable;