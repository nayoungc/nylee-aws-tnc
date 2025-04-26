// src/pages/admin/CalendarManagement.tsx
import React, { useState, useEffect } from 'react';
import { 
  Container, Header, Tabs, SpaceBetween, Grid,
  Alert, Spinner
} from '@cloudscape-design/components';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { generateClient } from 'aws-amplify/api';
import { useTranslation } from 'react-i18next';
// import { fetchCourseEvents, fetchInstructors, fetchLocations } from '@api/calendar';
// import { CourseEvent, Instructor, Location } from '../../API';
// import EventDetailsModal from '@components/admin/EventDetailsModal';
// import ResourceManagementPanel from '@components/admin/ResourceManagementPanel';

// 타입 안전한 API 클라이언트 생성
const client = generateClient();

const CalendarManagement = () => {
  const { t } = useTranslation(['calendar', 'common']);
//   const [events, setEvents] = useState<CourseEvent[]>([]);
//   const [selectedEvent, setSelectedEvent] = useState<CourseEvent | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [instructors, setInstructors] = useState<Instructor[]>([]);
//   const [locations, setLocations] = useState<Location[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
  
//   // 데이터 로드
//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         setLoading(true);
//         // Gen 2 style API 호출
//         const [eventsData, instructorsData, locationsData] = await Promise.all([
//           fetchCourseEvents(),
//           fetchInstructors(),
//           fetchLocations()
//         ]);
        
//         setEvents(eventsData);
//         setInstructors(instructorsData);
//         setLocations(locationsData);
//         setError(null);
//       } catch (err) {
//         console.error('Failed to load calendar data:', err);
//         setError(t('calendar:errors.load_failed'));
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     loadData();
//   }, [t]);

//   // 캘린더 이벤트 형식으로 변환
//   const calendarEvents = events.map(event => ({
//     id: event.id,
//     title: event.title,
//     start: new Date(event.startDate),
//     end: new Date(event.endDate),
//     extendedProps: {
//       description: event.description,
//       instructorId: event.instructorId,
//       locationId: event.locationId,
//       type: event.type,
//       level: event.level,
//       maxSeats: event.maxSeats,
//       status: event.status
//     }
//   }));

//   // 이벤트 클릭 핸들러
//   const handleEventClick = (info: any) => {
//     const eventId = info.event.id;
//     const eventData = events.find(e => e.id === eventId);
//     if (eventData) {
//       setSelectedEvent(eventData);
//       setIsModalOpen(true);
//     }
//   };

//   // 날짜 클릭으로 새 이벤트 생성
//   const handleDateClick = (info: any) => {
//     setSelectedEvent(null);
//     setIsModalOpen(true);
//   };

//   // 이벤트 저장 핸들러
//   const handleSaveEvent = async (eventData: any) => {
//     try {
//       // 이벤트 업데이트 또는 생성 로직 구현
//       // Gen 2 style API 호출
//       // ...
      
//       // 데이터 리로드
//       const updatedEvents = await fetchCourseEvents();
//       setEvents(updatedEvents);
//       setIsModalOpen(false);
//     } catch (err) {
//       console.error("Error saving event:", err);
//       setError(t('calendar:errors.save_failed'));
//     }
//   };

//   // 로딩 상태 표시
//   if (loading) {
//     return (
//       <Container>
//         <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
//           <Spinner size="large" />
//         </div>
//       </Container>
//     );
//   }

//   return (
//     <Container>
//       <Header variant="h1">{t('calendar:admin.title')}</Header>
      
//       {error && (
//         <Alert type="error" dismissible onDismiss={() => setError(null)}>
//           {error}
//         </Alert>
//       )}
      
//       <Grid gridDefinition={[{ colspan: 9 }, { colspan: 3 }]}>
//         <SpaceBetween size="l">
//           <Tabs
//             tabs={[
//               {
//                 label: t('calendar:views.month'),
//                 id: "month",
//                 content: (
//                   <FullCalendar
//                     plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
//                     initialView="dayGridMonth"
//                     events={calendarEvents}
//                     eventClick={handleEventClick}
//                     dateClick={handleDateClick}
//                     editable={true}
//                     droppable={true}
//                     eventDrop={(info) => {
//                       // 드래그 앤 드롭 처리 로직
//                     }}
//                     headerToolbar={{
//                       left: 'prev,next today',
//                       center: 'title',
//                       right: 'dayGridMonth,timeGridWeek,timeGridDay'
//                     }}
//                   />
//                 )
//               },
//               {
//                 label: t('calendar:views.week'),
//                 id: "week",
//                 content: (
//                   <FullCalendar
//                     plugins={[timeGridPlugin, interactionPlugin]}
//                     initialView="timeGridWeek"
//                     events={calendarEvents}
//                     eventClick={handleEventClick}
//                     dateClick={handleDateClick}
//                     editable={true}
//                   />
//                 )
//               }
//             ]}
//           />
//         </SpaceBetween>
        
//         <ResourceManagementPanel 
//           instructors={instructors} 
//           locations={locations}
//           onRefresh={async () => {
//             const [instructorsData, locationsData] = await Promise.all([
//               fetchInstructors(),
//               fetchLocations()
//             ]);
//             setInstructors(instructorsData);
//             setLocations(locationsData);
//           }}
//         />
//       </Grid>
      
//       {isModalOpen && (
//         <EventDetailsModal
//           event={selectedEvent}
//           instructors={instructors}
//           locations={locations}
//           onSave={handleSaveEvent}
//           onClose={() => setIsModalOpen(false)}
//         />
//       )}
//     </Container>
//   );
};

export default CalendarManagement;