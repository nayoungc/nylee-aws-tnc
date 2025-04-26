// src/pages/public/components/CourseCalendar.tsx
import React, { useState } from 'react';
import {
  Box,
  Calendar,
  Container,
  Header,
  SpaceBetween,
  Table,
  Button,
  Badge,
  Modal,
  ColumnLayout,
  Link,
  Popover,
  StatusIndicator,
  Cards,
  Grid,
  Tabs
} from '@cloudscape-design/components';
import { useTranslation } from 'react-i18next';

// 목업 이벤트 데이터
const courseEvents = [
  {
    id: '1',
    title: 'AWS Solutions Architect Associate 자격증 준비 과정',
    date: '2023-11-15',
    endDate: '2023-11-17',
    time: '09:00-17:00',
    location: '서울 교육 센터',
    instructor: '김민수',
    type: 'certification',
    seats: { total: 20, available: 7 },
    description: 'AWS Solutions Architect Associate 자격증을 위한 집중 교육 과정입니다. 3일간의 심층 교육으로 자격증 시험에 필요한 모든 핵심 영역을 다룹니다.',
    prerequisites: ['기본적인 클라우드 개념 이해', 'AWS 콘솔 기본 사용 경험'],
    status: 'upcoming'
  },
  {
    id: '2',
    title: 'AWS CloudFormation 마스터 워크숍',
    date: '2023-11-19',
    endDate: '2023-11-19',
    time: '10:00-16:00',
    location: '온라인 웨비나',
    instructor: '박지영',
    type: 'workshop',
    seats: { total: 50, available: 23 },
    description: 'AWS CloudFormation을 활용한 인프라 자동화 워크숍입니다. 실습 위주로 진행되며 CloudFormation 템플릿 작성 및 배포를 실습합니다.',
    prerequisites: ['AWS 계정', 'AWS CLI 설치'],
    status: 'upcoming'
  },
  {
    id: '3',
    title: 'AWS Lambda와 Serverless 아키텍처',
    date: '2023-11-22',
    endDate: '2023-11-23',
    time: '09:30-17:30',
    location: '부산 AWS 교육장',
    instructor: '이서준',
    type: 'technical',
    seats: { total: 30, available: 0 },
    description: 'AWS Lambda를 이용한 서버리스 애플리케이션 개발에 대해 알아봅니다. API Gateway, DynamoDB와 연계한 실제 애플리케이션 구현을 실습합니다.',
    prerequisites: ['Node.js 기초 지식', 'AWS 계정'],
    status: 'full'
  },
  {
    id: '4',
    title: 'AWS 비용 최적화 전략 세미나',
    date: '2023-11-24',
    endDate: '2023-11-24',
    time: '14:00-17:00',
    location: '온라인 웨비나',
    instructor: '최준호',
    type: 'business',
    seats: { total: 100, available: 68 },
    description: 'AWS 환경에서의 비용 최적화 전략과 모범 사례를 소개합니다. 실제 사례 연구와 비용 절감을 위한 구체적인 방법을 알아봅니다.',
    prerequisites: ['기본적인 AWS 비용 구조 이해'],
    status: 'upcoming'
  },
  {
    id: '5',
    title: 'AWS Security Specialty 시험 준비 부트캠프',
    date: '2023-12-01',
    endDate: '2023-12-03',
    time: '09:00-18:00',
    location: '서울 교육 센터',
    instructor: '정현우',
    type: 'certification',
    seats: { total: 15, available: 3 },
    description: '3일간의 집중 교육으로 AWS Security Specialty 자격증 시험을 준비합니다. AWS 보안 서비스와 모범 사례를 심층적으로 다룹니다.',
    prerequisites: ['AWS 기본 지식', 'AWS Associate 수준의 이해도'],
    status: 'almost-full'
  },
  {
    id: '6',
    title: 'AWS EKS와 Kubernetes 워크샵',
    date: '2023-12-07',
    endDate: '2023-12-08',
    time: '09:30-17:30',
    location: '대전 교육 센터',
    instructor: '한지민',
    type: 'workshop',
    seats: { total: 25, available: 12 },
    description: 'Amazon EKS에서의 Kubernetes 구성, 관리 및 배포 전략을 배웁니다. 실습 위주의 워크샵입니다.',
    prerequisites: ['Docker 기본 지식', 'Kubernetes 기본 개념 이해'],
    status: 'upcoming'
  }
];

