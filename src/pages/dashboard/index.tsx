import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Cards,
  Container, 
  Header,
  SpaceBetween,
  ColumnLayout
} from '@cloudscape-design/components';
import { MainLayout } from '../../layouts/app-layout';
import { useAuth } from '../../auth/auth-context';
import { dynamoDBService } from '../../services/dynamodb-service';
import { DashboardMetric } from '../../models/dashboard-metrics';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const result = await dynamoDBService.scanItems('Tnc-DashboardMetrics');
        setMetrics(result as DashboardMetric[]);
      } catch (error) {
        console.error('대시보드 데이터 로딩 실패:', error);
      } finally {
        setDataLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <MainLayout activeHref="/" title="교육 관리 시스템">
      <SpaceBetween size="xl">
        <Container
          header={
            <Header variant="h2">
              대시보드
            </Header>
          }
        >
          <ColumnLayout columns={2} variant="text-grid">
            <div>
              <h3>환영합니다, {user.username || '사용자'}님!</h3>
              <p>교육 관리 시스템에 오신 것을 환영합니다.</p>
            </div>
            <div>
              <h3>최근 활동</h3>
              <p>과정 및 활동 데이터를 확인하세요.</p>
            </div>
          </ColumnLayout>
        </Container>

        <Container
          header={
            <Header variant="h2">주요 지표</Header>
          }
        >
          <Cards
            cardDefinition={{
              header: item => item.metricType,
              sections: [
                {
                  id: "value",
                  header: "값",
                  content: item => item.value
                },
                {
                  id: "change",
                  header: "변화",
                  content: item => `\${item.change || 0}%`
                }
              ]
            }}
            cardsPerRow={[
              { cards: 1 },
              { minWidth: 500, cards: 2 },
              { minWidth: 992, cards: 3 }
            ]}
            items={metrics}
            loading={dataLoading}
            loadingText="데이터 로딩 중"
            empty={
              <div>데이터가 없습니다</div>
            }
          />
        </Container>
      </SpaceBetween>
    </MainLayout>
  );
};

export default DashboardPage;
