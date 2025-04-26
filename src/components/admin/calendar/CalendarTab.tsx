// src/components/admin/calendar/CalendarTab.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Calendar,
  Container,
  DatePicker,
  FormField,
  Header,
  Input,
  Modal,
  Select,
  SelectProps,
  SpaceBetween,
  Table,
  TextContent,
  ColumnLayout,
  Badge
} from '@cloudscape-design/components';
import { useTranslation } from 'react-i18next';

// 캘린더 이벤트 타입 정의
interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'course' | 'holiday' | 'meeting' | 'other';
  status: 'scheduled' | 'canceled' | 'completed';
}

// 목업 데이터
const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'AWS Cloud Practitioner 교육',
    description: '클라우드 기초 및 AWS 서비스 소개',
    date: '2023-07-15',
    type: 'course',
    status: 'scheduled'
  },
  {
    id: '2',
    title: '강사 회의',
    description: '분기별 강사 회의',
    date: '2023-07-22',
    type: 'meeting',
    status: 'scheduled'
  },
  {
    id: '3',
    title: '광복절',
    description: '공휴일',
    date: '2023-08-15',
    type: 'holiday',
    status: 'scheduled'
  },
  {
    id: '4',
    title: 'AWS Solutions Architect Associate 워크샵',
    description: 'AWS 아키텍처 설계 실습',
    date: '2023-08-20',
    type: 'course',
    status: 'scheduled'
  }
];

// 이벤트 타입에 따른 뱃지 스타일
const getEventTypeBadge = (type: string, t: any) => {
  switch (type) {
    case 'course':
      return <Badge color="blue">{t('admin:calendar.eventTypes.course')}</Badge>;
    case 'holiday':
      return <Badge color="red">{t('admin:calendar.eventTypes.holiday')}</Badge>;
    case 'meeting':
      return <Badge color="green">{t('admin:calendar.eventTypes.meeting')}</Badge>;
    default:
      return <Badge color="grey">{t('admin:calendar.eventTypes.other')}</Badge>;
  }
};