// 이벤트 상태에 따른 뱃지 스타일
const getStatusBadge = (status: string, t: any) => {
  switch (status) {
    case 'full':
      return <Badge color="red">{t('calendar.status.full')}</Badge>;
    case 'almost-full':
      return <Badge color="grey">{t('calendar.status.almostFull')}</Badge>;
    case 'upcoming':
      return <Badge color="green">{t('calendar.status.upcoming')}</Badge>;
    default:
      return <Badge color="blue">{status}</Badge>;
  }
};

// 이벤트 유형에 따른 뱃지 스타일
const getTypeBadge = (type: string, t: any) => {
  switch (type) {
    case 'certification':
      return <Badge color="blue">{t('calendar.type.certification')}</Badge>;
    case 'workshop':
      return <Badge color="green">{t('calendar.type.workshop')}</Badge>;
    case 'technical':
      return <Badge color="grey">{t('calendar.type.technical')}</Badge>;
    case 'business':
      return <Badge color="grey">{t('calendar.type.business')}</Badge>;
    default:
      return <Badge>{type}</Badge>;
  }
};

const CourseCalendar: React.FC = () => {
  const { t } = useTranslation(['calendar', 'common']);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [calendarView, setCalendarView] = useState('simple'); // simple 또는 side-by-side

  // 캘린더 날짜에 이벤트 표시를 위한 함수
  const isDateWithEvent = (date: string) => {
    return courseEvents.some(event => {
      // 시작일과 종료일 사이의 모든 날짜를 확인
      const startDate = new Date(event.date);
      const endDate = new Date(event.endDate);
      const checkDate = new Date(date);

      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  // 특정 날짜의 이벤트 목록 가져오기
  const getEventsForDate = (date: string) => {
    return courseEvents.filter(event => {
      const startDate = new Date(event.date);
      const endDate = new Date(event.endDate);
      const checkDate = new Date(date);

      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  // 날짜 선택 핸들러
  const handleSelectDate = (value: string) => {
    setSelectedDate(value);
    const events = getEventsForDate(value);
    if (events.length > 0) {
      // 날짜를 선택하면 해당 날짜의 이벤트 목록을 표시
      setSelectedCourse(null); // 단일 코스 선택 초기화
      setShowDetailsModal(true);
    }
  };

  // 코스 상세 보기 핸들러
  const handleCourseSelect = (course: any) => {
    setSelectedCourse(course);
  };

  const courseTableColumnDefinitions = [
    {
      id: 'title',
      header: t('calendar.table.title'),
      cell: (item: any) => (
        <Link onFollow={() => handleCourseSelect(item)}>
          {item.title}
        </Link>
      ),
      sortingField: 'title',
      width: 300
    },
    {
      id: 'time',
      header: t('calendar.table.time'),
      cell: (item: any) => item.time,
      sortingField: 'time',
      width: 120
    },
    {
      id: 'location',
      header: t('calendar.table.location'),
      cell: (item: any) => item.location,
      sortingField: 'location',
      width: 150
    },
    {
      id: 'type',
      header: t('calendar.table.type'),
      cell: (item: any) => getTypeBadge(item.type, t),
      sortingField: 'type',
      width: 120
    },
    {
      id: 'status',
      header: t('calendar.table.status'),
      cell: (item: any) => getStatusBadge(item.status, t),
      sortingField: 'status',
      width: 100
    },
    {
      id: 'seats',
      header: t('calendar.table.seats'),
      cell: (item: any) => `\${item.seats.available}/\${item.seats.total}`,
      sortingField: 'seats',
      width: 80
    }
  ];

  // 현재 월의 이벤트 가져오기
  const getCurrentMonthEvents = () => {
    const currentMonth = selectedDate 
      ? new Date(selectedDate).getMonth() 
      : new Date().getMonth();
    
    return courseEvents.filter(event => 
      new Date(event.date).getMonth() === currentMonth
    );
  };

  // 간단한 캘린더 뷰
  const renderSimpleCalendarView = () => (
    <Box padding="s">
      <Calendar
        value={selectedDate || ''} 
        onChange={({ detail }) => handleSelectDate(detail.value)}
        startOfWeek={1}
        i18nStrings={{
          todayAriaLabel: t('calendar.aria.today'),
          nextMonthAriaLabel: t('calendar.aria.nextMonth'),
          previousMonthAriaLabel: t('calendar.aria.prevMonth')
        }}
      />
      {/* 캘린더 아래에 이벤트 목록을 표시 */}
      <Box padding={{ top: 'm' }}>
        <Header variant="h3">{t('calendar.currentMonthEvents')}</Header>
        <SpaceBetween size="s">
          {getCurrentMonthEvents()
            .slice(0, 5)
            .map(event => (
              <Box key={event.id} padding="s" variant="awsui-key-label">
                <Link fontSize="body-m" onFollow={() => handleCourseSelect(event)}>
                  <strong>{new Date(event.date).toLocaleDateString()}</strong> - {event.title}
                </Link>
                <Box fontSize="body-s" color="text-body-secondary">
                  {event.time} · {event.location}
                </Box>
                <Box fontSize="body-s">
                  {getTypeBadge(event.type, t)}{' '}
                  {getStatusBadge(event.status, t)}
                </Box>
              </Box>
            ))}
          {getCurrentMonthEvents().length > 5 && (
            <Link fontSize="body-s" variant="secondary">
              {t('calendar.viewMoreEvents', { count: getCurrentMonthEvents().length - 5 })}
            </Link>
          )}
          {getCurrentMonthEvents().length === 0 && (
            <Box color="text-body-secondary" padding="s" textAlign="center">
              {t('calendar.noEventsThisMonth')}
            </Box>
          )}
        </SpaceBetween>
      </Box>
    </Box>
  );

  // 사이드 바이 사이드 캘린더 뷰
  const renderSideBySideCalendarView = () => (
    <ColumnLayout columns={2}>
      {/* 왼쪽: 간소화된 캘린더 */}
      <Box padding="s">
        <Calendar
          value={selectedDate || ''} 
          onChange={({ detail }) => handleSelectDate(detail.value)}
          startOfWeek={1}
          i18nStrings={{
            todayAriaLabel: t('calendar.aria.today'),
            nextMonthAriaLabel: t('calendar.aria.nextMonth'),
            previousMonthAriaLabel: t('calendar.aria.prevMonth')
          }}
        />
      </Box>
      
      {/* 오른쪽: 이번 달 일정 목록 */}
      <Box>
        <Header variant="h3">{t('calendar.currentMonthEvents')}</Header>
        <SpaceBetween size="s">
          {getCurrentMonthEvents().length > 0 ? (
            getCurrentMonthEvents().map(event => (
              <Box key={event.id} padding="s" variant="awsui-key-label">
                <Link fontSize="body-m" onFollow={() => handleCourseSelect(event)}>
                  <strong>{new Date(event.date).toLocaleDateString()}</strong> - {event.title}
                </Link>
                <Box fontSize="body-s" color="text-body-secondary">
                  {event.time} · {event.location}
                </Box>
                <Box fontSize="body-s">
                  {getTypeBadge(event.type, t)}{' '}
                  {getStatusBadge(event.status, t)}
                </Box>
              </Box>
            ))
          ) : (
            <Box color="text-body-secondary" padding="s" textAlign="center">
              {t('calendar.noEventsThisMonth')}
            </Box>
          )}
        </SpaceBetween>
      </Box>
    </ColumnLayout>
  );

  return (
    <SpaceBetween size="l">
      {/* 캘린더 컴포넌트 */}
      <Container
        header={
          <Header
            variant="h3"
            description={t('calendar.description')}
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button 
                  onClick={() => setCalendarView('simple')} 
                  variant={calendarView === 'simple' ? 'primary' : 'normal'}
                >
                  {t('calendar.views.simple')}
                </Button>
                <Button 
                  onClick={() => setCalendarView('side-by-side')} 
                  variant={calendarView === 'side-by-side' ? 'primary' : 'normal'}
                >
                  {t('calendar.views.sideBySide')}
                </Button>
              </SpaceBetween>
            }
          >
            {t('calendar.title')}
          </Header>
        }
      >
        {calendarView === 'simple' 
          ? renderSimpleCalendarView() 
          : renderSideBySideCalendarView()
        }
      </Container>

      {/* 다가오는 이벤트 섹션 */}
      <Container
        header={
          <Header
            variant="h3"
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button iconName="filter">{t('calendar.actions.filter')}</Button>
                <Button iconName="add-plus">{t('calendar.actions.addCourse')}</Button>
                <Button variant="primary">{t('calendar.actions.viewAll')}</Button>
              </SpaceBetween>
            }
          >
            {t('calendar.upcomingCourses')}
          </Header>
        }
      >
        <Cards
          cardDefinition={{
            header: item => (
              <Box padding={{ bottom: 'xs' }}>
                <Link fontSize="heading-s" onFollow={() => handleCourseSelect(item)}>
                  {item.title}
                </Link>
              </Box>
            ),
            sections: [
              {
                id: 'info',
                content: item => (
                  <SpaceBetween size="s">
                    <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
                      <Box>
                        <Box variant="small" color="text-body-secondary">{t('calendar.courseInfo.date')}</Box>
                        <Box variant="p">{new Date(item.date).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}</Box>
                      </Box>
                      <Box>
                        <Box variant="small" color="text-body-secondary">{t('calendar.courseInfo.time')}</Box>
                        <Box variant="p">{item.time}</Box>
                      </Box>
                    </Grid>
                    <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
                      <Box>
                        <Box variant="small" color="text-body-secondary">{t('calendar.courseInfo.location')}</Box>
                        <Box variant="p">{item.location}</Box>
                      </Box>
                      <Box>
                        <Box variant="small" color="text-body-secondary">{t('calendar.courseInfo.instructor')}</Box>
                        <Box variant="p">{item.instructor}</Box>
                      </Box>
                    </Grid>
                    <Box>
                      <Box variant="small" color="text-body-secondary">{t('calendar.courseInfo.typeStatus')}</Box>
                      <SpaceBetween direction="horizontal" size="xs">
                        {getTypeBadge(item.type, t)}
                        {getStatusBadge(item.status, t)}
                        <Box variant="small">
                          {t('calendar.courseInfo.availableSeats', {
                            available: item.seats.available,
                            total: item.seats.total
                          })}
                        </Box>
                      </SpaceBetween>
                    </Box>
                  </SpaceBetween>
                )
              },
              {
                id: 'actions',
                content: item => (
                  <Box float="right">
                    <SpaceBetween direction="horizontal" size="xs">
                      <Button
                        iconName="folder-open"
                        onClick={() => handleCourseSelect(item)}
                      >
                        {t('calendar.actions.details')}
                      </Button>
                      <Button
                        variant="primary"
                        disabled={item.status === 'full'}
                      >
                        {item.status === 'full' ? 
                          t('calendar.actions.closed') : 
                          t('calendar.actions.register')}
                      </Button>
                    </SpaceBetween>
                  </Box>
                )
              }
            ]
          }}
          cardsPerRow={[
            { cards: 1 },
            { minWidth: 500, cards: 1 },
            { minWidth: 992, cards: 2 }
          ]}
          items={courseEvents.filter(event => new Date(event.date) >= new Date())}
          loadingText={t('common:loading')}
          empty={
            <Box textAlign="center" color="text-body-secondary">
              <Box
                padding={{ bottom: 's' }}
                variant="h4"
              >
                {t('calendar.noCourses')}
              </Box>
              <Box variant="p">
                {t('calendar.coursesWillAppear')}
              </Box>
            </Box>
          }
        />
      </Container>

      {/* 날짜 선택 모달 */}
      <Modal
        visible={showDetailsModal && !selectedCourse}
        onDismiss={() => setShowDetailsModal(false)}
        size="large"
        header={
          selectedDate ? 
            t('calendar.modal.dateTitle', { date: new Date(selectedDate).toLocaleDateString() }) :
            t('calendar.modal.defaultTitle')
        }
      >
        <SpaceBetween size="l">
          {selectedDate && (
            <Table
              columnDefinitions={courseTableColumnDefinitions}
              items={getEventsForDate(selectedDate)}
              loadingText={t('common:loading')}
              empty={
                <Box textAlign="center" color="text-body-secondary">
                  <Box padding="s">{t('calendar.modal.noCoursesOnDate')}</Box>
                </Box>
              }
              header={
                <Header
                  counter={`(\${getEventsForDate(selectedDate).length})`}
                >
                  {t('calendar.modal.courseList')}
                </Header>
              }
            />
          )}
          <Box float="right">
            <Button variant="primary" onClick={() => setShowDetailsModal(false)}>
              {t('common:close')}
            </Button>
          </Box>
        </SpaceBetween>
      </Modal>

      {/* 코스 상세 모달 */}
      <Modal
        visible={!!selectedCourse}
        onDismiss={() => setSelectedCourse(null)}
        size="large"
        header={selectedCourse?.title || t('calendar.modal.courseDetails')}
      >
        {selectedCourse && (
          <SpaceBetween size="l">
            <Container>
              <ColumnLayout columns={2} variant="text-grid">
                <SpaceBetween size="m">
                  <div>
                    <Box variant="h5">{t('calendar.courseInfo.date')}</Box>
                    <Box>{new Date(selectedCourse.date).toLocaleDateString()} - {new Date(selectedCourse.endDate).toLocaleDateString()}</Box>
                  </div>
                  <div>
                    <Box variant="h5">{t('calendar.courseInfo.time')}</Box>
                    <Box>{selectedCourse.time}</Box>
                  </div>
                  <div>
                    <Box variant="h5">{t('calendar.courseInfo.location')}</Box>
                    <Box>{selectedCourse.location}</Box>
                  </div>
                </SpaceBetween>

                <SpaceBetween size="m">
                  <div>
                    <Box variant="h5">{t('calendar.courseInfo.instructor')}</Box>
                    <Box>{selectedCourse.instructor}</Box>
                  </div>
                  <div>
                    <Box variant="h5">{t('calendar.courseInfo.type')}</Box>
                    <Box>{getTypeBadge(selectedCourse.type, t)}</Box>
                  </div>
                  <div>
                    <Box variant="h5">{t('calendar.courseInfo.seats')}</Box>
                    <Box>
                      {t('calendar.courseInfo.availableSeats', {
                        available: selectedCourse.seats.available,
                        total: selectedCourse.seats.total
                      })} {getStatusBadge(selectedCourse.status, t)}
                    </Box>
                  </div>
                </SpaceBetween>
              </ColumnLayout>
            </Container>

            <Container header={<Header variant="h3">{t('calendar.courseInfo.description')}</Header>}>
              <Box>{selectedCourse.description}</Box>
            </Container>

            <Container header={<Header variant="h3">{t('calendar.courseInfo.prerequisites')}</Header>}>
              <Box>
                <ul>
                  {selectedCourse.prerequisites.map((prereq: string, index: number) => (
                    <li key={index}>{prereq}</li>
                  ))}
                </ul>
              </Box>
            </Container>

            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={() => setSelectedCourse(null)}>{t('common:close')}</Button>
                <Button
                  variant="primary"
                  disabled={selectedCourse.status === 'full'}
                >
                  {selectedCourse.status === 'full' ? 
                    t('calendar.actions.closed') : 
                    t('calendar.actions.register')}
                </Button>
              </SpaceBetween>
            </Box>
          </SpaceBetween>
        )}
      </Modal>
    </SpaceBetween>
  );
};