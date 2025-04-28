// src/pages/public/components/CourseCalendar.tsx
import Board from "@cloudscape-design/board-components/board";
import BoardItem from "@cloudscape-design/board-components/board-item";
import {
  Badge,
  Box,
  Button,
  Calendar,
  Container,
  Grid,
  Header,
  SpaceBetween,
  Tabs
} from '@cloudscape-design/components';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// 강의 타입 정의
interface Course {
  id: string;
  title: string;
  event:string;
  instructor: string;
  time: string;
  location: string;
  type: string;
  level: string;
  description: string;
}

interface BoardItemData {
  id: string;
  rowSpan: number;
  columnSpan: number;
  data: Course;
}

// 캘린더 데이터를 위한 Record 타입 정의
type CoursesCalendarData = Record<string, Course[]>;

// 이벤트 날짜 목록 컴포넌트
interface EventDateListProps {
  month: number; // 0-11 사이의 월 (0: 1월, 11: 12월)
  courses: CoursesCalendarData;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

const EventDateList: React.FC<EventDateListProps> = ({ month, courses, selectedDate, onSelectDate }) => {
  const { t } = useTranslation(['tnc']);

  // 해당 월에 이벤트가 있는 날짜 필터링
  const eventsInMonth = Object.keys(courses).filter(date => {
    const eventDate = new Date(date);
    return eventDate.getMonth() === month;
  });

  return (
    <Box padding={{ top: 's' }}>
      <Header variant="h3">{t('tnc:calendar.events_this_month', '교육 일정')}</Header>
      {eventsInMonth.length > 0 ? (
        <Box padding={{ left: 's' }}>
          <SpaceBetween size="xs">
            {eventsInMonth.map(date => {
              const eventDate = new Date(date);
              return (
                <Button
                  key={date}
                  variant={selectedDate === date ? "primary" : "link"}
                  onClick={() => onSelectDate(date)}
                  iconName="calendar"
                >
                  {eventDate.getDate()}일 - {courses[date].length}개 과정
                </Button>
              );
            })}
          </SpaceBetween>
        </Box>
      ) : (
        <Box color="text-body-secondary" padding={{ top: 's', left: 's' }}>
          {t('tnc:calendar.no_events_this_month', '이 달에 예정된 교육이 없습니다')}
        </Box>
      )}
    </Box>
  );
};

// 샘플 교육 과정 데이터
const sampleCourses: CoursesCalendarData = {
  "2025-04-28": [
    {
      id: "course1",
      title: "Kick-off",
      instructor: "LG CNS & AWS T&C",
      event :"EVENT",
      time: "13:00 - 14:00",
      location: "L1",
      type: "오프라인",
      level: "Event",
      description: "AWS의 기본 서비스를 활용한 아키텍처 설계 기초를 학습합니다. EC2, S3, RDS 등의 핵심 서비스 실습이 포함됩니다."
    },
    {
      id: "course2",
      title: "AWS 기본 교육",
      instructor: "이나영",
      event :"CLASS",
      time: "14:00 - 18:00",
      location: "L1",
      type: "오프라인",
      level: "Review",

      description: "Architecting on AWS & Developing on AWS Review"
    }
  ],
  "2025-04-30": [
    {
      id: "course3",
      title: "Generative AI on AWS",
      instructor: "이나영",
      event :"CLASS",
      time: "09:00 - 17:00",
      location: "L1",
      type: "오프라인",
      level: "Generative AI",

      description: "Generative AI, Amazon Bedrock"
    }
  ],
  "2025-05-07": [
    {
      id: "course4",
      title: "Developing Generative AI Applications on AWS - Day 01",
      instructor: "이나영",
      event :"CLASS",
      time: "09:00 - 17:00",
      location: "온라인 화상 강의",
      type: "오프라인",
      level: "Generative AI",
      description: "Generative AI, Amazon Bedrock"
    }],
  "2025-05-08": [
    {
      id: "course4",
      title: "Developing Generative AI Applications on AWS - Day 02",
      instructor: "이나영",
      event :"CLASS",
      time: "09:00 - 17:00",
      location: "온라인 화상 강의",
      type: "오프라인",
      level: "Generative AI",
      description: "Generative AI, Amazon Bedrock"
    }
  ],
  "2025-05-09": [
    {
      id: "course5",
      title: "Developing Generative AI Applications on AWS - Day 02",
      instructor: "이나영",
      event :"EVENT",
      time: "09:00 - 17:00",
      location: "오프라인",
      type: "오프라인",
      level: "Generative AI",
      description: "Generative AI, Amazon Bedrock"
    }
  ]
};

const CourseCalendar: React.FC = () => {
  const { t } = useTranslation(['common', 'tnc']);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [boardItems, setBoardItems] = useState<BoardItemData[]>([]);
  const [filters, setFilters] = useState({
    type: 'all',
    level: 'all'
  });
  const [activeTabId, setActiveTabId] = useState<string>("current-month");

  // 날짜를 선택했을 때 실행되는 함수
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);

