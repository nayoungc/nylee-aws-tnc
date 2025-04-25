import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Header,
  SpaceBetween,
  Alert,
  Table,
  Pagination,
  TextFilter
} from '@cloudscape-design/components';
import { useAuth } from '../../contexts/AuthContext';
import { useCatalog } from '../../hooks/useCatalog';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';

const CourseCatalogTab: React.FC = () => {
  const { t } = useTypedTranslation();
  const navigate = useNavigate();
  const auth = useAuth();
  const { courses, loading, error, isMockData, refresh } = useCatalog();
  const [filterText, setFilterText] = useState('');
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const PAGE_SIZE = 10;

  // 필터링된 코스
  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(filterText.toLowerCase()) ||
    course.description?.toLowerCase().includes(filterText.toLowerCase()) ||
    course.level?.toLowerCase().includes(filterText.toLowerCase())
  );

  // 페이지네이션
  const startIndex = (currentPageIndex - 1) * PAGE_SIZE;
  const paginatedCourses = filteredCourses.slice(startIndex, startIndex + PAGE_SIZE);
  const pagesCount = Math.ceil(filteredCourses.length / PAGE_SIZE) || 1;

  // 자격 증명 갱신
  const handleRefreshCredentials = async () => {
    try {
      const success = await auth.refreshCredentials();
      if (success) {
        refresh();
      } else {
        alert('자격 증명 갱신에 실패했습니다. 다시 로그인해주세요.');
      }
    } catch (error) {
      console.error('자격 증명 갱신 중 오류:', error);
    }
  };

  return (
    <Container
      header={
        <Header
          variant="h1"
          description={t('courses.catalog_admin_description') || "과정 카탈로그를 관리합니다."}
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button iconName="refresh" onClick={refresh}>
                {t('admin.common.refresh') || "새로고침"}
              </Button>
              <Button onClick={() => navigate('/courses/create')}>
                {t('courses.create_course') || "과정 생성"}
              </Button>
            </SpaceBetween>
          }
        >
          {t('courses.catalog_management') || "과정 카탈로그 관리"}
        </Header>
      }
    >
      {/* 자격 증명 경고 */}
      {auth.isAuthenticated && !auth.hasCredentials && (
        <Box padding="s">
          <Alert
            type="warning"
            header={t('auth.credentials_required') || "AWS 자격 증명 필요"}
            action={
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={handleRefreshCredentials}>
                  {t('auth.refresh_credentials') || "자격 증명 갱신"}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => auth.loginRedirect()}
                >
                  {t('auth.logout_and_login') || "로그아웃 후 다시 로그인"}
                </Button>
              </SpaceBetween>
            }
          >
            {t('auth.mock_data_warning') || "AWS 자격 증명 부족으로 모의 데이터가 표시되고 있습니다."}
          </Alert>
        </Box>
      )}

      {/* 모의 데이터 알림 */}
      {isMockData && (
        <Alert
          type="info"
          header={t('courses.mock_data_header') || "모의 데이터 표시 중"}
        >
          {t('courses.mock_data_description') || "현재 모의 데이터를 표시하고 있습니다."}
        </Alert>
      )}

      {/* 오류 메시지 */}
      {error && (
        <Alert type="error" dismissible>
          {error}
        </Alert>
      )}

      {/* 테이블 */}
      <Table
        loading={loading}
        loadingText={t('common.loading') || "로딩 중..."}
        header={
          <Header
            counter={`\${filteredCourses.length}`}
            actions={
              <TextFilter
                filteringText={filterText}
                filteringPlaceholder="검색..."
                filteringAriaLabel="검색"
                onChange={({ detail }) => setFilterText(detail.filteringText)}
              />
            }
          >
            코스 목록
          </Header>
        }
        columnDefinitions={[
          {
            id: 'title',
            header: t('courses.title') || '제목',
            cell: item => item.title,
            sortingField: 'title'
          },
          {
            id: 'level',
            header: t('courses.level') || '난이도',
            cell: item => item.level || '-',
            sortingField: 'level'
          },
          {
            id: 'duration',
            header: t('courses.duration') || '기간',
            cell: item => `\${item.duration}시간`,
            sortingField: 'duration'
          },
          {
            id: 'actions',
            header: t('courses.actions') || '작업',
            cell: item => (
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={() => navigate(`/courses/\${item.catalogId}`)}>
                  {t('courses.view') || '보기'}
                </Button>
                <Button onClick={() => navigate(`/courses/\${item.catalogId}/edit`)}>
                  {t('courses.edit') || '편집'}
                </Button>
              </SpaceBetween>
            )
          }
        ]}
        items={paginatedCourses}
        pagination={
          <Pagination
            currentPageIndex={currentPageIndex}
            pagesCount={pagesCount}
            onChange={({ detail }) => setCurrentPageIndex(detail.currentPageIndex)}
            ariaLabels={{
              nextPageLabel: '다음',
              previousPageLabel: '이전',
              pageLabel: page => `\${page}페이지`
            }}
          />
        }
        empty={
          <Box textAlign="center" padding="l">
            <b>{t('courses.no_courses') || "과정이 없습니다."}</b>
            <Box padding={{ bottom: 's' }} variant="p" color="inherit">
              {t('courses.no_courses_to_display') || "표시할 과정이 없습니다."}
            </Box>
            <Button onClick={refresh}>
              {t('admin.common.refresh') || "새로고침"}
            </Button>
          </Box>
        }
      />
    </Container>
  );
};

export default CourseCatalogTab;