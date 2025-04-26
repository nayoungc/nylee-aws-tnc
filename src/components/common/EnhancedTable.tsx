import React, { useState, useEffect } from 'react';
import {
  Table,
  Box,
  Button,
  TextFilter,
  Pagination,
  Header,
  SpaceBetween,
  ButtonDropdown,
  PropertyFilter,
  PropertyFilterProps,
  CollectionPreferences,
  CollectionPreferencesProps
} from '@cloudscape-design/components';
import { useTranslation } from 'react-i18next';

type TableColumnDefinition<T> = Parameters<typeof Table<T>>[0]["columnDefinitions"][0];
type TableProps<T> = Parameters<typeof Table<T>>[0];
type SortingState<T> = {
  sortingColumn: TableProps<T>["sortingColumn"];
  sortingDescending: boolean;
};

export interface EnhancedTableProps<T> {
  title: string;
  description?: string;
  columnDefinitions: TableColumnDefinition<T>[];
  visibleContentOptions?: {
    id: string;
    label: string;
    options: Array<{
      id: string;
      label: string;
    }>
  }[];
  items: T[];
  loading?: boolean;
  selectionType?: "single" | "multi";
  selectedItems?: T[];
  onSelectionChange?: (items: T[]) => void;
  onRefresh?: () => void;
  actions?: {
    primary?: {
      text: string;
      onClick: () => void;
      disabled?: boolean;
    };
    secondary?: Array<{
      text: string;
      onClick: () => void;
      disabled?: boolean;
    }>;
  };
  batchActions?: Array<{
    text: string;
    onClick: () => void;
    disabled?: boolean;
  }>;
  filteringProperties?: Array<{
    key: string;
    label: string;
    operators?: string[];
    propertyLabel?: string;
  }>;
  usePropertyFilter?: boolean;
  pagination?: boolean;
  pageSize?: number;
  stickyHeader?: boolean;
  stripedRows?: boolean;
  resizableColumns?: boolean;
  trackBy?: string;
  defaultSortingColumn?: string;
  defaultSortingDescending?: boolean;
  emptyText?: {
    title?: string;
    subtitle?: string;
    action?: {
      text: string;
      onClick: () => void;
    };
  };
  preferences?: boolean;
  onPreferencesChange?: (preferences: CollectionPreferencesProps.Preferences) => void;
}

