// src/pages/public/components/Resources.tsx
import React from 'react';
import { 
  Table, 
  Box, 
  SpaceBetween,
  Button,
  Header,
  TextFilter,
  Pagination
} from '@cloudscape-design/components';
import { useTranslation } from 'react-i18next';
import { resources } from '../../../models/resources';
import { useState } from 'react';

const Resources: React.FC = () => {
  const { t } = useTranslation();
  const [filteringText, setFilteringText] = useState('');
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [selectedItems, setSelectedItems] = useState<typeof resources>([]);
  
  // 필터링된 자료 목록
  const filteredResources = resources.filter(
    resource => 
      resource.title.toLowerCase().includes(filteringText.toLowerCase()) ||
      resource.description.toLowerCase().includes(filteringText.toLowerCase()) ||
      resource.category.toLowerCase().includes(filteringText.toLowerCase())
  );
  
  // 페이지네이션 설정
  const PAGE_SIZE = 10;
  const paginatedResources = filteredResources.slice(
    (currentPageIndex - 1) * PAGE_SIZE,
    currentPageIndex * PAGE_SIZE
  );

  return (
    <SpaceBetween size="l">
      <Table
        columnDefinitions={[
          {
            id: "title",
            header: t('tnc.resources.title'),
            cell: item => item.title,
            sortingField: "title"
          },
          {
            id: "category",
            header: t('tnc.resources.category'),
            cell: item => item.category,
            sortingField: "category"
          },
          {
            id: "description",
            header: t('tnc.resources.description'),
            cell: item => item.description
          },
          {
            id: "date",
            header: t('tnc.resources.uploadDate'),
            cell: item => new Date(item.uploadDate).toLocaleDateString(),
            sortingField: "uploadDate"
          },
          {
            id: "actions",
            header: t('tnc.resources.actions'),
            cell: item => (
              <SpaceBetween direction="horizontal" size="xs">
                {item.fileUrl && (
                  <Button
                    iconName="download"
                    href={item.fileUrl}
                    download={item.fileName || true}
                  >
                    {t('tnc.resources.download')}
                  </Button>
                )}
                {item.externalLink && (
                  <Button
                    iconName="external"
                    href={item.externalLink}
                    target="_blank"
                  >
                    {t('tnc.resources.view')}
                  </Button>
                )}
              </SpaceBetween>
            )
          }
        ]}
        items={paginatedResources}
        loadingText={t('common.loading')}
        selectionType="multi"
        selectedItems={selectedItems}
        onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
        empty={
          <Box textAlign="center" color="inherit">
            <b>{t('tnc.resources.noResources')}</b>
            <Box padding={{ bottom: "s" }} variant="p" color="inherit">
              {t('tnc.resources.empty')}
            </Box>
          </Box>
        }
        filter={
          <TextFilter
            filteringText={filteringText}
            filteringPlaceholder={t('tnc.resources.search')}
            filteringAriaLabel={t('tnc.resources.search')}
            onChange={({ detail }) => setFilteringText(detail.filteringText)}
          />
        }
        pagination={
          <Pagination
            currentPageIndex={currentPageIndex}
            pagesCount={Math.ceil(filteredResources.length / PAGE_SIZE) || 1}
            onChange={({ detail }) => setCurrentPageIndex(detail.currentPageIndex)}
            ariaLabels={{
              nextPageLabel: t('pagination.next'),
              previousPageLabel: t('pagination.previous'),
              pageLabel: page => t('pagination.pageLabel', { page })
            }}
          />
        }
        header={
          <Header
            counter={`(\${filteredResources.length})`}
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                {selectedItems.length > 0 && (
                  <Button iconName="download">
                    {t('tnc.resources.downloadSelected')}
                  </Button>
                )}
              </SpaceBetween>
            }
          >
            {t('tnc.resources.title')}
          </Header>
        }
      />
    </SpaceBetween>
  );
};

export default Resources;