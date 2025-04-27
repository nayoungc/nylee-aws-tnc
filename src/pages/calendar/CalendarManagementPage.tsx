// src/pages/CalendarManagementPage.tsx (전체 파일)
import React, { useState, useEffect } from 'react';
import { useCollection } from '@cloudscape-design/collection-hooks';
import {
  AppLayout,
  BreadcrumbGroup,
  Box,
  Button,
  Calendar,
  Container,
  ContentLayout,
  ColumnLayout,
  Header,
  Pagination,
  SpaceBetween,
  Spinner,
  Table,
  Tabs,
  TextFilter
} from '@cloudscape-design/components';
import { useCalendar } from '@/hooks/useCalendar';
import { CalendarEvent } from '@/models/calendar';
import EventFormModal from '@/components/Calendar/EventFormModal';
import { formatDate, getTodayString, toDateString } from '@/utils/dateUtils';
import { useAppTranslation } from '@/hooks/useAppTranslation';

const CalendarManagementPage: React.FC = () => {
  const { t } = useAppTranslation();
  const [activeTab, setActiveTab] = useState<string>('calendar');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedDateString, setSelectedDateString] = useState<string>(getTodayString());
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // useCalendar 훅 사용
  const { 
    events,
    error,
    getCalendars,
    getEventsByDate,
    createEvent,
    updateEvent,
    deleteEvent
  } = useCalendar();

  // 컴포넌트 마운트 시 이벤트 로드
  useEffect(() => {
    loadEvents();
  }, []);

  // 선택된 날짜에 따라 이벤트 로드
  useEffect(() => {
    if (selectedDateString) {
      loadEventsByDate(selectedDateString);
    }
  }, [selectedDateString]);

  // 이벤트 로드 함수
  const loadEvents = async () => {
    setLoading(true);
    try {
      await getCalendars();
    } catch (err) {
      console.error('이벤트 로드 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  // 날짜별 이벤트 로드
  const loadEventsByDate = async (dateStr: string) => {
    setLoading(true);
    try {
      await getEventsByDate(dateStr);
    } catch (err) {
      console.error('날짜별 이벤트 로드 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  // 이벤트 생성 처리
  const handleCreateEvent = async (eventData: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    try {
      await createEvent(eventData);
      setIsFormOpen(false);
      
      // 생성된 이벤트 날짜와 선택된 날짜가 같으면 해당 날짜의 이벤트 다시 로드
      if (eventData.date === selectedDateString) {
        loadEventsByDate(selectedDateString);
      } else {
        loadEvents();
      }
    } catch (err) {
      console.error('이벤트 생성 오류:', err);
    }
  };

  // 이벤트 수정 처리
  const handleUpdateEvent = async (id: string, eventData: Partial<CalendarEvent>) => {
    try {
      await updateEvent(id, eventData);
      setIsFormOpen(false);
      setEditingEvent(null);
      
      // 수정된 이벤트의 날짜와 선택된 날짜가 같으면 해당 날짜의 이벤트 다시 로드
      if (eventData.date && eventData.date !== selectedDateString) {
        loadEvents();
      } else {
        loadEventsByDate(selectedDateString);
      }
    } catch (err) {
      console.error('이벤트 수정 오류:', err);
    }
  };

  // 이벤트 삭제 처리
  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteEvent(id);
      loadEventsByDate(selectedDateString);
    } catch (err) {
      console.error('이벤트 삭제 오류:', err);
    }
  };

  // 캘린더 뷰에서 날짜별 이벤트 정보
  const calendarEventsMap = events.reduce((acc, event) => {
    const date = event.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  // 현재 선택된 날짜의 이벤트
  const selectedDateEvents = selectedDateString ? (calendarEventsMap[selectedDateString] || []) : [];

  // 목록 뷰를 위한 컬렉션 훅
  const { items, filterProps, paginationProps } = useCollection(events, {
    filtering: {
      empty: <Box textAlign="center" color="inherit">{t('common:messages.no_events')}</Box>,
      noMatch: <Box textAlign="center" color="inherit">{t('common:messages.no_search_results')}</Box>,
    },
    pagination: { pageSize: 10 },
    sorting: {},
  });

  return (
    <AppLayout
      breadcrumbs={
        <BreadcrumbGroup
          items={[
            { text: t('navigation:home'), href: "/" },
            { text: t('navigation:calendar_management'), href: "/calendar" }
          ]}
        />
      }
      content={
        <ContentLayout>
          <SpaceBetween size="l">
            <Container
              header={
                <Header
                  variant="h1"
                  actions={
                    <Button
                      variant="primary"
                      onClick={() => {
                        setEditingEvent(null);
                        setIsFormOpen(true);
                      }}
                    >
                      {t('common:actions.add_new_event')}
                    </Button>
                  }
                >
                  {t('admin:pages.calendar_management')}
                </Header>
              }
            >
              <Tabs
                activeTabId={activeTab}
                onChange={({ detail }) => setActiveTab(detail.activeTabId)}
                tabs={[
                  {
                    id: "calendar",
                    label: t('common:views.calendar_view'),
                    content: loading ? (
                      <Spinner size="large" />
                    ) : (
                      <SpaceBetween size="l">
                        <div style={{ padding: '20px' }}>
                          {/* Calendar 컴포넌트 */}
                          <Calendar
                            value={selectedDateString}
                            onChange={({ detail }) => {
                              setSelectedDateString(detail.value);
                            }}
                            locale="ko-KR"
                            i18nStrings={{
                              todayAriaLabel: t('common:calendar.today'),
                              nextMonthAriaLabel: t('common:calendar.next_month'),
                              previousMonthAriaLabel: t('common:calendar.previous_month'),
                              previousYearAriaLabel: t('common:calendar.previous_year'),
                              nextYearAriaLabel: t('common:calendar.next_year'),
                              currentMonthAriaLabel: t('common:calendar.current_month_long')
                            }}
                          />

                          {/* 이벤트 가이드 */}
                          <Box padding={{ top: 's' }}>
                            <SpaceBetween size="xs">
                              <Box color="text-body-secondary" fontSize="body-s">
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: '#0972d3',
                                    marginRight: '5px'
                                  }} />
                                  {t('common:calendar.dates_with_events')}
                                </div>
                              </Box>
                              <Box color="text-body-secondary" fontSize="body-s">
                                {selectedDateString
                                  ? t('common:messages.events_count_for_date', { 
                                      count: selectedDateEvents.length,
                                      date: formatDate(selectedDateString)
                                    })
                                  : t('common:messages.select_date')
                                }
                              </Box>
                            </SpaceBetween>
                          </Box>
                        </div>
                          
                        {/* 선택된 날짜의 이벤트 목록 */}
                        <Container
                          header={
                            <Header variant="h3">
                              {formatDate(selectedDateString)} {t('common:labels.events')}
                            </Header>
                          }
                        >
                          {selectedDateEvents.length > 0 ? (
                            <SpaceBetween size="m">
                              {selectedDateEvents.map(event => (
                                <Container
                                  key={event.id}
                                  header={
                                    <Header
                                      actions={
                                        <SpaceBetween direction="horizontal" size="xs">
                                          <Button
                                            onClick={() => {
                                              setEditingEvent(event);
                                              setIsFormOpen(true);
                                            }}
                                          >
                                            {t('common:actions.edit')}
                                          </Button>
                                          <Button
                                            variant="danger"
                                            onClick={() => {
                                              if (window.confirm(t('common:messages.confirm_delete'))) {
                                                handleDeleteEvent(event.id);
                                              }
                                            }}
                                          >
                                            {t('common:actions.delete')}
                                          </Button>
                                        </SpaceBetween>
                                      }
                                    >
                                      {event.title}
                                    </Header>
                                  }
                                >
                                  <ColumnLayout columns={2} variant="text-grid">
                                    <div>
                                      <Box variant="awsui-key-label">{t('common:labels.time')}</Box>
                                      <div>{event.startTime} - {event.endTime}</div>
                                    </div>
                                    <div>
                                      <Box variant="awsui-key-label">{t('common:labels.location')}</Box>
                                      <div>{event.location}</div>
                                    </div>
                                    <div>
                                      <Box variant="awsui-key-label">{t('common:labels.instructor')}</Box>
                                      <div>{event.instructorName}</div>
                                    </div>
                                    <div>
                                      <Box variant="awsui-key-label">{t('common:labels.attendees')}</Box>
                                      <div>{event.currentAttendees} / {event.maxAttendees}</div>
                                    </div>
                                    <div>
                                      <Box variant="awsui-key-label">{t('common:labels.event_type')}</Box>
                                      <div>
                                        {event.eventType === 'CLASS' 
                                          ? t('common:event_types.class') 
                                          : t('common:event_types.event')}
                                      </div>
                                    </div>
                                    {event.tags && event.tags.length > 0 && (
                                      <div>
                                        <Box variant="awsui-key-label">{t('common:labels.tags')}</Box>
                                        <div>{event.tags.join(', ')}</div>
                                      </div>
                                    )}
                                  </ColumnLayout>
                                  {event.description && (
                                    <Box padding={{ top: 'm' }}>
                                      <Box variant="awsui-key-label">{t('common:labels.description')}</Box>
                                      <div>{event.description}</div>
                                    </Box>
                                  )}
                                </Container>
                              ))}
                            </SpaceBetween>
                          ) : (
                            <Box
                              textAlign="center"
                              color="inherit"
                              padding="l"
                            >
                              {t('common:messages.no_events_for_date')}
                            </Box>
                          )}
                        </Container>
                      </SpaceBetween>
                    )
                  },
                  {
                    id: "list",
                    label: t('common:views.list_view'),
                    content: (
                      <SpaceBetween size="l">
                        <TextFilter
                          {...filterProps}
                          countText={t('common:messages.event_count', { count: items.length })}
                          filteringAriaLabel={t('common:search.search_events')}
                          filteringPlaceholder={t('common:search.search_events_placeholder')}
                        />
                        
                        {loading ? (
                          <Spinner size="large" />
                        ) : (
                          <>
                            {/* Cards 컴포넌트 대신 Table 컴포넌트 사용 */}
                            <Table
                              items={items}
                              columnDefinitions={[
                                {
                                  id: "date",
                                  header: t('common:labels.date'),
                                  cell: item => formatDate(item.date)
                                },
                                {
                                  id: "title",
                                  header: t('common:labels.title'),
                                  cell: item => item.title
                                },
                                {
                                  id: "time",
                                  header: t('common:labels.time'),
                                  cell: item => `\${item.startTime} - \${item.endTime}`
                                },
                                {
                                  id: "location",
                                  header: t('common:labels.location'),
                                  cell: item => item.location
                                },
                                {
                                  id: "instructor",
                                  header: t('common:labels.instructor'),
                                  cell: item => item.instructorName
                                },
                                {
                                  id: "type",
                                  header: t('common:labels.event_type'),
                                  cell: item => item.eventType === 'CLASS' 
                                    ? t('common:event_types.class') 
                                    : t('common:event_types.event')
                                },
                                {
                                  id: "actions",
                                  header: t('common:labels.actions'),
                                  cell: item => (
                                    <SpaceBetween direction="horizontal" size="xs">
                                      <Button
                                        size="small"
                                        onClick={() => {
                                          setEditingEvent(item);
                                          setIsFormOpen(true);
                                        }}
                                      >
                                        {t('common:actions.edit')}
                                      </Button>
                                      <Button
                                        size="small"
                                        variant="danger"
                                        onClick={() => {
                                          if (window.confirm(t('common:messages.confirm_delete'))) {
                                            handleDeleteEvent(item.id);
                                          }
                                        }}
                                      >
                                        {t('common:actions.delete')}
                                      </Button>
                                    </SpaceBetween>
                                  )
                                }
                              ]}
                              loading={loading}
                              loadingText={t('common:messages.loading_events')}
                              empty={
                                <Box
                                  textAlign="center"
                                  color="inherit"
                                >
                                  <b>{t('common:messages.no_events')}</b>
                                  <Box padding={{ bottom: "s" }}>
                                    {t('common:messages.add_new_event')}
                                  </Box>
                                </Box>
                              }
                              header={
                                <Header
                                  actions={
                                    <Button
                                      onClick={() => loadEvents()}
                                      iconName="refresh"
                                    >
                                      {t('common:actions.refresh')}
                                    </Button>
                                  }
                                >
                                  {t('common:labels.events_list')}
                                </Header>
                              }
                              pagination={<Pagination {...paginationProps} />}
                            />
                          </>
                        )}
                      </SpaceBetween>
                    )
                  }
                ]}
              />
            </Container>
          </SpaceBetween>
        </ContentLayout>
      }
      toolsHide={true}
      navigationHide={true}
      contentType="default"
    />
    
    {isFormOpen && (
      <EventFormModal
        event={editingEvent}
        visible={isFormOpen}
        onDismiss={() => {
          setIsFormOpen(false);
          setEditingEvent(null);
        }}
        onSubmit={(data) => {
          if (editingEvent) {
            handleUpdateEvent(editingEvent.id, data);
          } else {
            handleCreateEvent(data as Omit<CalendarEvent, 'id' | 'createdAt'>);
          }
        }}
      />
    )}
  );
};

export default CalendarManagementPage;