// src/pages/public/components/CourseCalendar.tsx
import React, { useState } from 'react';
import { 
  Calendar, 
  Box, 
  Modal, 
  SpaceBetween,
  Table,
  Header,
  Button
} from '@cloudscape-design/components';
import { useTranslation } from 'react-i18next';
import { events } from '../../../models/events';

const CourseCalendar: React.FC = () => {
  const { t } = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');


  // 선택된 날짜의 이벤트 필터링
  const selectedDateEvents = selectedDate 
    ? events.filter(event => {
        const eventDate = new Date(event.date);
        const selected = new Date(selectedDate);
        return eventDate.toDateString() === selected.toDateString();
      })
    : [];

  // 캘린더에 표시할 날짜 이벤트 정보
  const calendarEvents = events.reduce((acc, event) => {
    const dateKey = new Date(event.date).toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = { events: [] };
    }
    acc[dateKey].events.push(event);
    return acc;
  }, {} as Record<string, { events: typeof events }>);

  return (
    <SpaceBetween size="l">
      <Calendar 
        value={selectedDate} // 이제 항상 string 타입
        onChange={({ detail }) => {
          setSelectedDate(detail.value);
          setIsModalVisible(true);
        }}
        locale="ko-KR"
        startOfWeek={1} // 월요일부터 시작
        isDateEnabled={date => {
          // 주말은 비활성화 (옵션)
          // const day = new Date(date).getDay();
          // return day !== 0 && day !== 6;
          return true;
        }}
      />
      
      <Modal
        visible={isModalVisible}
        onDismiss={() => setIsModalVisible(false)}
        header={selectedDate ? new Date(selectedDate).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long'
        }) : ''}
        size="large"
      >
        {selectedDateEvents.length > 0 ? (
          <Table
            columnDefinitions={[
              {
                id: "time",
                header: t('tnc.calendar.time'),
                cell: item => new Date(item.date).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })
              },
              {
                id: "type",
                header: t('tnc.calendar.type'),
                cell: item => item.type === 'lecture' 
                  ? t('tnc.calendar.lecture') 
                  : t('tnc.calendar.session')
              },
              {
                id: "title",
                header: t('tnc.calendar.title'),
                cell: item => item.title
              },
              {
                id: "description",
                header: t('tnc.calendar.description'),
                cell: item => item.description
              },
              {
                id: "location",
                header: t('tnc.calendar.location'),
                cell: item => item.location
              }
            ]}
            items={selectedDateEvents}
            loadingText={t('common.loading')}
            empty={
              <Box textAlign="center" color="inherit">
                <b>{t('tnc.calendar.noEvents')}</b>
              </Box>
            }
            header={
              <Header>
                {t('tnc.calendar.dailySchedule')}
              </Header>
            }
          />
        ) : (
          <Box textAlign="center">
            <b>{t('tnc.calendar.noEvents')}</b>
          </Box>
        )}
        
        <Box textAlign="right" margin={{ top: "l" }}>
          <Button variant="primary" onClick={() => setIsModalVisible(false)}>
            {t('common.close')}
          </Button>
        </Box>
      </Modal>
    </SpaceBetween>
  );
};

export default CourseCalendar;