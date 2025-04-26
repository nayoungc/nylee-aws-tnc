// src/components/admin/calendar/CalendarTab.tsx
import {
    Box,
    Button,
    Calendar,
    Container,
    DatePicker,
    FormField,
    Grid,
    Header,
    Input,
    Modal,
    Select,
    SpaceBetween,
    Table,
    Tabs,
    Textarea
} from '@cloudscape-design/components';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// 강의 타입 정의
interface Course {
    id: string;
    title: string;
    instructor: string;
    startDate: string;
    endDate: string;
    time: string;
    location: string;
    type: string;
    level: string;
    seats: number;
    remainingSeats: number;
    description: string;
    status: 'scheduled' | 'canceled' | 'completed';
}

// 샘플 교육 과정 데이터
const sampleCourses: Course[] = [
    {
        id: "course1",
        title: "AWS 아키텍처 설계 기초",
        instructor: "김철수",
        startDate: "2025-04-15",
        endDate: "2025-04-15",
        time: "10:00 - 16:00",
        location: "강남 교육센터",
        type: "오프라인",
        level: "초급",
        seats: 15,
        remainingSeats: 5,
        description: "AWS의 기본 서비스를 활용한 아키텍처 설계 기초를 학습합니다. EC2, S3, RDS 등의 핵심 서비스 실습이 포함됩니다.",
        status: 'scheduled'
    },
    {
        id: "course2",
        title: "서버리스 애플리케이션 개발",
        instructor: "이영희",
        startDate: "2025-04-15",
        endDate: "2025-04-15",
        time: "13:00 - 17:00",
        location: "온라인 화상 강의",
        type: "온라인",
        level: "중급",
        seats: 30,
        remainingSeats: 12,
        description: "AWS Lambda와 API Gateway를 활용한 서버리스 애플리케이션 개발 방법론을 배웁니다.",
        status: 'scheduled'
    },
    {
        id: "course3",
        title: "AWS 보안 최적화 워크샵",
        instructor: "박보안",
        startDate: "2025-04-20",
        endDate: "2025-04-20",
        time: "09:00 - 18:00",
        location: "역삼 AWS 교육장",
        type: "오프라인",
        level: "고급",
        seats: 20,
        remainingSeats: 3,
        description: "AWS 환경에서의 보안 위협에 대응하고 보안 서비스를 활용해 인프라를 보호하는 방법을 학습합니다.",
        status: 'scheduled'
    },
    {
        id: "course4",
        title: "컨테이너 오케스트레이션 마스터",
        instructor: "정도커",
        startDate: "2025-04-25",
        endDate: "2025-04-25",
        time: "10:00 - 17:00",
        location: "온라인 화상 강의",
        type: "온라인",
        level: "중급",
        seats: 25,
        remainingSeats: 8,
        description: "ECS와 EKS를 활용한 컨테이너 오케스트레이션 방법을 배웁니다. 실제 운영 환경에서 활용 가능한 배포 전략을 다룹니다.",
        status: 'scheduled'
    }
];

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

// 샘플 강사 데이터
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

// 샘플 장소 데이터
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
    courses: Course[];
    selectedDate: string | null;
    onSelectDate: (date: string) => void;
}

const EventDateList: React.FC<EventDateListProps> = ({ courses, selectedDate, onSelectDate }) => {
    const { t } = useTranslation(['admin']);

    // 날짜별로 그룹화된 코스
    const groupedByDate = courses.reduce((acc, course) => {
        const date = course.startDate;
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(course);
        return acc;
    }, {} as Record<string, Course[]>);

    // 날짜 정렬
    const sortedDates = Object.keys(groupedByDate).sort();

    return (
        <Box padding={{ top: 's' }}>
            <Header variant="h3">{t('calendar.upcoming_events', '예정된 교육')}</Header>
            {sortedDates.length > 0 ? (
                <Box padding={{ left: 's', top: 's' }}>
                    <SpaceBetween size="xs">
                        {sortedDates.map(date => {
                            const formattedDate = new Date(date).toLocaleDateString();
                            return (
                                <Button
                                    key={date}
                                    variant={selectedDate === date ? "primary" : "link"}
                                    onClick={() => onSelectDate(date)}
                                    iconName="calendar"
                                >
                                    {formattedDate} - {groupedByDate[date].length}개 과정
                                </Button>
                            );
                        })}
                    </SpaceBetween>
                </Box>
            ) : (
                <Box color="text-body-secondary" padding={{ top: 's', left: 's' }}>
                    {t('calendar.no_events', '예정된 교육이 없습니다')}
                </Box>
            )}
        </Box>
    );
};

