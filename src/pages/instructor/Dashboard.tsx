// pages/Dashboard.tsx
import React, { useEffect } from 'react';
import {
  Container,
  Header,
  Cards,
  Box,
  SpaceBetween,
  Button,
  ColumnLayout,
  Badge,
  StatusIndicator,
  Grid
} from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { generateClient } from 'aws-amplify/api';

// 수정: Cloudscape의 Tiles 컴포넌트 속성에 맞게 정의
interface QuickActionDefinition {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
}

const Dashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [client] = useState(() => generateClient());

  
  // 안전한 번역 함수를 생성
  const tStr = (key: string, options?: any): string => {
    const result = t(key, options);
    return typeof result === 'string' ? result : String(result);
  };

  // Sample data for statistics
  const sessionStats = [
    { title: tStr('dashboard.stats.active_sessions'), value: "12", trend: "up", change: tStr('dashboard.stats.change.week_up', { count: 3 }) },
    { title: tStr('dashboard.stats.total_students'), value: "487", trend: "up", change: tStr('dashboard.stats.change.month_up', { count: 42 }) },
    { title: tStr('dashboard.stats.completion_rate'), value: "87%", trend: "up", change: tStr('dashboard.stats.change.quarter_up', { count: 5 }) },
    { title: tStr('dashboard.stats.quiz_completion'), value: "93%", trend: "neutral", change: tStr('dashboard.stats.change.same') }
  ];

  // Upcoming sessions data
  const upcomingSessions = [
    {
      id: "1",
      title: tStr('dashboard.sessions.courses.practitioner'),
      status: "scheduled",
      description: tStr('dashboard.sessions.descriptions.practitioner'),
      date: tStr('dashboard.sessions.date.today', { start: '2:00 PM', end: '4:00 PM' }),
      participants: 25,
      preparationComplete: true
    },
    {
      id: "2",
      title: tStr('dashboard.sessions.courses.architect'),
      status: "scheduled",
      description: tStr('dashboard.sessions.descriptions.architect'),
      date: tStr('dashboard.sessions.date.tomorrow', { start: '10:00 AM', end: '1:00 PM' }),
      participants: 18,
      preparationComplete: false
    },
    {
      id: "3", 
      title: tStr('dashboard.sessions.courses.developer'),
      status: "live",
      description: tStr('dashboard.sessions.descriptions.developer'),
      date: tStr('dashboard.sessions.date.live_now'),
      participants: 22,
      preparationComplete: true
    }
  ];
  
  // Course progress data for chart
  const courseProgressData = [
    {
      title: tStr('dashboard.charts.course_completion'),
      type: "bar" as const,
      data: [
        { x: tStr('dashboard.charts.courses.cloud_practitioner'), y: 75 },
        { x: tStr('dashboard.charts.courses.solutions_architect'), y: 45 },
        { x: tStr('dashboard.charts.courses.developer'), y: 60 },
        { x: tStr('dashboard.charts.courses.devops'), y: 30 },
        { x: tStr('dashboard.charts.courses.security'), y: 85 }
      ]
    }
  ];

  // Student participation data for pie chart
  const studentParticipationData = [
    { title: tStr('dashboard.charts.participation.active'), value: 68 },
    { title: tStr('dashboard.charts.participation.at_risk'), value: 22 },
    { title: tStr('dashboard.charts.participation.inactive'), value: 10 }
  ];

  // Quick action tiles - Cloudscape Tiles 컴포넌트에 맞게 수정
  const quickActionTiles: QuickActionDefinition[] = [
    {
      value: "create-course",
      label: tStr('dashboard.quick_actions.create_course.title'),
      description: tStr('dashboard.quick_actions.create_course.description')
    },
    {
      value: "generate-quiz",
      label: tStr('dashboard.quick_actions.generate_quiz.title'),
      description: tStr('dashboard.quick_actions.generate_quiz.description')
    },
    {
      value: "view-reports",
      label: tStr('dashboard.quick_actions.view_reports.title'),
      description: tStr('dashboard.quick_actions.view_reports.description')
    },
    {
      value: "manage-materials",
      label: tStr('dashboard.quick_actions.manage_materials.title'),
      description: tStr('dashboard.quick_actions.manage_materials.description')
    }
  ];

  // 바차트를 위한 i18n 문자열 객체
  const barChartI18nStrings = {
    filterLabel: tStr('dashboard.charts.filter_label'),
    filterPlaceholder: tStr('dashboard.charts.filter_placeholder'),
    filterSelectedAriaLabel: tStr('dashboard.charts.filter_selected'),
    legendAriaLabel: tStr('dashboard.charts.legend'),
    chartAriaRoleDescription: tStr('dashboard.charts.bar_chart_description'),
    xAxisAriaRoleDescription: tStr('dashboard.charts.x_axis'),
    yAxisAriaRoleDescription: tStr('dashboard.charts.y_axis')
  };

  // 파이차트를 위한 i18n 문자열 객체
  const pieChartI18nStrings = {
    detailsValue: tStr('dashboard.charts.details_value'),
    detailsPercentage: tStr('dashboard.charts.details_percentage'),
    filterLabel: tStr('dashboard.charts.filter_label'),
    filterPlaceholder: tStr('dashboard.charts.filter_placeholder'),
    filterSelectedAriaLabel: tStr('dashboard.charts.filter_selected'),
    legendAriaLabel: tStr('dashboard.charts.legend'),
    chartAriaRoleDescription: tStr('dashboard.charts.pie_chart_description'),
    segmentAriaRoleDescription: tStr('dashboard.charts.segment_description')
  };

  const quickActions: QuickAction[] = [
    {
      id: 'create-course',
      title: tStr('dashboard.quick_actions.create_course.title'),
      description: tStr('dashboard.quick_actions.create_course.description'),
      icon: '➕',
      path: '/instructor/courses/create'
    },
    {
      id: 'generate-quiz',
      title: tStr('dashboard.quick_actions.generate_quiz.title'),
      description: tStr('dashboard.quick_actions.generate_quiz.description'),
      icon: '📝',
      path: '/instructor/assessments/quiz-creator'
    },
    {
      id: 'view-reports',
      title: tStr('dashboard.quick_actions.view_reports.title'),
      description: tStr('dashboard.quick_actions.view_reports.description'),
      icon: '📊',
      path: '/instructor/analytics/reports'
    },
    {
      id: 'manage-materials',
      title: tStr('dashboard.quick_actions.manage_materials.title'),
      description: tStr('dashboard.quick_actions.manage_materials.description'),
      icon: '📚',
      path: '/instructor/courses'
    }
  ];

  

  // 퀵액션 선택 핸들러
  const handleQuickActionSelect = (detail: { value: string }) => {
    switch (detail.value) {
      case "create-course":
        navigate("/instructor/courses/create");
        break;
      case "generate-quiz":
        navigate("/instructor/assessments/quiz-creator");
        break;
      case "view-reports":
        navigate("/instructor/analytics/reports");
        break;
      case "manage-materials":
        navigate("/instructor/courses");
        break;
    }
  };

  return (
    <SpaceBetween size="l">
      {/* Stats Overview Cards */}
      <ColumnLayout columns={4} variant="text-grid">
        {sessionStats.map((stat, index) => (
          <Container
            key={index}
            header={<Header variant="h3">{stat.title}</Header>}
          >
            <SpaceBetween size="xs">
              <Box fontSize="heading-xl" fontWeight="bold">
                {stat.value}
              </Box>
              <StatusIndicator type={
                stat.trend === "up" ? "success" : 
                stat.trend === "down" ? "error" : "info"
              }>
                {stat.change}
              </StatusIndicator>
            </SpaceBetween>
          </Container>
        ))}
      </ColumnLayout>

      {/* Upcoming Sessions */}
      <Container
        header={
          <Header
            variant="h2"
            actions={
              <Button 
                variant="primary" 
                iconName="add-plus" 
                onClick={() => navigate("/instructor/sessions/create")}
              >
                {tStr('dashboard.sessions.create_button')}
              </Button>
            }
          >
            {tStr('dashboard.sections.sessions')}
          </Header>
        }
      >
        <Cards
          cardDefinition={{
            header: (item) => (
              <SpaceBetween size="xs">
                <Box>{item.title}</Box>
                {item.status === "live" && (
                  <Badge color="red">{tStr('dashboard.sessions.live_badge')}</Badge>
                )}
              </SpaceBetween>
            ),
            sections: [
              {
                id: 'description',
                content: (item) => item.description
              },
              {
                id: 'date',
                header: tStr('dashboard.sessions.when'),
                content: (item) => (
                  <StatusIndicator type={item.status === "live" ? "error" : "pending"}>
                    {item.date}
                  </StatusIndicator>
                )
              },
              {
                id: 'participants',
                header: tStr('dashboard.sessions.participants'),
                content: (item) => tStr('dashboard.sessions.registered_count', { count: item.participants })
              },
              {
                id: 'preparation',
                header: tStr('dashboard.sessions.preparation'),
                content: (item) => (
                  <StatusIndicator type={item.preparationComplete ? "success" : "warning"}>
                    {item.preparationComplete ? 
                      tStr('dashboard.sessions.preparation_ready') : 
                      tStr('dashboard.sessions.preparation_needed')}
                  </StatusIndicator>
                )
              },
              {
                id: 'actions',
                content: (item) => (
                  <SpaceBetween direction="horizontal" size="xs">
                    {item.status === "live" ? (
                      <Button variant="primary" iconName="external">
                        {tStr('dashboard.sessions.actions.join')}
                      </Button>
                    ) : (
                      <Button variant="normal" iconName="edit">
                        {tStr('dashboard.sessions.actions.edit')}
                      </Button>
                    )}
                    <Button iconName="view-full">
                      {tStr('dashboard.sessions.actions.materials')}
                    </Button>
                  </SpaceBetween>
                )
              }
            ]
          }}
          cardsPerRow={[
            { cards: 1 },
            { minWidth: 500, cards: 2 }
          ]}
          items={upcomingSessions}
          empty={
            <Box textAlign="center" color="inherit">
              <b>{tStr('dashboard.sessions.empty.title')}</b>
              <Box padding={{ bottom: "s" }} variant="p" color="inherit">
                {tStr('dashboard.sessions.empty.description')}
              </Box>
              <Button iconName="add-plus">{tStr('dashboard.sessions.create_button')}</Button>
            </Box>
          }
        />
      </Container>

      <ColumnLayout columns={2}>
        {/* Quick Actions - 간단한 Grid와 Box를 사용 */}
        <Container
          header={
            <Header variant="h2">{tStr('dashboard.sections.quick_actions')}</Header>
          }
        >
          <Grid
            gridDefinition={[
              { colspan: { default: 6, xxs: 12 } },
              { colspan: { default: 6, xxs: 12 } },
              { colspan: { default: 6, xxs: 12 } },
              { colspan: { default: 6, xxs: 12 } }
            ]}
          >
            {quickActions.map(action => (
              <Box key={action.id} padding="s">
                <SpaceBetween size="xs">
                  <Box textAlign="center">
                    <Box fontSize="heading-xl" color="text-status-info">
                      {action.icon}
                    </Box>
                    <Box variant="h3" padding="xs">
                      {action.title}
                    </Box>
                  </Box>
                  <Box variant="p" color="text-body-secondary">
                    {action.description}
                  </Box>
                  <Button fullWidth onClick={() => navigate(action.path)}>
                    {tStr('dashboard.quick_actions.go')}
                  </Button>
                </SpaceBetween>
              </Box>
            ))}
          </Grid>
        </Container>
        
        {/* Recent Activity 부분 코드 유지... */}
      </ColumnLayout>
    </SpaceBetween>
  );
};

export default Dashboard;