// 이벤트 상태에 따른 뱃지 스타일
const getEventStatusBadge = (status: string, t: any) => {
  switch (status) {
    case 'scheduled':
      return <Badge color="blue">{t('admin:calendar.eventStatus.scheduled')}</Badge>;
    case 'canceled':
      return <Badge color="red">{t('admin:calendar.eventStatus.canceled')}</Badge>;
    case 'completed':
      return <Badge color="green">{t('admin:calendar.eventStatus.completed')}</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

const CalendarTab: React.FC = () => {
  const { t } = useTranslation(['admin', 'common']);
  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_EVENTS);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // 새 이벤트를 위한 폼 상태
  const [formData, setFormData] = useState<Omit<CalendarEvent, 'id'>>({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'course',
    status: 'scheduled'
  });

  // 특정 날짜의 이벤트 목록 가져오기
  const getEventsForDate = (date: string): CalendarEvent[] => {
    return events.filter(event => event.date === date);
  };

  // 선택된 날짜의 이벤트 목록 갱신
  useEffect(() => {
    if (selectedDate) {
      const filteredEvents = getEventsForDate(selectedDate);
      setSelectedEvents(filteredEvents);
    } else {
      setSelectedEvents([]);
    }
  }, [selectedDate, events]);

  // 날짜 선택 핸들러
  const handleSelectDate = (value: string) => {
    setSelectedDate(value);
  };

  // 이벤트 생성 핸들러
  const handleCreateEvent = () => {
    const newEvent: CalendarEvent = {
      ...formData,
      id: Date.now().toString()
    };

    setEvents([...events, newEvent]);
    setShowAddModal(false);

    // 선택된 날짜와 새 이벤트의 날짜가 일치하면 목록 업데이트
    if (selectedDate === newEvent.date) {
      setSelectedEvents([...selectedEvents, newEvent]);
    }

    // 폼 리셋
    setFormData({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      type: 'course',
      status: 'scheduled'
    });
  };

  // 이벤트 삭제 핸들러
  const handleDeleteEvent = () => {
    if (!selectedEvent) return;

    const updatedEvents = events.filter(event => event.id !== selectedEvent.id);
    setEvents(updatedEvents);

    // 선택된 이벤트 목록에서도 제거
    if (selectedDate) {
      const updatedSelectedEvents = selectedEvents.filter(event => event.id !== selectedEvent.id);
      setSelectedEvents(updatedSelectedEvents);
    }

    setShowDeleteModal(false);
    setSelectedEvent(null);
  };

  // 현재 월의 이벤트 목록
  const getCurrentMonthEvents = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
    });
  };

  // 이벤트 삭제 모달 열기
  const handleOpenDeleteModal = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowDeleteModal(true);
  };

  return (
    <SpaceBetween size="l">
      <Header
        variant="h1"
        description={t('admin:calendar.description', '교육 및 중요 일정을 관리합니다')}
        actions={
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
          >
            {t('admin:calendar.addEvent')}
          </Button>
        }
      >
        {t('admin:calendar.title', '캘린더 관리')}
      </Header>

      <ColumnLayout columns={2}>
        {/* 왼쪽: 캘린더 */}
        <Container>
          <Box padding="s">
            <Calendar
              value={selectedDate || ''}
              onChange={({ detail }) => handleSelectDate(detail.value)}
              startOfWeek={1}
              todayAriaLabel={t('admin:calendar.today')}
              nextMonthAriaLabel={t('admin:calendar.nextMonth')}
              previousMonthAriaLabel={t('admin:calendar.previousMonth')}
            />

            {/* 캘린더 아래 범례 */}
            <Box padding={{ top: 'm' }} textAlign="center">
              <SpaceBetween direction="horizontal" size="xs">
                <Badge color="blue">{t('admin:calendar.eventTypes.course')}</Badge>
                <Badge color="red">{t('admin:calendar.eventTypes.holiday')}</Badge>
                <Badge color="green">{t('admin:calendar.eventTypes.meeting')}</Badge>
                <Badge color="grey">{t('admin:calendar.eventTypes.other')}</Badge>
              </SpaceBetween>
            </Box>
          </Box>
        </Container>

        {/* 오른쪽: 이번 달 일정 */}
        <Container
          header={
            <Header variant="h3">
              {t('admin:calendar.currentMonthEvents')}
            </Header>
          }
        >
          {getCurrentMonthEvents().length > 0 ? (
            <SpaceBetween size="xs">
              {getCurrentMonthEvents().map(event => (
                <Box key={event.id} padding="s" variant="awsui-key-label">
                  <Box fontSize="body-m">
                    <strong>{new Date(event.date).toLocaleDateString()}</strong> - {event.title}
                  </Box>
                  <Box fontSize="body-s" color="text-body-secondary">
                    {event.description}
                  </Box>
                  <Box fontSize="body-s">
                    {getEventTypeBadge(event.type, t)}{' '}
                    {getEventStatusBadge(event.status, t)}
                  </Box>
                  <Box textAlign="right">
                    <Button
                      variant="link"
                      onClick={() => handleOpenDeleteModal(event)}
                    >
                      {t('common:delete')}
                    </Button>
                  </Box>
                </Box>
              ))}
            </SpaceBetween>
          ) : (
            <Box color="text-body-secondary" padding="s" textAlign="center">
              {t('admin:calendar.noEventsThisMonth')}
            </Box>
          )}
        </Container>
      </ColumnLayout>

      {/* 선택된 날짜의 이벤트 목록 */}
      {selectedDate && (
        <Container
          header={
            <Header variant="h3">
              {t('admin:calendar.eventsForDate', { date: selectedDate })}
            </Header>
          }
        >
          {selectedEvents.length > 0 ? (
            <Table
              items={selectedEvents}
              columnDefinitions={[
                {
                  id: 'title',
                  header: t('admin:calendar.columns.title'),
                  cell: (item: CalendarEvent) => item.title,
                  sortingField: 'title'
                },
                {
                  id: 'description',
                  header: t('admin:calendar.columns.description'),
                  cell: (item: CalendarEvent) => item.description
                },
                {
                  id: 'type',
                  header: t('admin:calendar.columns.type'),
                  cell: (item: CalendarEvent) => getEventTypeBadge(item.type, t)
                },
                {
                  id: 'status',
                  header: t('admin:calendar.columns.status'),
                  cell: (item: CalendarEvent) => getEventStatusBadge(item.status, t)
                },
                {
                  id: 'actions',
                  header: t('common:actions'),
                  cell: (item: CalendarEvent) => (
                    <Button
                      variant="link"
                      onClick={() => handleOpenDeleteModal(item)}
                    >
                      {t('common:delete')}
                    </Button>
                  )
                }
              ]}
              empty={
                <Box textAlign="center" color="inherit">
                  <b>{t('admin:calendar.noEvents')}</b>
                  <Box padding={{ bottom: "s" }} variant="p" color="inherit">
                    {t('admin:calendar.noEventsInstructions')}
                  </Box>
                  <Button onClick={() => setShowAddModal(true)}>
                    {t('admin:calendar.addEvent')}
                  </Button>
                </Box>
              }
              sortingDisabled
            />
          ) : (
            <Box textAlign="center" padding="l">
              <TextContent>
                <h3>{t('admin:calendar.noEvents')}</h3>
                <p>{t('admin:calendar.noEventsInstructions')}</p>
                <Button onClick={() => setShowAddModal(true)}>
                  {t('admin:calendar.addEvent')}
                </Button>
              </TextContent>
            </Box>
          )}
        </Container>
      )}

      {/* 이벤트 추가 모달 */}
      <Modal
        visible={showAddModal}
        onDismiss={() => setShowAddModal(false)}
        header={t('admin:calendar.modals.addEvent.title')}
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button onClick={() => setShowAddModal(false)}>{t('common:cancel')}</Button>
              <Button
                variant="primary"
                onClick={handleCreateEvent}
                disabled={!formData.title}
              >
                {t('admin:calendar.modals.addEvent.submit')}
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="m">
          <FormField
            label={t('admin:calendar.fields.title')}
          >
            <Input
              value={formData.title}
              onChange={({ detail }) =>
                setFormData(prev => ({ ...prev, title: detail.value }))
              }
            />
          </FormField>

          <FormField
            label={t('admin:calendar.fields.description')}
          >
            <Input
              value={formData.description}
              onChange={({ detail }) =>
                setFormData(prev => ({ ...prev, description: detail.value }))
              }
            />
          </FormField>

          <FormField
            label={t('admin:calendar.fields.date')}
          >
            <FormField
              label={t('admin:calendar.fields.date')}
            >
              <DatePicker
                value={formData.date}
                onChange={({ detail }) =>
                  setFormData(prev => ({ ...prev, date: detail.value }))
                }
                openCalendarAriaLabel={(selectedDate) =>
                  t('admin:calendar.openDatePicker', { selectedDate: selectedDate || '' })
                }
                placeholder="YYYY/MM/DD"
                i18nStrings={{
                  todayAriaLabel: t('admin:calendar.today'),
                  nextMonthAriaLabel: t('admin:calendar.nextMonth'),
                  previousMonthAriaLabel: t('admin:calendar.previousMonth')
                }}
              />
            </FormField>
          </FormField>

          <FormField
            label={t('admin:calendar.fields.type')}
          >
            <Select
              selectedOption={{
                value: formData.type,
                label: t(`admin:calendar.eventTypes.\${formData.type}`)
              }}
              onChange={({ detail }) => {
                const value = detail.selectedOption.value as 'course' | 'holiday' | 'meeting' | 'other';
                setFormData(prev => ({ ...prev, type: value }));
              }}
              options={[
                { value: 'course', label: t('admin:calendar.eventTypes.course') },
                { value: 'holiday', label: t('admin:calendar.eventTypes.holiday') },
                { value: 'meeting', label: t('admin:calendar.eventTypes.meeting') },
                { value: 'other', label: t('admin:calendar.eventTypes.other') }
              ]}
            />
          </FormField>

          <FormField
            label={t('admin:calendar.fields.status')}
          >
            <Select
              selectedOption={{
                value: formData.status,
                label: t(`admin:calendar.eventStatus.\${formData.status}`)
              }}
              onChange={({ detail }) => {
                const value = detail.selectedOption.value as 'scheduled' | 'canceled' | 'completed';
                setFormData(prev => ({ ...prev, status: value }));
              }}
              options={[
                { value: 'scheduled', label: t('admin:calendar.eventStatus.scheduled') },
                { value: 'canceled', label: t('admin:calendar.eventStatus.canceled') },
                { value: 'completed', label: t('admin:calendar.eventStatus.completed') }
              ]}
            />
          </FormField>
        </SpaceBetween>
      </Modal>

      {/* 이벤트 삭제 확인 모달 */}
      <Modal
        visible={showDeleteModal}
        onDismiss={() => { setShowDeleteModal(false); setSelectedEvent(null); }}
        header={t('admin:calendar.modals.deleteEvent.title')}
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button onClick={() => { setShowDeleteModal(false); setSelectedEvent(null); }}>
                {t('common:cancel')}
              </Button>
              <Button
                variant="primary"
                onClick={handleDeleteEvent}
              >
                {t('common:delete')}
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        {selectedEvent && (
          <p>
            {t('admin:calendar.modals.deleteEvent.confirmationWithTitle', {
              title: selectedEvent.title,
              date: new Date(selectedEvent.date).toLocaleDateString()
            })}
          </p>
        )}
      </Modal>
    </SpaceBetween>
  );
};

export default CalendarTab;