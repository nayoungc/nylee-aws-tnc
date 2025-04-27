// src/components/admin/calendar/CalendarTab.tsx
import React, { useState, useEffect } from 'react';
import { useCollection } from '@cloudscape-design/collection-hooks';
import {
    Box,
    Button,
    Calendar,
    Container,
    ColumnLayout,
    Grid,
    Header,
    Pagination,
    Select,
    SpaceBetween,
    Spinner,
    Table,
    Tabs,
    TextFilter
} from '@cloudscape-design/components';
import { useCalendar } from '@/hooks/useCalendar';
import { CalendarEvent, EventType } from '@/models/calendar';
import EventFormModal from './EventFormModal';
import { formatDate, getTodayString } from '@/utils/dateUtils';
import { useAppTranslation } from '@/hooks/useAppTranslation';

// 강사 인터페이스
interface Instructor {
    id: string;
    name: string;
    email: string;
    specialties: string[];
}

// 장소 인터페이스
interface Location {
    id: string;
    name: string;
    address: string;
    capacity: number;
    isVirtual: boolean;
}

// 샘플 강사 데이터 (실제 구현에서는 API에서 가져옴)
const sampleInstructors: Instructor[] = [
    {
        id: "inst1",
        name: "김철수",
        email: "kim@example.com",
        specialties: ["AWS 아키텍처", "보안"]
    },
    {
        id: "inst2",
        name: "이영희",
        email: "lee@example.com",
        specialties: ["서버리스", "DevOps"]
    },
    {
        id: "inst3",
        name: "박보안",
        email: "park@example.com",
        specialties: ["보안", "규정 준수"]
    },
    {
        id: "inst4",
        name: "정도커",
        email: "jung@example.com",
        specialties: ["컨테이너", "쿠버네티스"]
    }
];

// 샘플 장소 데이터 (실제 구현에서는 API에서 가져옴)
const sampleLocations: Location[] = [
    {
        id: "loc1",
        name: "강남 교육센터",
        address: "서울시 강남구 테헤란로 152",
        capacity: 30,
        isVirtual: false
    },
    {
        id: "loc2",
        name: "역삼 AWS 교육장",
        address: "서울시 강남구 역삼동 823-30",
        capacity: 50,
        isVirtual: false
    },
    {
        id: "loc3",
        name: "온라인 화상 강의",
        address: "화상회의 플랫폼",
        capacity: 100,
        isVirtual: true
    }
];

// 이벤트 날짜 목록 컴포넌트
interface EventDateListProps {
    events: CalendarEvent[];
    selectedDate: string | null;
    onSelectDate: (date: string) => void;
}

const EventDateList: React.FC<EventDateListProps> = ({ events, selectedDate, onSelectDate }) => {
    const { t } = useAppTranslation();

    // 날짜별로 그룹화된 이벤트
    const groupedByDate = events.reduce((acc, event) => {
        const date = event.date;
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(event);
        return acc;
    }, {} as Record<string, CalendarEvent[]>);

    // 날짜 정렬
    const sortedDates = Object.keys(groupedByDate).sort();

    return (
        <Box padding={{ top: 's' }}>
            <Header variant="h3">{t('calendar_upcoming_events')}</Header>
            {sortedDates.length > 0 ? (
                <Box padding={{ left: 's', top: 's' }}>
                    <SpaceBetween size="xs">
                        {sortedDates.map(date => {
                            const formattedDate = formatDate(date);
                            return (
                                <Button
                                    key={date}
                                    variant={selectedDate === date ? "primary" : "link"}
                                    onClick={() => onSelectDate(date)}
                                    iconName="calendar"
                                >
                                    {formattedDate} - {groupedByDate[date].length}{t('course_count')}
                                </Button>
                            );
                        })}
                    </SpaceBetween>
                </Box>
            ) : (
                <Box color="text-body-secondary" padding={{ top: 's', left: 's' }}>
                    {t('calendar_no_events')}
                </Box>
            )}
        </Box>
    );
};

