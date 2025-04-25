import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTypedTranslation } from '@utils/i18n-utils';

import {
  Container,
  Header,
  SpaceBetween,
  Box,
  Button,
  Grid,
  Alert,
  Spinner,
  Badge,
  Modal,
  ColumnLayout,
  ExpandableSection
} from '@cloudscape-design/components';

// Types
interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  type: 'lecture' | 'workshop' | 'exam' | 'deadline' | 'other';
  instructors?: string[];
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  date: string;
  isImportant: boolean;
}

const CourseHome: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTypedTranslation();

  // State management
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    // Initial loading
    loadCourseData();
  }, []);

  const loadCourseData = async () => {
    try {
      setLoading(true);

      // In a real app, this would be an API call
      setTimeout(() => {
        // Sample events data - this would come from your API
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        setEvents([
          {
            id: '1',
            title: 'AWS 클라우드 기초 강의',
            date: new Date(year, month, 15), // 15th of current month
            startTime: '10:00',
            endTime: '12:00',
            location: '강의실 A102',
            description: 'AWS 클라우드의 기본 개념과 서비스에 대한 소개 강의입니다.',
            type: 'lecture',
            instructors: ['김지훈 강사']
          },
          {
            id: '2',
            title: 'EC2 실습 워크샵',
            date: new Date(year, month, 16), // 16th of current month
            startTime: '14:00',
            endTime: '17:00',
            location: '실습실 B201',
            description: 'EC2 인스턴스 생성 및 관리에 대한 실습 워크샵입니다.',
            type: 'workshop',
            instructors: ['박서연 강사', '이민준 조교']
          },
          {
            id: '3',
            title: '중간 프로젝트 제출 마감',
            date: new Date(year, month, 20), // 20th of current month
            startTime: '23:59',
            endTime: '23:59',
            location: '온라인',
            description: '클라우드 아키텍처 설계 중간 프로젝트 제출 마감일입니다.',
            type: 'deadline'
          },
          {
            id: '4',
            title: 'AWS 보안 강의',
            date: new Date(year, month, 22), // 22nd of current month
            startTime: '13:00',
            endTime: '15:00',
            location: '강의실 A102',
            description: 'AWS 클라우드 환경에서의 보안 설정과 모범 사례에 대한 강의입니다.',
            type: 'lecture',
            instructors: ['최서현 강사']
          },
          {
            id: '5',
            title: '기말고사',
            date: new Date(year, month, 28), // 28th of current month
            startTime: '10:00',
            endTime: '12:00',
            location: '시험장 C301',
            description: 'AWS 클라우드 과정 기말고사입니다.',
            type: 'exam'
          }
        ]);

        // Sample announcements
        setAnnouncements([
          {
            id: '1',
            title: '워크샵 사전 준비 안내',
            message: '16일에 진행되는 EC2 실습 워크샵 참여를 위해 모든 수강생은 개인 노트북을 지참해주세요. AWS 계정은 교육장에서 제공됩니다.',
            type: 'info',
            date: '2023-10-10',
            isImportant: true
          },
          {
            id: '2',
            title: '중간 프로젝트 요구사항 업데이트',
            message: '중간 프로젝트의 요구사항이 업데이트되었습니다. 자세한 내용은 강의 자료실에서 확인해주세요.',
            type: 'warning',
            date: '2023-10-12',
            isImportant: true
          },
          {
            id: '3',
            title: '보충 수업 안내',
            message: '25일(토) 오후 2시부터 4시까지 보충 수업이 진행될 예정입니다. 참석을 원하시는 분들은 사전에 신청해주세요.',
            type: 'success',
            date: '2023-10-14',
            isImportant: false
          },
          {
            id: '4',
            title: '기말고사 범위 안내',
            message: '기말고사는 1주차부터 10주차까지의 모든 내용을 포함합니다. 시험 준비에 참고하시기 바랍니다.',
            type: 'info',
            date: '2023-10-15',
            isImportant: true
          }
        ]);

        setLoading(false);
      }, 1000);

    } catch (err) {
      setError('과정 데이터를 불러오는데 실패했습니다. 나중에 다시 시도해주세요.');
      setLoading(false);
    }
  };

  const openEventDetails = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventModalVisible(true);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    
    // Check if there are events on this date
    const eventsOnSelectedDate = events.filter(
      event => event.date.toDateString() === date.toDateString()
    );
    
    if (eventsOnSelectedDate.length === 1) {
      // If there's only one event, show it directly
      setSelectedEvent(eventsOnSelectedDate[0]);
      setIsEventModalVisible(true);
    } else if (eventsOnSelectedDate.length > 1) {
      // If there are multiple events, we'll show them in the daily events section
      setSelectedEvent(null);
    } else {
      setSelectedEvent(null);
    }
  };

  // Helper function to get events for selected date
  const getEventsForSelectedDate = () => {
    return events.filter(
      event => event.date.toDateString() === selectedDate.toDateString()
    );
  };

  // Helper function to get event type badge
  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case 'lecture':
        return <Badge color="blue">강의</Badge>;
      case 'workshop':
        return <Badge color="green">워크샵</Badge>;
      case 'exam':
        return <Badge color="red">시험</Badge>;
      case 'deadline':
        // 수정: "orange" → "severity-high"로 변경 (유효한 값)
        return <Badge color="severity-high">마감</Badge>;
      default:
        return <Badge color="grey">기타</Badge>;
    }
  };

  // Calendar navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
    setSelectedDate(now);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    
    // Previous month days needed to fill the first row
    const prevMonthDays = [];
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      prevMonthDays.push({
        day: prevMonthLastDay - i,
        month: currentMonth - 1,
        year: currentMonth === 0 ? currentYear - 1 : currentYear,
        isCurrentMonth: false
      });
    }
    
    // Current month days
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push({
        day: i,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true
      });
    }
    
    // Next month days needed to fill the last row
    const nextMonthDays = [];
    const totalDaysDisplayed = prevMonthDays.length + currentMonthDays.length;
    const remainingCells = 42 - totalDaysDisplayed; // 6 rows * 7 days = 42
    
    for (let i = 1; i <= remainingCells; i++) {
      nextMonthDays.push({
        day: i,
        month: currentMonth + 1,
        year: currentMonth === 11 ? currentYear + 1 : currentYear,
        isCurrentMonth: false
      });
    }
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  // Get events for a specific day
  const getEventsForDay = (day: number, month: number, year: number) => {
    return events.filter(event => 
      event.date.getDate() === day && 
      event.date.getMonth() === month && 
      event.date.getFullYear() === year
    );
  };

  // Helper function to get event color
  const getEventColor = (type: string) => {
    switch (type) {
      case 'lecture':
        return '#0073bb';
      case 'workshop':
        return '#16a34a';
      case 'exam':
        return '#dc2626';
      case 'deadline':
        return '#f59e0b'; // 주황색 계열 색상 사용
      default:
        return '#6b7280';
    }
  };

  // Loading indicator
  if (loading) {
    return (
      <Box padding="l" textAlign="center">
        <Spinner size="large" />
        <Box padding="s">과정 정보를 불러오는 중...</Box>
      </Box>
    );
  }

  // Error display
  if (error) {
    return (
      <Container>
        <Alert type="error" header="과정을 불러올 수 없습니다">
          {error}
        </Alert>
      </Container>
    );
  }

  const renderCalendar = () => {
    const monthNames = [
      '1월', '2월', '3월', '4월', '5월', '6월', 
      '7월', '8월', '9월', '10월', '11월', '12월'
    ];
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const calendarDays = generateCalendarDays();
    
    return (
      <div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px' 
        }}>
          <h3>{currentYear}년 {monthNames[currentMonth]}</h3>
          <div>
            <SpaceBetween direction="horizontal" size="xs">
              <Button onClick={prevMonth} iconName="angle-left" variant="icon" />
              <Button onClick={goToToday} variant="normal">오늘</Button>
              <Button onClick={nextMonth} iconName="angle-right" variant="icon" />
            </SpaceBetween>
          </div>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {days.map((day, index) => (
                <th key={index} style={{ 
                  padding: '8px', 
                  textAlign: 'center',
                  color: index === 0 ? '#d91e18' : index === 6 ? '#2471a3' : 'inherit'
                }}>
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }, (_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: 7 }, (_, colIndex) => {
                  const dayIndex = rowIndex * 7 + colIndex;
                  const dayData = calendarDays[dayIndex];
                  const isSelected = 
                    selectedDate.getDate() === dayData.day && 
                    selectedDate.getMonth() === dayData.month && 
                    selectedDate.getFullYear() === dayData.year;
                  
                  const isToday = 
                    new Date().getDate() === dayData.day && 
                    new Date().getMonth() === dayData.month && 
                    new Date().getFullYear() === dayData.year;
                  
                  const dayEvents = getEventsForDay(dayData.day, dayData.month, dayData.year);
                  const hasEventOnDay = dayEvents.length > 0;
                  
                  return (
                    <td 
                      key={colIndex}
                      onClick={() => handleDateSelect(new Date(dayData.year, dayData.month, dayData.day))}
                      style={{ 
                        padding: '8px',
                        textAlign: 'center',
                        backgroundColor: isSelected ? '#f0f7ff' : 'transparent',
                        opacity: dayData.isCurrentMonth ? 1 : 0.3,
                        border: isToday ? '2px solid #0073bb' : '1px solid #eaeded',
                        cursor: 'pointer',
                        position: 'relative',
                        height: '60px',
                        verticalAlign: 'top'
                      }}
                    >
                      <div style={{ 
                        fontWeight: isToday ? 'bold' : 'normal',
                        color: colIndex === 0 ? '#d91e18' : colIndex === 6 ? '#2471a3' : 'inherit'
                      }}>
                        {dayData.day}
                      </div>
                      
                      {hasEventOnDay && (
                        <div style={{ 
                          marginTop: '4px',
                          fontSize: '0.7em', 
                          lineHeight: '1.2',
                          maxHeight: '36px',
                          overflow: 'hidden'
                        }}>
                          {dayEvents.map((event, idx) => (
                            idx < 2 && (
                              <div key={event.id} style={{
                                backgroundColor: getEventColor(event.type),
                                color: 'white',
                                padding: '1px 3px',
                                borderRadius: '2px',
                                marginBottom: '1px',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden'
                              }}>
                                {event.title}
                              </div>
                            )
                          ))}
                          {dayEvents.length > 2 && (
                            <div style={{ fontSize: '0.9em', color: '#666' }}>
                              +{dayEvents.length - 2}개 더보기
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <SpaceBetween size="l">
      <Container
        header={<Header variant="h1">강의 일정 및 공지사항</Header>}
      >
        <Grid gridDefinition={[{ colspan: 7 }, { colspan: 5 }]}>
          {/* Calendar Panel */}
          <Container header={<Header variant="h2">강의 일정</Header>}>
            <Box padding="m">
              <SpaceBetween size="l">
                {renderCalendar()}
                
                <div>
                  <Header variant="h3">{selectedDate.toLocaleDateString('ko-KR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric', 
                    weekday: 'long' 
                  })} 일정</Header>
                  
                  {getEventsForSelectedDate().length > 0 ? (
                    <SpaceBetween size="s">
                      {getEventsForSelectedDate().map(event => (
                        <div 
                          key={event.id} 
                          style={{ 
                            padding: '10px', 
                            border: '1px solid #eaeded', 
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          onClick={() => openEventDetails(event)}
                        >
                          <SpaceBetween size="xs">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box variant="h4">{event.title}</Box>
                              {getEventTypeBadge(event.type)}
                            </div>
                            <Box variant="small">
                              {event.startTime} - {event.endTime} | {event.location}
                            </Box>
                          </SpaceBetween>
                        </div>
                      ))}
                    </SpaceBetween>
                  ) : (
                    <Box padding="m" textAlign="center" color="text-body-secondary">
                      이 날짜에는 예정된 일정이 없습니다.
                    </Box>
                  )}
                </div>
              </SpaceBetween>
            </Box>
          </Container>
          
          {/* Announcements Panel */}
          <Container header={<Header variant="h2">공지사항</Header>}>
            <Box padding="m">
              {announcements.length > 0 ? (
                <SpaceBetween size="m">
                  {announcements.map(announcement => (
                    <ExpandableSection
                      key={announcement.id}
                      headerText={
                        <SpaceBetween direction="horizontal" size="xs">
                          {announcement.title}
                          {announcement.isImportant && (
                            <Badge color="red">중요</Badge>
                          )}
                        </SpaceBetween>
                      }
                      variant="container"
                    >
                      <Alert type={announcement.type} header={null}>
                        <Box variant="p">{announcement.message}</Box>
                        <Box variant="small" color="text-body-secondary">
                          작성일: {new Date(announcement.date).toLocaleDateString('ko-KR')}
                        </Box>
                      </Alert>
                    </ExpandableSection>
                  ))}
                </SpaceBetween>
              ) : (
                <Box textAlign="center" padding="l">
                  현재 공지사항이 없습니다.
                </Box>
              )}
            </Box>
          </Container>
        </Grid>
      </Container>
      
      {/* Event Detail Modal */}
      {selectedEvent && (
        <Modal
          visible={isEventModalVisible}
          onDismiss={() => setIsEventModalVisible(false)}
          header={selectedEvent.title}
          size="medium"
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button variant="link" onClick={() => setIsEventModalVisible(false)}>
                  닫기
                </Button>
                {(selectedEvent.type === 'lecture' || selectedEvent.type === 'workshop') && (
                  <Button variant="primary" onClick={() => navigate(`/event/\${selectedEvent.id}/materials`)}>
                    강의 자료 보기
                  </Button>
                )}
              </SpaceBetween>
            </Box>
          }
        >
          <SpaceBetween size="l">
            <ColumnLayout columns={2}>
              <div>
                <Box variant="awsui-key-label">일시</Box>
                <Box variant="p">
                  {selectedEvent.date.toLocaleDateString('ko-KR')} ({selectedEvent.date.toLocaleDateString('ko-KR', {weekday: 'long'})})
                  <br />
                  {selectedEvent.startTime} - {selectedEvent.endTime}
                </Box>
              </div>
              
              <div>
                <Box variant="awsui-key-label">장소</Box>
                <Box variant="p">{selectedEvent.location}</Box>
              </div>
              
              {selectedEvent.instructors && (
                <div>
                  <Box variant="awsui-key-label">담당 강사</Box>
                  <Box variant="p">{selectedEvent.instructors.join(', ')}</Box>
                </div>
              )}
              
              <div>
                <Box variant="awsui-key-label">유형</Box>
                <Box variant="p">{getEventTypeBadge(selectedEvent.type)}</Box>
              </div>
            </ColumnLayout>
            
            <div>
              <Box variant="awsui-key-label">설명</Box>
              <Box variant="p">{selectedEvent.description}</Box>
            </div>
            
            {selectedEvent.type === 'workshop' && (
              <Alert type="info">
                워크샵 참여를 위해 개인 노트북을 지참해 주시기 바랍니다.
              </Alert>
            )}
            
            {selectedEvent.type === 'exam' && (
              <Alert type="warning">
                시험은 정시에 시작되며, 지각 시 입실이 제한될 수 있습니다. 학생증을 반드시 지참하세요.
              </Alert>
            )}
            
            {selectedEvent.type === 'deadline' && (
              <Alert type="error">
                마감 시간 이후에는 제출이 불가능합니다. 반드시 기한 내에 제출해주세요.
              </Alert>
            )}
          </SpaceBetween>
        </Modal>
      )}
    </SpaceBetween>
  );
};

export default CourseHome;