function EnhancedTable<T extends object>({
  title,
  description,
  columnDefinitions,
  visibleContentOptions,
  items,
  loading = false,
  selectionType,
  selectedItems: externalSelectedItems,
  onSelectionChange,
  onRefresh,
  actions,
  batchActions,
  filteringProperties = [],
  usePropertyFilter = false,
  pagination = true,
  pageSize = 10,
  stickyHeader = true,
  stripedRows = true,
  resizableColumns = true,
  trackBy = "id",
  defaultSortingColumn,
  defaultSortingDescending = false,
  emptyText,
  preferences = false,
  onPreferencesChange
}: EnhancedTableProps<T>) {
  const { t } = useTranslation(['common']);

  // 상태 관리
  const [selectedItems, setSelectedItems] = useState<T[]>(externalSelectedItems || []);
  const [filteringText, setFilteringText] = useState('');
  const [filteringTokens, setFilteringTokens] = useState<FilterToken[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [sorting, setSorting] = useState<SortingState<T>>({
    sortingColumn: defaultSortingColumn ? { sortingField: defaultSortingColumn } : undefined,
    sortingDescending: defaultSortingDescending
  });

  // 외부 selectedItems가 변경되면 내부 상태도 업데이트
  useEffect(() => {
    if (externalSelectedItems) {
      setSelectedItems(externalSelectedItems);
    }
  }, [externalSelectedItems]);

  // 필터 토큰 타입을 직접 정의
type FilterToken = {
  propertyKey: string;
  operator: string;
  value: string;
};

  // 필터링된 아이템
  const filteredItems = React.useMemo(() => {
    if (usePropertyFilter && filteringTokens.length > 0) {
      // PropertyFilter 로직 구현 (간소화)
      return items;
    } else if (!filteringText || filteringText.trim() === '') {
      return items;
    } else {
      const lowercaseFilteringText = filteringText.toLowerCase();

      return items.filter(item => {
        return filteringProperties.some(prop => {
          const value = item[prop.key as keyof T];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(lowercaseFilteringText);
        });
      });
    }
  }, [items, filteringText, filteringTokens, filteringProperties, usePropertyFilter]);

  // 정렬된 아이템
  const sortedItems = React.useMemo(() => {
    if (!sorting.sortingColumn?.sortingField) return filteredItems;

    const { sortingField } = sorting.sortingColumn;

    return [...filteredItems].sort((a, b) => {
      const aValue = a[sortingField as keyof T];
      const bValue = b[sortingField as keyof T];

      if (aValue === null || aValue === undefined) return sorting.sortingDescending ? 1 : -1;
      if (bValue === null || bValue === undefined) return sorting.sortingDescending ? -1 : 1;

      if (aValue === bValue) return 0;

      const compareResult = aValue < bValue ? -1 : 1;
      return sorting.sortingDescending ? -compareResult : compareResult;
    });
  }, [filteredItems, sorting]);

  // 페이지 아이템
  const paginatedItems = React.useMemo(() => {
    if (!pagination) return sortedItems;

    const startIndex = (currentPageIndex - 1) * pageSize;
    return sortedItems.slice(startIndex, startIndex + pageSize);
  }, [sortedItems, currentPageIndex, pagination, pageSize]);

  // 선택 변경 처리
  const handleSelectionChange = ({ detail }: { detail: { selectedItems: T[] } }) => {
    setSelectedItems(detail.selectedItems);
    if (onSelectionChange) {
      onSelectionChange(detail.selectedItems);
    }
  };

  // 기본 빈 상태
  const defaultEmptyText = {
    title: t('common:no_data.title', '데이터가 없습니다'),
    subtitle: t('common:no_data.description', '표시할 데이터가 없습니다'),
  };

  const finalEmptyText = { ...defaultEmptyText, ...emptyText };

  // PropertyFilter 옵션 변환
  const propertyFilterOptions = filteringProperties.map(prop => ({
    propertyKey: prop.key,
    value: '', // 기본값 제공
    operator: ':', // 기본 연산자
    propertyLabel: prop.propertyLabel || prop.label
  }));

  return (
    <Table
      loading={loading}
      loadingText={t('common:loading', '로딩 중')}
      columnDefinitions={columnDefinitions}
      items={paginatedItems}
      trackBy={trackBy}
      selectionType={selectionType}
      selectedItems={selectedItems}
      onSelectionChange={handleSelectionChange}
      stickyHeader={stickyHeader}
      stripedRows={stripedRows}
      resizableColumns={resizableColumns}
      header={
        <Header
          variant="awsui-h1-sticky"
          description={description}
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              {onRefresh && (
                <Button
                  iconName="refresh"
                  onClick={onRefresh}
                  ariaLabel={t('common:refresh', '새로고침')}
                />
              )}

              {batchActions && selectedItems.length > 0 && (
                <ButtonDropdown
                  items={batchActions.map(action => ({
                    text: action.text,
                    id: action.text,
                    disabled: action.disabled
                  }))}
                  onItemClick={({ detail }) => {
                    const selectedAction = batchActions.find(a => a.text === detail.id);
                    if (selectedAction) selectedAction.onClick();
                  }}
                >
                  {t('common:actions', '작업')}
                </ButtonDropdown>
              )}

              {actions?.secondary?.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.onClick}
                  disabled={action.disabled}
                >
                  {action.text}
                </Button>
              ))}

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
        usePropertyFilter ? (
          <PropertyFilter
            query={{  // query 속성 필수!
              tokens: filteringTokens,
              operation: 'and'
            }}
            i18nStrings={{
              filteringAriaLabel: t('common:property_filtering.aria_label', '속성으로 필터링'),
              dismissAriaLabel: t('common:property_filtering.dismiss', '해제'),
              filteringPlaceholder: t('common:property_filtering.placeholder', '속성으로 필터링'),
              groupValuesText: t('common:property_filtering.group_values', '값'),
              groupPropertiesText: t('common:property_filtering.group_properties', '속성'),
              operatorsText: t('common:property_filtering.operators', '연산자'),
              operationAndText: t('common:property_filtering.and', 'AND'),
              operationOrText: t('common:property_filtering.or', 'OR'),
              operatorLessText: t('common:property_filtering.less', '미만'),
              operatorLessOrEqualText: t('common:property_filtering.less_or_equal', '이하'),
              operatorGreaterText: t('common:property_filtering.greater', '초과'),
              operatorGreaterOrEqualText: t('common:property_filtering.greater_or_equal', '이상'),
              operatorContainsText: t('common:property_filtering.contains', '포함'),
              operatorDoesNotContainText: t('common:property_filtering.does_not_contain', '포함하지 않음'),
              operatorEqualsText: t('common:property_filtering.equals', '같음'),
              operatorDoesNotEqualText: t('common:property_filtering.does_not_equal', '같지 않음'),
              editTokenHeader: t('common:property_filtering.edit_token', '필터 편집'),
              propertyText: t('common:property_filtering.property', '속성'),
              operatorText: t('common:property_filtering.operator', '연산자'),
              valueText: t('common:property_filtering.value', '값'),
              cancelActionText: t('common:cancel', '취소'),
              applyActionText: t('common:apply', '적용'),
              allPropertiesLabel: t('common:property_filtering.all_properties', '모든 속성')
            }}
            filteringOptions={propertyFilterOptions}
            filteringProperties={filteringProperties.map(prop => ({
              key: prop.key,
              operators: prop.operators || [':', '!:', '=', '!=', '>', '<', '>=', '<='],
              propertyLabel: prop.propertyLabel || prop.label,
              groupValuesLabel: prop.label
            }))}
            onChange={({ detail }) => setFilteringTokens(detail.tokens)}
          />
        ) : filteringProperties.length > 0 ? (
          <TextFilter
            filteringText={filteringText}
            filteringPlaceholder={t('common:search_placeholder', '검색')}
            filteringAriaLabel={t('common:search_aria_label', '검색')}
            onChange={({ detail }) => {
              setFilteringText(detail.filteringText);
              setCurrentPageIndex(1); // 검색 시 첫 페이지로
            }}
          />
        ) : filteringProperties.length > 0 ? (
      }
      pagination={
        pagination && (
          <Pagination
            currentPageIndex={currentPageIndex}
            onChange={({ detail }) => setCurrentPageIndex(detail.currentPageIndex)}
            pagesCount={Math.max(1, Math.ceil(sortedItems.length / pageSize))}
            ariaLabels={{
              nextPageLabel: t('common:pagination.next', '다음'),
              previousPageLabel: t('common:pagination.previous', '이전'),
              pageLabel: (pageNumber) => t('common:pagination.page_label', { pageNumber })
            }}
          />
        )
      }
      sortingColumn={sorting.sortingColumn}
      sortingDescending={sorting.sortingDescending}
      onSortingChange={({ detail }) => {
        setSorting({
          sortingColumn: detail.sortingColumn,
          sortingDescending: detail.isDescending ?? false
        });
      }}
      empty={
        <Box textAlign="center" padding="l">
          <b>{finalEmptyText.title}</b>
          <Box padding={{ bottom: 's' }} variant="p">
            {finalEmptyText.subtitle}
          </Box>
          {finalEmptyText.action && (
            <Button onClick={finalEmptyText.action.onClick}>
              {finalEmptyText.action.text}
            </Button>
          )}
        </Box>
      }
      preferences={
        preferences ? (
          <CollectionPreferences
            title={t('common:preferences.title', '환경설정')}
            confirmLabel={t('common:confirm', '확인')}
            cancelLabel={t('common:cancel', '취소')}
            onConfirm={({ detail }) => {
              if (onPreferencesChange) {
                onPreferencesChange(detail);
              }
            }}
            preferences={{
              pageSize,
              visibleContent: columnDefinitions.map(col => col.id as string)
            }}
            pageSizePreference={{
              title: t('common:preferences.page_size.title', '페이지 크기'),
              options: [
                { value: 10, label: '10' },
                { value: 20, label: '20' },
                { value: 50, label: '50' },
                { value: 100, label: '100' }
              ]
            }}
            visibleContentPreference={
              visibleContentOptions ? {
                title: t('common:preferences.visible_content.title', '표시할 콘텐츠'),
                options: visibleContentOptions
              } : undefined
            }
          />
        ) : undefined
      }
      wrapLines
      variant="full-page"
    />
  );
}

export default EnhancedTable;