const CalendarTab: React.FC = () => {
    const { t } = useAppTranslation();
    const [activeTabId, setActiveTabId] = useState<string>("calendar");
    const [selectedDate, setSelectedDate] = useState<string | null>(getTodayString());
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // 추가 상태 변수들
    const [instructors] = useState<Instructor[]>(sampleInstructors);
    const [locations] = useState<Location[]>(sampleLocations);

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
        if (selectedDate) {
            loadEventsByDate(selectedDate);
        }
    }, [selectedDate]);

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
            setIsModalOpen(false);

            if (eventData.date === selectedDate) {
                loadEventsByDate(selectedDate);
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
            setIsModalOpen(false);
            setSelectedEvent(null);

            if (eventData.date && eventData.date !== selectedDate) {
                loadEvents();
            } else if (selectedDate) { // null 체크 추가
                loadEventsByDate(selectedDate);
            } else {
                // selectedDate가 null인 경우 전체 이벤트 로드
                loadEvents();
            }
        } catch (err) {
            console.error('이벤트 수정 오류:', err);
        }
    };

    // 이벤트 삭제 처리
    const handleDeleteEvent = async (id: string) => {
        try {
            await deleteEvent(id);
            if (selectedDate) { // null 체크 추가
                loadEventsByDate(selectedDate);
            } else {
                // selectedDate가 null인 경우 전체 이벤트 로드
                loadEvents();
            }
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

    // 선택된 날짜의 이벤트
    const eventsForSelectedDate = selectedDate
        ? calendarEventsMap[selectedDate] || []
        : [];

    // 날짜에 이벤트가 있는지 확인하는 함수
    const isDateWithEvent = (dateString: string): boolean => {
        return !!calendarEventsMap[dateString] && calendarEventsMap[dateString].length > 0;
    };

    // 날짜 선택 핸들러
    const handleDateSelect = (date: string) => {
        setSelectedDate(date);
    };

    // 이벤트 추가 핸들러
    const handleAddEvent = () => {
        setSelectedEvent(null);
        setIsModalOpen(true);
    };

    // 이벤트 편집 핸들러
    const handleEditEvent = (event: CalendarEvent) => {
        setSelectedEvent({ ...event });
        setIsModalOpen(true);
    };

    // Collection Hooks를 사용한 필터링 및 페이지네이션
    const { items, filterProps, paginationProps } = useCollection(events, {
        filtering: {
            empty: <Box textAlign="center" color="inherit">{t('no_events')}</Box>,
            noMatch: <Box textAlign="center" color="inherit">{t('no_search_results')}</Box>,
        },
        pagination: { pageSize: 10 },
        sorting: {},
    });

    // 날짜 표시 커스텀 렌더러
    const renderDateContent = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        const dayEvents = calendarEventsMap[dateStr] || [];

        if (dayEvents.length === 0) return null;

        return (
            <div style={{
                width: '100%',
                height: '4px',
                backgroundColor: '#0972d3',
                borderRadius: '2px',
                marginTop: '2px'
            }} />
        );
    };

    return (
        <SpaceBetween size="l">
            <Tabs
                activeTabId={activeTabId}
                onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
                tabs={[
                    {
                        label: t('calendar_view'),
                        id: "calendar",
                        content: (
                            <Grid gridDefinition={[{ colspan: 4 }, { colspan: 8 }]}>
                                <Container
                                    header={
                                        <Header variant="h2">
                                            {t('calendar_title')}
                                        </Header>
                                    }
                                >
                                    <SpaceBetween size="m">
                                        <Calendar
                                            value={selectedDate || ""}
                                            onChange={({ detail }) => handleDateSelect(detail.value)}
                                            locale="ko-KR"
                                            startOfWeek={0}
                                            // renderDayContent 속성 제거
                                            isDateEnabled={(date) => true} // 모든 날짜 선택 가능
                                            i18nStrings={{
                                                todayAriaLabel: t('calendar_today'),
                                                previousMonthAriaLabel: t('calendar_previous_month'),
                                                nextMonthAriaLabel: t('calendar_next_month'),
                                            }}
                                        />

                                        {/* 이벤트가 있는 날짜를 표시하는 방법을 대체 */}
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
                                                        {t('dates_with_events')}
                                                    </div>
                                                </Box>
                                                <Box color="text-body-secondary" fontSize="body-s">
                                                    {selectedDate
                                                        ? `\${formatDate(selectedDate)}: \${eventsForSelectedDate.length}\${t('events_count')}`
                                                        : t('select_date')
                                                    }
                                                </Box>
                                            </SpaceBetween>
                                        </Box>

                                        {/* 이벤트 날짜 목록 */}
                                        <EventDateList
                                            events={events}
                                            selectedDate={selectedDate}
                                            onSelectDate={handleDateSelect}
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
                                                        {t('dates_with_events')}
                                                    </div>
                                                </Box>
                                                <Box color="text-body-secondary" fontSize="body-s">
                                                    {selectedDate
                                                        ? `\${formatDate(selectedDate)}: \${eventsForSelectedDate.length}\${t('events_count')}`
                                                        : t('select_date')
                                                    }
                                                </Box>
                                            </SpaceBetween>
                                        </Box>

                                        {/* 새 이벤트 추가 버튼 */}
                                        <Button
                                            iconName="add-plus"
                                            onClick={handleAddEvent}
                                        >
                                            {t('add_new_event')}
                                        </Button>
                                    </SpaceBetween>
                                </Container>

                                <Container
                                    header={
                                        <Header variant="h2">
                                            {selectedDate
                                                ? `\${formatDate(selectedDate)} \${t('events')}`
                                                : t('select_date')}
                                        </Header>
                                    }
                                >
                                    {selectedDate ? (
                                        <SpaceBetween size="l">
                                            {eventsForSelectedDate.length > 0 ? (
                                                <Table
                                                    items={eventsForSelectedDate}
                                                    columnDefinitions={[
                                                        {
                                                            id: "title",
                                                            header: t('event_title'),
                                                            cell: item => item.title
                                                        },
                                                        {
                                                            id: "instructor",
                                                            header: t('instructor'),
                                                            cell: item => item.instructorName
                                                        },
                                                        {
                                                            id: "time",
                                                            header: t('time'),
                                                            cell: item => `\${item.startTime} - \${item.endTime}`
                                                        },
                                                        {
                                                            id: "location",
                                                            header: t('location'),
                                                            cell: item => item.location
                                                        },
                                                        {
                                                            id: "seats",
                                                            header: t('seats'),
                                                            cell: item => `\${item.currentAttendees}/\${item.maxAttendees}`
                                                        },
                                                        {
                                                            id: "actions",
                                                            header: t('actions'),
                                                            cell: item => (
                                                                <SpaceBetween direction="horizontal" size="xs">
                                                                    <Button
                                                                        variant="link"
                                                                        onClick={() => handleEditEvent(item)}
                                                                    >
                                                                        {t('edit')}
                                                                    </Button>
                                                                    <Button
                                                                        variant="link"
                                                                        onClick={() => {
                                                                            if (window.confirm(t('confirm_delete'))) {
                                                                                handleDeleteEvent(item.id);
                                                                            }
                                                                        }}
                                                                    >
                                                                        {t('delete')}
                                                                    </Button>
                                                                </SpaceBetween>
                                                            )
                                                        }
                                                    ]}
                                                />
                                            ) : (
                                                <Box textAlign="center" color="text-body-secondary" padding="l">
                                                    <h3>{t('no_events_for_date')}</h3>
                                                    <p>
                                                        <Button
                                                            onClick={handleAddEvent}
                                                        >
                                                            {t('add_event_for_date')}
                                                        </Button>
                                                    </p>
                                                </Box>
                                            )}
                                        </SpaceBetween>
                                    ) : (
                                        <Box textAlign="center" color="text-body-secondary" padding="l">
                                            <h3>{t('please_select_date')}</h3>
                                            <p>{t('events_will_appear')}</p>
                                        </Box>
                                    )}
                                </Container>
                            </Grid>
                        )
                    },
                    {
                        label: t('list_view'),
                        id: "list",
                        content: (
                            <Container
                                header={
                                    <Header
                                        variant="h2"
                                        actions={
                                            <Button
                                                iconName="add-plus"
                                                onClick={handleAddEvent}
                                            >
                                                {t('add_new_event')}
                                            </Button>
                                        }
                                    >
                                        {t('all_events')}
                                    </Header>
                                }
                            >
                                <SpaceBetween size="l">
                                    <TextFilter
                                        {...filterProps}
                                        countText={t('event_count', { count: items.length })}
                                        filteringAriaLabel={t('search_events')}
                                        filteringPlaceholder={t('search_events_placeholder')}
                                    />

                                    {loading ? (
                                        <Spinner size="large" />
                                    ) : (
                                        <>
                                            <Table
                                                items={items}
                                                columnDefinitions={[
                                                    {
                                                        id: "title",
                                                        header: t('event_title'),
                                                        cell: item => item.title
                                                    },
                                                    {
                                                        id: "date",
                                                        header: t('date'),
                                                        cell: item => formatDate(item.date)
                                                    },
                                                    {
                                                        id: "instructor",
                                                        header: t('instructor'),
                                                        cell: item => item.instructorName
                                                    },
                                                    {
                                                        id: "location",
                                                        header: t('location'),
                                                        cell: item => item.location
                                                    },
                                                    {
                                                        id: "time",
                                                        header: t('time'),
                                                        cell: item => `\${item.startTime} - \${item.endTime}`
                                                    },
                                                    {
                                                        id: "type",
                                                        header: t('event_type'),
                                                        cell: item => item.eventType === 'CLASS'
                                                            ? t('class_type')
                                                            : t('event_type')
                                                    },
                                                    {
                                                        id: "actions",
                                                        header: t('actions'),
                                                        cell: item => (
                                                            <SpaceBetween direction="horizontal" size="xs">
                                                                <Button
                                                                    variant="link"
                                                                    onClick={() => handleEditEvent(item)}
                                                                >
                                                                    {t('edit')}
                                                                </Button>
                                                                <Button
                                                                    variant="link"
                                                                    onClick={() => {
                                                                        if (window.confirm(t('confirm_delete'))) {
                                                                            handleDeleteEvent(item.id);
                                                                        }
                                                                    }}
                                                                >
                                                                    {t('delete')}
                                                                </Button>
                                                            </SpaceBetween>
                                                        )
                                                    }
                                                ]}
                                                sortingColumn={{
                                                    sortingField: 'date'
                                                }}
                                                pagination={<Pagination {...paginationProps} />}
                                                loading={loading}
                                                loadingText={t('loading_events')}
                                                empty={
                                                    <Box
                                                        textAlign="center"
                                                        color="inherit"
                                                    >
                                                        <b>{t('no_events')}</b>
                                                        <Box padding={{ bottom: "s" }}>
                                                            {t('add_new_event_message')}
                                                        </Box>
                                                    </Box>
                                                }
                                            />
                                        </>
                                    )}
                                </SpaceBetween>
                            </Container>
                        )
                    }
                ]}
            />

            {/* 이벤트 편집 모달 컴포넌트 */}
            <EventFormModal
                event={selectedEvent}
                visible={isModalOpen}
                onDismiss={() => {
                    setIsModalOpen(false);
                    setSelectedEvent(null);
                }}
                onSubmit={(data) => {
                    if (selectedEvent) {
                        handleUpdateEvent(selectedEvent.id, data);
                    } else {
                        handleCreateEvent(data as Omit<CalendarEvent, 'id' | 'createdAt'>);
                    }
                }}
            />
        </SpaceBetween>
    );
};

export default CalendarTab;