const CalendarTab: React.FC = () => {
    const { t } = useTranslation(['admin', 'common']);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTabId, setActiveTabId] = useState<string>("calendar");
    const [courses, setCourses] = useState<Course[]>(sampleCourses);
    const [instructors] = useState<Instructor[]>(sampleInstructors);
    const [locations] = useState<Location[]>(sampleLocations);

    // 선택한 날짜의 강의 필터링
    const coursesForSelectedDate = selectedDate
        ? courses.filter(course => course.startDate === selectedDate)
        : [];

    // 날짜 선택 핸들러
    const handleDateSelect = (date: string) => {
        setSelectedDate(date);
    };

    // 과정 추가 핸들러
    const handleAddCourse = () => {
        // 빈 과정 객체로 모달 열기
        setSelectedCourse({
            id: `course\${Date.now()}`,
            title: "",
            instructor: "",
            startDate: selectedDate || new Date().toISOString().split('T')[0],
            endDate: selectedDate || new Date().toISOString().split('T')[0],
            time: "09:00 - 17:00",
            location: "",
            type: "오프라인",
            level: "초급",
            seats: 20,
            remainingSeats: 20,
            description: "",
            status: 'scheduled'
        });
        setIsModalOpen(true);
    };

    // 과정 편집 핸들러
    const handleEditCourse = (course: Course) => {
        setSelectedCourse({ ...course });
        setIsModalOpen(true);
    };

    // 과정 삭제 핸들러
    const handleDeleteCourse = (courseId: string) => {
        setCourses(prev => prev.filter(course => course.id !== courseId));
    };

    // 과정 저장 핸들러
    const handleSaveCourse = (course: Course) => {
        if (courses.some(c => c.id === course.id)) {
            // 기존 과정 업데이트
            setCourses(prev => prev.map(c => c.id === course.id ? course : c));
        } else {
            // 새 과정 추가
            setCourses(prev => [...prev, course]);
        }
        setIsModalOpen(false);
        setSelectedCourse(null);
    };

    return (
        <SpaceBetween size="l">
            <Tabs
                activeTabId={activeTabId}
                onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
                tabs={[
                    {
                        label: t('calendar.calendar_view', '캘린더 뷰'),
                        id: "calendar",
                        content: (
                            <Grid gridDefinition={[{ colspan: 4 }, { colspan: 8 }]}>
                                <Container
                                    header={
                                        <Header variant="h2">
                                            {t('calendar.title', '교육 일정 관리')}
                                        </Header>
                                    }
                                >
                                    <SpaceBetween size="m">
                                        <Calendar
                                            value={selectedDate || ""}
                                            onChange={({ detail }) => handleDateSelect(detail.value)}
                                            locale={t('common:locale', 'ko-KR')}
                                            startOfWeek={0}
                                            isDateEnabled={() => true}
                                            i18nStrings={{
                                                todayAriaLabel: t('calendar.today', '오늘'),
                                                previousMonthAriaLabel: t('calendar.previous_month', '이전 달'),
                                                nextMonthAriaLabel: t('calendar.next_month', '다음 달')
                                            }}
                                            ariaLabelledby="calendar-heading"
                                        />

                                        {/* 이벤트 날짜 목록 */}
                                        <EventDateList
                                            courses={courses}
                                            selectedDate={selectedDate}
                                            onSelectDate={handleDateSelect}
                                        />

                                        {/* 새 과정 추가 버튼 */}
                                        <Button
                                            iconName="add-plus"
                                            onClick={handleAddCourse}
                                        >
                                            {t('calendar.add_course', '새 교육 과정 추가')}
                                        </Button>
                                    </SpaceBetween>
                                </Container>

                                <Container
                                    header={
                                        <Header variant="h2">
                                            {selectedDate
                                                ? t('calendar.courses_for_date', '{{date}} 교육 과정',
                                                    { date: new Date(selectedDate).toLocaleDateString() })
                                                : t('calendar.select_date', '날짜를 선택하세요')}
                                        </Header>
                                    }
                                >
                                    {selectedDate ? (
                                        <SpaceBetween size="l">
                                            {coursesForSelectedDate.length > 0 ? (
                                                <Table
                                                    items={coursesForSelectedDate}
                                                    columnDefinitions={[
                                                        {
                                                            id: "title",
                                                            header: t('calendar.course_title', '교육명'),
                                                            cell: item => item.title
                                                        },
                                                        {
                                                            id: "instructor",
                                                            header: t('calendar.instructor', '강사'),
                                                            cell: item => item.instructor
                                                        },
                                                        {
                                                            id: "time",
                                                            header: t('calendar.time', '시간'),
                                                            cell: item => item.time
                                                        },
                                                        {
                                                            id: "type",
                                                            header: t('calendar.type', '유형'),
                                                            cell: item => item.type
                                                        },
                                                        {
                                                            id: "seats",
                                                            header: t('calendar.seats', '좌석'),
                                                            cell: item => `\${item.remainingSeats}/\${item.seats}`
                                                        },
                                                        {
                                                            id: "actions",
                                                            header: t('common:actions', '작업'),
                                                            cell: item => (
                                                                <SpaceBetween direction="horizontal" size="xs">
                                                                    <Button
                                                                        variant="link"
                                                                        onClick={() => handleEditCourse(item)}
                                                                    >
                                                                        {t('common:edit', '편집')}
                                                                    </Button>
                                                                    <Button
                                                                        variant="link"
                                                                        onClick={() => handleDeleteCourse(item.id)}
                                                                    >
                                                                        {t('common:delete', '삭제')}
                                                                    </Button>
                                                                </SpaceBetween>
                                                            )
                                                        }
                                                    ]}
                                                />
                                            ) : (
                                                <Box textAlign="center" color="text-body-secondary" padding="l">
                                                    <h3>{t('calendar.no_courses', '해당 날짜에 예정된 교육 과정이 없습니다')}</h3>
                                                    <p>
                                                        <Button
                                                            onClick={handleAddCourse}
                                                        >
                                                            {t('calendar.add_course_for_date', '이 날짜에 교육 과정 추가')}
                                                        </Button>
                                                    </p>
                                                </Box>
                                            )}
                                        </SpaceBetween>
                                    ) : (
                                        <Box textAlign="center" color="text-body-secondary" padding="l">
                                            <h3>{t('calendar.please_select_date', '왼쪽 캘린더에서 날짜를 선택하세요')}</h3>
                                            <p>{t('calendar.courses_will_appear', '선택한 날짜의 교육 과정이 여기에 표시됩니다')}</p>
                                        </Box>
                                    )}
                                </Container>
                            </Grid>
                        )
                    },
                    {
                        label: t('calendar.list_view', '목록 뷰'),
                        id: "list",
                        content: (
                            <Container
                                header={
                                    <Header
                                        variant="h2"
                                        actions={
                                            <Button
                                                iconName="add-plus"
                                                onClick={handleAddCourse}
                                            >
                                                {t('calendar.add_course', '새 교육 과정 추가')}
                                            </Button>
                                        }
                                    >
                                        {t('calendar.all_courses', '전체 교육 과정')}
                                    </Header>
                                }
                            >
                                <Table
                                    items={courses}
                                    columnDefinitions={[
                                        {
                                            id: "title",
                                            header: t('calendar.course_title', '교육명'),
                                            cell: item => item.title
                                        },
                                        {
                                            id: "date",
                                            header: t('calendar.date', '날짜'),
                                            cell: item => new Date(item.startDate).toLocaleDateString()
                                        },
                                        {
                                            id: "instructor",
                                            header: t('calendar.instructor', '강사'),
                                            cell: item => item.instructor
                                        },
                                        {
                                            id: "location",
                                            header: t('calendar.location', '장소'),
                                            cell: item => item.location
                                        },
                                        {
                                            id: "type",
                                            header: t('calendar.type', '유형'),
                                            cell: item => item.type
                                        },
                                        {
                                            id: "status",
                                            header: t('calendar.status', '상태'),
                                            cell: item => item.status
                                        },
                                        {
                                            id: "actions",
                                            header: t('common:actions', '작업'),
                                            cell: item => (
                                                <SpaceBetween direction="horizontal" size="xs">
                                                    <Button
                                                        variant="link"
                                                        onClick={() => handleEditCourse(item)}
                                                    >
                                                        {t('common:edit', '편집')}
                                                    </Button>
                                                    <Button
                                                        variant="link"
                                                        onClick={() => handleDeleteCourse(item.id)}
                                                    >
                                                        {t('common:delete', '삭제')}
                                                    </Button>
                                                </SpaceBetween>
                                            )
                                        }
                                    ]}
                                    sortingColumn={{
                                        sortingField: 'date'
                                    }}
                                />
                            </Container>
                        )
                    }
                ]}
            />

            {/* 교육 과정 편집 모달 */}
            {isModalOpen && selectedCourse && (
                <Modal
                    visible={isModalOpen}
                    onDismiss={() => setIsModalOpen(false)}
                    header={
                        selectedCourse.id.includes('course') && !courses.some(c => c.id === selectedCourse.id)
                            ? t('calendar.add_course', '새 교육 과정 추가')
                            : t('calendar.edit_course', '교육 과정 편집')
                    }
                    size="large"
                    footer={
                        <Box float="right">
                            <SpaceBetween direction="horizontal" size="xs">
                                <Button variant="link" onClick={() => setIsModalOpen(false)}>
                                    {t('common:cancel', '취소')}
                                </Button>
                                <Button variant="primary" onClick={() => handleSaveCourse(selectedCourse)}>
                                    {t('common:save', '저장')}
                                </Button>
                            </SpaceBetween>
                        </Box>
                    }
                >
                    <SpaceBetween size="l">
                        <FormField label={t('calendar.course_title', '교육명')}>
                            <Input
                                value={selectedCourse.title}
                                onChange={e => setSelectedCourse(prev => ({ ...prev!, title: e.detail.value }))}
                            />
                        </FormField>

                        <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
                            <FormField label={t('calendar.start_date', '시작 날짜')}>
                                <DatePicker
                                    value={selectedCourse.startDate}
                                    onChange={({ detail }) =>
                                        setSelectedCourse(prev => ({ ...prev!, startDate: detail.value }))
                                    }
                                />
                            </FormField>

                            <FormField label={t('calendar.end_date', '종료 날짜')}>
                                <DatePicker
                                    value={selectedCourse.endDate}
                                    onChange={({ detail }) =>
                                        setSelectedCourse(prev => ({ ...prev!, endDate: detail.value }))
                                    }
                                />
                            </FormField>
                        </Grid>

                        <FormField label={t('calendar.time', '시간')}>
                            <Input
                                value={selectedCourse.time}
                                onChange={e => setSelectedCourse(prev => ({ ...prev!, time: e.detail.value }))}
                                placeholder="예: 09:00 - 17:00"
                            />
                        </FormField>

                        <FormField label={t('calendar.instructor', '강사')}>
                            <Select
                                selectedOption={{
                                    value: selectedCourse.instructor,
                                    label: instructors.find(i => i.name === selectedCourse.instructor)?.name || selectedCourse.instructor
                                }}
                                onChange={e => setSelectedCourse(prev => ({
                                    ...prev!,
                                    instructor: e.detail.selectedOption.value || '' // 빈 문자열을 기본값으로 설정
                                }))}
                                options={instructors.map(instructor => ({
                                    value: instructor.name,
                                    label: instructor.name
                                }))}
                            />
                        </FormField>

                        <FormField label={t('calendar.location', '장소')}>
                            <Select
                                selectedOption={{
                                    value: selectedCourse.location,
                                    label: locations.find(l => l.name === selectedCourse.location)?.name || selectedCourse.location
                                }}
                                onChange={e => setSelectedCourse(prev => ({
                                    ...prev!,
                                    location: e.detail.selectedOption.value || '' // 빈 문자열을 기본값으로 설정
                                }))}
                                options={locations.map(location => ({
                                    value: location.name,
                                    label: location.name
                                }))}
                            />
                        </FormField>

                        <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
                            <FormField label={t('calendar.type', '유형')}>
                                <Select
                                    selectedOption={{
                                        value: selectedCourse.type,
                                        label: selectedCourse.type
                                    }}
                                    onChange={e => setSelectedCourse(prev => ({
                                        ...prev!,
                                        type: e.detail.selectedOption.value || '오프라인' // 기본값 설정
                                    }))}
                                    options={[
                                        { value: '온라인', label: '온라인' },
                                        { value: '오프라인', label: '오프라인' }
                                    ]}
                                />
                            </FormField>

                            <FormField label={t('calendar.level', '수준')}>
                                <Select
                                    selectedOption={{
                                        value: selectedCourse.level,
                                        label: selectedCourse.level
                                    }}
                                    onChange={e => setSelectedCourse(prev => ({
                                        ...prev!,
                                        level: e.detail.selectedOption.value || '초급' // 기본값 설정
                                    }))}
                                    options={[
                                        { value: '초급', label: '초급' },
                                        { value: '중급', label: '중급' },
                                        { value: '고급', label: '고급' }
                                    ]}
                                />
                            </FormField>

                            <FormField label={t('calendar.status', '상태')}>
                                <Select
                                    selectedOption={{
                                        value: selectedCourse.status,
                                        label: selectedCourse.status === 'scheduled' ? '예정됨' :
                                            selectedCourse.status === 'canceled' ? '취소됨' : '완료됨'
                                    }}
                                    onChange={e => setSelectedCourse(prev => ({
                                        ...prev!,
                                        status: (e.detail.selectedOption.value as 'scheduled' | 'canceled' | 'completed') || 'scheduled' // 기본값 설정
                                    }))}
                                    options={[
                                        { value: 'scheduled', label: '예정됨' },
                                        { value: 'canceled', label: '취소됨' },
                                        { value: 'completed', label: '완료됨' }
                                    ]}
                                />
                            </FormField>
                        </Grid>

                        <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
                            <FormField label={t('calendar.total_seats', '총 좌석 수')}>
                                <Input
                                    type="number"
                                    value={selectedCourse.seats.toString()}
                                    onChange={e => setSelectedCourse(prev => ({ ...prev!, seats: parseInt(e.detail.value) || 0 }))}
                                />
                            </FormField>

                            <FormField label={t('calendar.remaining_seats', '남은 좌석 수')}>
                                <Input
                                    type="number"
                                    value={selectedCourse.remainingSeats.toString()}
                                    onChange={e => setSelectedCourse(prev => ({ ...prev!, remainingSeats: parseInt(e.detail.value) || 0 }))}
                                />
                            </FormField>
                        </Grid>

                        <FormField label={t('calendar.description', '설명')}>
                            <Textarea
                                rows={5}
                                value={selectedCourse.description}
                                onChange={e => {
                                    if (selectedCourse) {
                                        setSelectedCourse({
                                            ...selectedCourse,
                                            description: e.detail.value
                                        });
                                    }
                                }}
                            />
                        </FormField>
                    </SpaceBetween>
                </Modal>
            )}
        </SpaceBetween>
    );
};

export default CalendarTab;