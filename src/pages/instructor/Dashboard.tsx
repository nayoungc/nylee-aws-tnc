import React from 'react';
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
  Grid,
  BarChart, // 바차트 추가
  PieChart  // 파이차트 추가
} from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';
import { generateClient } from 'aws-amplify/api';
import { useTypedTranslation } from '@utils/i18n-utils'; // 수정됨: 커스텀 훅 사용

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
}

const Dashboard: React.FC = () => {
  const { t, tString } = useTypedTranslation(); // 수정됨: 커스텀 훅 사용
  const navigate = useNavigate();
  const client = generateClient();

  // Sample data for statistics
  const sessionStats = [
    { 
      title: tString('dashboard.stats.active_sessions'), 
      value: "12", 
      trend: "up", 
      change: tString('dashboard.stats.change.week_up', { count: 3 }) 
    },
    { 
      title: tString('dashboard.stats.total_students'), 
      value: "487", 
      trend: "up", 
      change: tString('dashboard.stats.change.month_up', { count: 42 }) 
    },
    { 
      title: tString('dashboard.stats.completion_rate'), 
      value: "87%", 
      trend: "up", 
      change: tString('dashboard.stats.change.quarter_up', { count: 5 }) 
    },
    { 
      title: tString('dashboard.stats.quiz_completion'), 
      value: "93%", 
      trend: "neutral", 
      change: tString('dashboard.stats.change.same') 
    }
  ];

  // Upcoming sessions data
  const upcomingSessions = [
    {
      id: "1",
      title: tString('dashboard.sessions.courses.practitioner'),
      status: "scheduled",
      description: tString('dashboard.sessions.descriptions.practitioner'),
      date: tString('dashboard.sessions.date.today', { start: '2:00 PM', end: '4:00 PM' }),
      participants: 25,
      preparationComplete: true
    },
    {
      id: "2",
      title: tString('dashboard.sessions.courses.architect'),
      status: "scheduled",
      description: tString('dashboard.sessions.descriptions.architect'),
      date: tString('dashboard.sessions.date.tomorrow', { start: '10:00 AM', end: '1:00 PM' }),
      participants: 18,
      preparationComplete: false
    },
    {
      id: "3", 
      title: tString('dashboard.sessions.courses.developer'),
      status: "live",
      description: tString('dashboard.sessions.descriptions.developer'),
      date: tString('dashboard.sessions.date.live_now'),
      participants: 22,
      preparationComplete: true
    }
  ];
  
  // Course progress data for chart
  const courseProgressData = [
    {
      title: tString('dashboard.charts.course_completion'),
      type: "bar" as const,
      data: [
        { x: tString('dashboard.charts.courses.cloud_practitioner'), y: 75 },
        { x: tString('dashboard.charts.courses.solutions_architect'), y: 45 },
        { x: tString('dashboard.charts.courses.developer'), y: 60 },
        { x: tString('dashboard.charts.courses.devops'), y: 30 },
        { x: tString('dashboard.charts.courses.security'), y: 85 }
      ]
    }
  ];

  // Student participation data for pie chart
  const studentParticipationData = [
    { title: tString('dashboard.charts.participation.active'), value: 68 },
    { title: tString('dashboard.charts.participation.at_risk'), value: 22 },
    { title: tString('dashboard.charts.participation.inactive'), value: 10 }
  ];

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      id: 'create-course',
      title: tString('dashboard.quick_actions.create_course.title'),
      description: tString('dashboard.quick_actions.create_course.description'),
      icon: '➕',
      path: '/instructor/courses/create'
    },
    {
      id: 'generate-quiz',
      title: tString('dashboard.quick_actions.generate_quiz.title'),
      description: tString('dashboard.quick_actions.generate_quiz.description'),
      icon: '📝',
      path: '/instructor/assessments/quiz-creator'
    },
    {
      id: 'view-reports',
      title: tString('dashboard.quick_actions.view_reports.title'),
      description: tString('dashboard.quick_actions.view_reports.description'),
      icon: '📊',
      path: '/instructor/analytics/reports'
    },
    {
      id: 'manage-materials',
      title: tString('dashboard.quick_actions.manage_materials.title'),
      description: tString('dashboard.quick_actions.manage_materials.description'),
      icon: '📚',
      path: '/instructor/courses'
    }
  ];

  // 바차트를 위한 i18n 문자열 객체
  const barChartI18nStrings = {
    filterLabel: tString('dashboard.charts.filter_label'),
    filterPlaceholder: tString('dashboard.charts.filter_placeholder'),
    filterSelectedAriaLabel: tString('dashboard.charts.filter_selected'),
    legendAriaLabel: tString('dashboard.charts.legend'),
    chartAriaRoleDescription: tString('dashboard.charts.bar_chart_description'),
    xAxisAriaRoleDescription: tString('dashboard.charts.x_axis'),
    yAxisAriaRoleDescription: tString('dashboard.charts.y_axis')
  };

  // 파이차트를 위한 i18n 문자열 객체
  const pieChartI18nStrings = {
    detailsValue: tString('dashboard.charts.details_value'),
    detailsPercentage: tString('dashboard.charts.details_percentage'),
    filterLabel: tString('dashboard.charts.filter_label'),
    filterPlaceholder: tString('dashboard.charts.filter_placeholder'),
    filterSelectedAriaLabel: tString('dashboard.charts.filter_selected'),
    legendAriaLabel: tString('dashboard.charts.legend'),
    chartAriaRoleDescription: tString('dashboard.charts.pie_chart_description'),
    segmentAriaRoleDescription: tString('dashboard.charts.segment_description')
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
                {tString('dashboard.sessions.create_button')}
              </Button>
            }
          >
            {tString('dashboard.sections.sessions')}
          </Header>
        }
      >
        <Cards
          cardDefinition={{
            header: (item) => (
              <SpaceBetween size="xs">
                <Box>{item.title}</Box>
                {item.status === "live" && (
                  <Badge color="red">{tString('dashboard.sessions.live_badge')}</Badge>
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
                header: tString('dashboard.sessions.when'),
                content: (item) => (
                  <StatusIndicator type={item.status === "live" ? "error" : "pending"}>
                    {item.date}
                  </StatusIndicator>
                )
              },
              {
                id: 'participants',
                header: tString('dashboard.sessions.participants'),
                content: (item) => tString('dashboard.sessions.registered_count', { count: item.participants })
              },
              {
                id: 'preparation',
                header: tString('dashboard.sessions.preparation'),
                content: (item) => (
                  <StatusIndicator type={item.preparationComplete ? "success" : "warning"}>
                    {item.preparationComplete ? 
                      tString('dashboard.sessions.preparation_ready') : 
                      tString('dashboard.sessions.preparation_needed')}
                  </StatusIndicator>
                )
              },
              {
                id: 'actions',
                content: (item) => (
                  <SpaceBetween direction="horizontal" size="xs">
                    {item.status === "live" ? (
                      <Button variant="primary" iconName="external">
                        {tString('dashboard.sessions.actions.join')}
                      </Button>
                    ) : (
                      <Button variant="normal" iconName="edit">
                        {tString('dashboard.sessions.actions.edit')}
                      </Button>
                    )}
                    <Button iconName="view-full">
                      {tString('dashboard.sessions.actions.materials')}
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
              <b>{tString('dashboard.sessions.empty.title')}</b>
              <Box padding={{ bottom: "s" }} variant="p" color="inherit">
                {tString('dashboard.sessions.empty.description')}
              </Box>
              <Button iconName="add-plus">{tString('dashboard.sessions.create_button')}</Button>
            </Box>
          }
        />
      </Container>

      <ColumnLayout columns={2}>
        {/* Quick Actions */}
        <Container
          header={
            <Header variant="h2">{tString('dashboard.sections.quick_actions')}</Header>
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
                    {tString('dashboard.quick_actions.go')}
                  </Button>
                </SpaceBetween>
              </Box>
            ))}
          </Grid>
        </Container>
        
        {/* 차트 추가 */}
        <Container
          header={
            <Header variant="h2">{tString('dashboard.charts.course_completion')}</Header>
          }
        >
          <BarChart
            series={[
              {
                title: tString('dashboard.charts.course_completion'),
                type: "bar",
                data: courseProgressData[0].data
              }
            ]}
            i18nStrings={barChartI18nStrings}
            ariaLabel={tString('dashboard.charts.course_completion')}
            height={300}
            xScaleType="categorical"
            yDomain={[0, 100]}
            hideFilter
          />
        </Container>
      </ColumnLayout>

      {/* 학생 참여 파이 차트 */}
      <Container
        header={
          <Header variant="h2">{tString('dashboard.charts.participation.active')}</Header>
        }
      >
        <PieChart
          data={studentParticipationData}
          detailPopoverContent={(datum, sum) => [
            { key: tString('dashboard.charts.details_value'), value: datum.value },
            { 
              key: tString('dashboard.charts.details_percentage'), 
              value: `\${((datum.value / sum) * 100).toFixed(0)}%` 
            }
          ]}
          segmentDescription={(datum, sum) => 
            `\${datum.title}: \${datum.value} (\${((datum.value / sum) * 100).toFixed(0)}%)`
          }
          i18nStrings={pieChartI18nStrings}
          size="large"
          hideFilter
        />
      </Container>
    </SpaceBetween>
  );
};

export default Dashboard;