// src/pages/catalog/CourseCatalogPage.tsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Container, 
  Header, 
  Table, 
  Button, 
  Pagination, 
  SpaceBetween,
  Cards,
  TextFilter,
  Spinner,
  Box
} from '@cloudscape-design/components';
import { fetchAllCourseCatalogs, searchCourseCatalogs } from '@/services/api/courseCatalogApi';
import { CourseCatalog, CourseCatalogFilter } from '@/models/courseCatalog';
import { useNavigate } from 'react-router-dom';
import { useAppTranslation } from '@/hooks/useAppTranslation';


const CourseCatalogPage: React.FC = () => {
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  
  const [catalogs, setCatalogs] = useState<CourseCatalog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filterText, setFilterText] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);

  const itemsPerPage = 10;
  
  // 데이터 로드
  useEffect(() => {
    const loadCatalogs = async () => {
      setLoading(true);
      try {
        // 검색 필터가 없으면 전체 목록 가져오기
        if (!filterText && selectedCategories.length === 0 && selectedLevels.length === 0) {
          const data = await fetchAllCourseCatalogs();
          setCatalogs(data);
        } else {
          // 검색 필터 적용
          const filter: CourseCatalogFilter = {};
          
          if (filterText) {
            filter.text = filterText;
          }
          
          if (selectedLevels.length > 0) {
            filter.level = selectedLevels[0]; // 현재는 단일 레벨만 지원
          }
          
          const data = await searchCourseCatalogs(filter);
          setCatalogs(data);
        }
        setError(null);
      } catch (err) {
        console.error('코스 카탈로그 로드 오류:', err);
        setError(t('errors.failedToLoadCatalogs', { ns: 'courseCatalog' }));
        setCatalogs([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadCatalogs();
  }, [filterText, selectedCategories, selectedLevels, t]);
  
  // 페이지네이션 계산
  const totalPages = Math.ceil(catalogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCatalogs = catalogs.slice(startIndex, endIndex);
  
  // 레벨 목록 (중복 제거)
  const levels = Array.from(new Set(catalogs.map(c => c.level).filter(Boolean))) as string[];
  
  const handleCreateCatalog = () => {
    navigate('/catalog/create');
  };
  
  const handleEditCatalog = (id: string) => {
    navigate(`/catalog/edit/\${id}`); // 수정된 템플릿 문자열
  };
  
  const handleViewCatalog = (id: string) => {
    navigate(`/catalog/\${id}`); // 수정된 템플릿 문자열
  };

  if (loading) {
    return (
      <Container>
        <Box textAlign="center" padding="l">
          <Spinner size="large" />
          <p>{t('loading', { ns: 'common' })}</p>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box textAlign="center" padding="l">
          <h2>{t('errors.loadError', { ns: 'common' })}</h2>
          <p>{error}</p>
          <Button onClick={() => window.location.reload()}>
            {t('retry', { ns: 'common' })}
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <SpaceBetween size="l">
        <Header
          variant="h1"
          actions={
            <Button variant="primary" onClick={handleCreateCatalog}>
              {t('actions.createCatalog', { ns: 'courseCatalog' })}
            </Button>
          }
        >
          {t('title.courseCatalogs', { ns: 'courseCatalog' })}
        </Header>
        
        <TextFilter
          filteringText={filterText}
          filteringPlaceholder={t('filters.searchPlaceholder', { ns: 'courseCatalog' })}
          filteringAriaLabel={t('filters.searchAriaLabel', { ns: 'courseCatalog' })}
          onChange={({ detail }) => setFilterText(detail.filteringText)}
        />
        
        {catalogs.length === 0 ? (
          <Box textAlign="center" padding={{ top: 'xxl', bottom: 'xxl' }}>
            <Box variant="h3">
              {t('emptyState.title', { ns: 'courseCatalog' })}
            </Box>
            <Box variant="p" padding={{ bottom: 'm' }}>
              {t('emptyState.message', { ns: 'courseCatalog' })}
            </Box>
            <Button onClick={handleCreateCatalog}>
              {t('actions.createFirstCatalog', { ns: 'courseCatalog' })}
            </Button>
          </Box>
        ) : (
          <>
            <Table
              columnDefinitions={[
                {
                  id: 'title',
                  header: t('fields.title', { ns: 'courseCatalog' }),
                  cell: item => item.course_name,
                  sortingField: 'title'
                },
                {
                  id: 'awsCode',
                  header: t('fields.awsCode', { ns: 'courseCatalog' }),
                  cell: item => item.course_id || '-'
                },
                {
                  id: 'level',
                  header: t('fields.level', { ns: 'courseCatalog' }),
                  cell: item => item.level || '-'
                },
                {
                  id: 'status',
                  header: t('fields.status', { ns: 'courseCatalog' }),
                  cell: item => item.status || 'DRAFT'
                },
                {
                  id: 'actions',
                  header: t('fields.actions', { ns: 'courseCatalog' }),
                  cell: item => (
                    <SpaceBetween size="xs" direction="horizontal">
                      <Button onClick={() => handleViewCatalog(item.id)} variant="link">
                        {t('actions.view', { ns: 'common' })}
                      </Button>
                      <Button onClick={() => handleEditCatalog(item.id)} variant="link">
                        {t('actions.edit', { ns: 'common' })}
                      </Button>
                    </SpaceBetween>
                  )
                }
              ]}
              items={currentCatalogs}
              loading={loading}
              loadingText={t('loading', { ns: 'common' })}
              trackBy="id"
              selectionType="single"
              empty={
                <Box textAlign="center" color="inherit">
                  <b>{t('emptyState.noMatchingResults', { ns: 'courseCatalog' })}</b>
                  <Box padding={{ bottom: 's' }} variant="p" color="inherit">
                    {t('emptyState.clearFilters', { ns: 'courseCatalog' })}
                  </Box>
                </Box>
              }
            />
            
            {totalPages > 1 && (
              <Box textAlign="center">
                <Pagination
                  currentPageIndex={currentPage}
                  pagesCount={totalPages}
                  onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
                  ariaLabels={{
                    nextPageLabel: t('pagination.next', { ns: 'common' }),
                    previousPageLabel: t('pagination.previous', { ns: 'common' }),
                    pageLabel: pageNumber => t('pagination.pageLabel', { pageNumber, ns: 'common' })
                  }}
                />
              </Box>
            )}
          </>
        )}
      </SpaceBetween>
    </Container>
  );
};

export default CourseCatalogPage;