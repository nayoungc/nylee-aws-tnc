// src/pages/public/components/CourseCalendar.tsx
import React, { useState } from 'react';
import { 
  Calendar, 
  Box, 
  SpaceBetween,
  Header,
  Grid,
  Cards,
  Container,
  Badge
} from '@cloudscape-design/components';
import { useTranslation } from 'react-i18next';
import { calendarEvents } from '../../../models/events';

const CourseCalendar: React.FC = () => {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<string>('');

  // 선택된 날짜의 이벤트 필터링
  const selectedDateEvents = selectedDate 
    ? calendarEvents.filter(event => {
        const eventDate = new Date(event.date);
        const selected = new Date(selectedDate);
        return eventDate.toDateString() === selected.toDateString();
      })
    : [];

  // 캘린더에 표시할 날짜 이벤트 정보
  const calendarEventsMap = calendarEvents.reduce((acc, event) => {
    const dateKey = new Date(event.date).toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = { events: [] };
    }
    acc[dateKey].events.push(event);
    return acc;
  }, {} as Record<string, { events: typeof calendarEvents }>);

  return (
    <Grid
      gridDefinition={[
        { colspan: { default: 12, xs: 12, s: 12, m: 5, l: 5, xl: 5 } }, 
        { colspan: { default: 12, xs: 12, s: 12, m: 7, l: 7, xl: 7 } }
      ]}
    >
      <SpaceBetween size="l">
        <Calendar 
          value={selectedDate}
          onChange={({ detail }) => {
            setSelectedDate(detail.value || '');
          }}
          locale="ko-KR"
          startOfWeek={1} // 월요일부터 시작
          isDateEnabled={date => true}
          // 이벤트 표시를 위한 decorators 대신 다른 방법으로 이벤트 표시
        />
        
        {/* 이벤트가 있는 날짜 목록 표시 */}
        <Container>
          <Header>이벤트가 있는 날짜</Header>
          <SpaceBetween size="xs" direction="horizontal">
            {Object.entries(calendarEventsMap).map(([dateStr, data]) => {
              const date = new Date(dateStr);
              const lectureCount = data.events.filter(e => e.type === 'lecture').length;
              const sessionCount = data.events.filter(e => e.type === 'session').length;
              
              return (
                <Badge key={dateStr} color={lectureCount > 0 ? 'blue' : 'green'}>
                  {date.toLocaleDateString('ko-KR', {month: 'short', day: 'numeric'})}
                  {lectureCount > 0 ? ` 🎓 \${lectureCount}` : ``}
                  {sessionCount > 0 ? ` 📅 \${sessionCount}` : ``}
                </Badge>
              );
            })}
          </SpaceBetween>
        </Container>
      </SpaceBetween>

      <Container>
        <SpaceBetween size="l">
          {selectedDate ? (
            <>
              <Header>
                {new Date(selectedDate).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })} 일정
              </Header>
              
              {selectedDateEvents.length > 0 ? (
                <Cards
                  cardDefinition={{
                    header: item => item.title,
                    sections: [
                      {
                        id: "time",
                        header: t('tnc.calendar.time'),
                        content: item => new Date(item.date).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      },
                      {
                        id: "type",
                        header: t('tnc.calendar.type'),
                        content: item => (
                          <Badge color={item.type === 'lecture' ? 'blue' : 'green'}>
                            {item.type === 'lecture' 
                              ? t('tnc.calendar.lecture') 
                              : t('tnc.calendar.session')}
                          </Badge>
                        )
                      },
                      {
                        id: "description",
                        header: t('tnc.calendar.description'),
                        content: item => item.description
                      },
                      {
                        id: "location",
                        header: t('tnc.calendar.location'),
                        content: item => item.location
                      },
                      {
                        id: "instructor",
                        header: t('tnc.calendar.instructor'),
                        content: item => item.instructor || '-'
                      }
                    ]
                  }}
                  items={selectedDateEvents}
                  loadingText={t('common.loading')}
                  empty={
                    <Box textAlign="center" color="inherit">
                      <b>{t('tnc.calendar.noEvents')}</b>
                    </Box>
                  }
                />
              ) : (
                <Box textAlign="center">
                  <b>{t('tnc.calendar.noEvents')}</b>
                </Box>
              )}
            </>
          ) : (
            <Box textAlign="center" padding="l">
              <b>{t('tnc.calendar.selectDate')}</b>
            </Box>
          )}
        </SpaceBetween>
      </Container>
    </Grid>
  );
};

export default CourseCalendar;