    // 선택한 날짜에 해당하는 교육 과정이 있을 경우 보드 아이템 생성
    const coursesForDate = sampleCourses[date];
    if (coursesForDate && coursesForDate.length > 0) {
      const items: BoardItemData[] = coursesForDate.map(course => ({
        id: course.id,
        rowSpan: 2,
        columnSpan: 4,
        data: course
      }));
      setBoardItems(items);
    } else {
      setBoardItems([]);
    }
  };

  // 달력에 마커를 표시하기 위한 함수
  const isDateWithEvent = (date: string): boolean => {
    return date in sampleCourses;
  };

  // 필터 변경 핸들러
  const handleFilterChange = (filterType: 'type' | 'level', value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // 현재 필터에 맞는 과정만 필터링
  const getFilteredCoursesForDate = (date: string | null): Course[] => {
    if (!date || !sampleCourses[date]) return [];

    return sampleCourses[date].filter(course => {
      const typeMatch = filters.type === 'all' || course.type === filters.type;
      const levelMatch = filters.level === 'all' || course.level === filters.level;
      return typeMatch && levelMatch;
    });
  };

  // 과정 등록 버튼 핸들러
  const handleEnrollment = (courseId: string) => {
    console.log(`Enrolling in course: \${courseId}`);
    // 실제 등록 로직 구현 필요
  };

  // Board 컴포넌트 i18n 스트링 설정
  const getBoardI18nStrings = () => {
    function createAnnouncement(
      operationAnnouncement: string,
      conflicts: any[],
      disturbed: any[]
    ) {
      const conflictsAnnouncement =
        conflicts.length > 0
          ? `\${t('tnc:calendar.conflicts_with', 'Conflicts with')} \${conflicts
              .map(c => c.data.title)
              .join(", ")}.`
          : "";
      const disturbedAnnouncement =
        disturbed.length > 0
          ? `\${t('tnc:calendar.disturbed', 'Disturbed')} \${disturbed.length} \${t('tnc:calendar.items', 'items')}.`
          : "";
      return [
        operationAnnouncement,
        conflictsAnnouncement,
        disturbedAnnouncement
      ]
        .filter(Boolean)
        .join(" ");
    }

    return {
      liveAnnouncementDndStarted: (operationType: string) =>
        operationType === "resize"
          ? t('tnc:calendar.resizing', 'Resizing')
          : t('tnc:calendar.dragging', 'Dragging'),
      liveAnnouncementDndItemReordered: (operation: any) => {
        const columns = `\${t('tnc:calendar.column', 'column')} \${operation.placement.x + 1}`;
        const rows = `\${t('tnc:calendar.row', 'row')} \${operation.placement.y + 1}`;
        return createAnnouncement(
          `\${t('tnc:calendar.item_moved_to', 'Item moved to')} \${
            operation.direction === "horizontal"
              ? columns
              : rows
          }.`,
          operation.conflicts,
          operation.disturbed
        );
      },
      liveAnnouncementDndItemResized: (operation: any) => {
        return ''; // 간소화
      },
      liveAnnouncementDndItemInserted: (operation: any) => {
        return ''; // 간소화
      },
      liveAnnouncementDndCommitted: (operationType: string) =>
        `\${operationType} \${t('tnc:calendar.committed', 'committed')}`,
      liveAnnouncementDndDiscarded: (operationType: string) =>
        `\${operationType} \${t('tnc:calendar.discarded', 'discarded')}`,
      liveAnnouncementItemRemoved: (op: any) =>
        `\${t('tnc:calendar.removed_item', 'Removed item')} \${op.item.data.title}.`,
      navigationAriaLabel: t('tnc:calendar.board_navigation', 'Board navigation'),
      navigationAriaDescription: t('tnc:calendar.board_navigation_desc', 'Click on non-empty item to move focus over'),
      navigationItemAriaLabel: (item: any) =>
        item ? item.data.title : t('tnc:calendar.empty', 'Empty')
    };
  };

  const filteredCourses = getFilteredCoursesForDate(selectedDate);

  return (
    <SpaceBetween size="l">
      <Grid gridDefinition={[{ colspan: 4 }, { colspan: 8 }]}>
        <Container
          header={
            <Header variant="h2">
              {t('tnc:calendar.title', '교육 일정 캘린더')}
            </Header>
          }
        >
          <SpaceBetween size="m">
            {/* 탭 UI로 월 전환 */}
            <Tabs
              activeTabId={activeTabId}
              onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
              tabs={[
                {
                  label: t('tnc:calendar.current_month', '이번 달'),
                  id: "current-month",
                  content: (
                    <Box>
                      <Calendar
                        value={selectedDate || ""}
                        onChange={({ detail }) => handleDateSelect(detail.value)}
                        locale={t('common:locale', 'ko-KR')}
                        startOfWeek={0}
                        isDateEnabled={() => true}
                        i18nStrings={{
                          todayAriaLabel: t('tnc:calendar.today', '오늘'),
                          previousMonthAriaLabel: t('tnc:calendar.previous_month', '이전 달'),
                          nextMonthAriaLabel: t('tnc:calendar.next_month', '다음 달')
                        }}
                        ariaLabelledby="calendar-heading"
                      />

                      {/* 이번 달 교육 일정 목록 */}
                      <EventDateList
                        month={new Date().getMonth()}
                        courses={sampleCourses}
                        selectedDate={selectedDate}
                        onSelectDate={handleDateSelect}
                      />
                    </Box>
                  )
                },
                {
                  label: t('tnc:calendar.next_month', '다음 달'),
                  id: "next-month",
                  content: (
                    <Box>
                      <Calendar
                        value={selectedDate || ""}
                        onChange={({ detail }) => handleDateSelect(detail.value)}
                        locale={t('common:locale', 'ko-KR')}
                        startOfWeek={0}
                        isDateEnabled={() => true}
                        i18nStrings={{
                          todayAriaLabel: t('tnc:calendar.today', '오늘'),
                          previousMonthAriaLabel: t('tnc:calendar.previous_month', '이전 달'),
                          nextMonthAriaLabel: t('tnc:calendar.next_month', '다음 달')
                        }}
                        ariaLabelledby="next-calendar-heading"
                      />

                      {/* 다음 달 교육 일정 목록 */}
                      <EventDateList
                        month={(new Date().getMonth() + 1) % 12}
                        courses={sampleCourses}
                        selectedDate={selectedDate}
                        onSelectDate={handleDateSelect}
                      />
                    </Box>
                  )
                }
              ]}
            />

            {/* 교육 일정 가이드 */}
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
                    {t('tnc:calendar.dates_with_courses', '교육 과정이 있는 날짜')}
                  </div>
                </Box>
                <Box color="text-body-secondary" fontSize="body-s">
                  {selectedDate ?
                    (sampleCourses[selectedDate] ?
                      t('tnc:calendar.courses_found', '{{count}}개 과정 찾음', { count: sampleCourses[selectedDate].length }) :
                      t('tnc:calendar.no_courses_found', '과정 없음')) :
                    t('tnc:calendar.select_date_to_view', '날짜를 선택하여 과정 확인')
                  }
                </Box>
              </SpaceBetween>
            </Box>
          </SpaceBetween>
        </Container>

        <Container
          header={
            <Header variant="h2">
              {selectedDate
                ? t('tnc:calendar.courses_for_date', '{{date}} 교육 과정', { date: selectedDate })
                : t('tnc:calendar.select_date', '날짜를 선택하세요')}
            </Header>
          }
        >
          {selectedDate ? (
            <SpaceBetween size="l">
              {filteredCourses.length > 0 ? (
                <Board
                  items={boardItems}
                  renderItem={(item) => {
                    const course = item.data;
                    return (
                      <BoardItem
                        i18nStrings={{
                          dragHandleAriaLabel: t('tnc:calendar.drag_handle', '드래그 핸들'),
                          dragHandleAriaDescription: t('tnc:calendar.drag_handle_desc', '스페이스바나 엔터 키를 눌러 드래그를 활성화하고, 화살표 키로 이동, 스페이스바나 엔터 키로 확인, 또는 Escape로 취소합니다.'),
                          resizeHandleAriaLabel: t('tnc:calendar.resize_handle', '크기 조절 핸들'),
                          resizeHandleAriaDescription: t('tnc:calendar.resize_handle_desc', '스페이스바나 엔터 키를 눌러 크기 조절을 활성화하고, 화살표 키로 이동, 스페이스바나 엔터 키로 확인, 또는 Escape로 취소합니다.')
                        }}
                        header={
                          <SpaceBetween size="m">
                            <Box textAlign="center" fontSize="heading-m" fontWeight="bold">
                              {course.title}
                            </Box>
                            <Box textAlign="right">
                              <Badge color="red">EVENT</Badge>
                              <Badge color="severity-medium">CLASS</Badge>;
                            </Box>
                          </SpaceBetween>
                        }
                        footer={
                          <Box>
                            <SpaceBetween direction="horizontal" size="xs">
                              <Badge color={course.type === '온라인' ? 'blue' : 'green'}>
                                {course.type}
                              </Badge>
                              <Badge color={
                                course.level === '초급' ? 'green' :
                                  course.level === '중급' ? 'blue' :
                                    'red'
                              }>
                                {course.level}
                              </Badge>
                              <Badge color='red'>Amazon Bedrock</Badge>
                            </SpaceBetween>
                          </Box>
                        }
                      >
                        <SpaceBetween size="m">
                          <Box fontSize="body-m">
                            {course.description}
                          </Box>
                          <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
                            <div>
                              <Box variant="awsui-key-label">{t('tnc:calendar.instructor', '강사')}</Box>
                              <div>{course.instructor}</div>
                            </div>
                            <div>
                              <Box variant="awsui-key-label">{t('tnc:calendar.time', '시간')}</Box>
                              <div>{course.time}</div>
                            </div>
                          </Grid>
                        </SpaceBetween>
                      </BoardItem>
                    );
                  }}
                  i18nStrings={getBoardI18nStrings()}
                  onItemsChange={() => { }}
                  empty={
                    <Box textAlign="center" color="text-body-secondary" padding="l">
                      <h3>{t('tnc:calendar.no_courses_filtered', '필터 조건에 맞는 교육 과정이 없습니다')}</h3>
                      <p>{t('tnc:calendar.try_different_filters', '다른 필터 조건을 시도해보세요')}</p>
                    </Box>
                  }
                />
              ) : (
                <Box textAlign="center" color="text-body-secondary" padding="l">
                  <h3>{t('tnc:calendar.no_courses', '해당 날짜에 예정된 교육 과정이 없습니다')}</h3>
                  <p>{t('tnc:calendar.select_another_date', '다른 날짜를 선택해 보세요')}</p>
                </Box>
              )}
            </SpaceBetween>
          ) : (
            <Box textAlign="center" color="text-body-secondary" padding="l">
              <h3>{t('tnc:calendar.please_select_date', '왼쪽 캘린더에서 날짜를 선택하세요')}</h3>
              <p>{t('tnc:calendar.courses_will_appear', '선택한 날짜의 교육 과정이 여기에 표시됩니다')}</p>
            </Box>
          )}
        </Container>
      </Grid>
    </SpaceBetween>
  );
};

export default CourseCalendar;