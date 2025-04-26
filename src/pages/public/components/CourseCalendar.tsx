// src/pages/public/components/CourseCalendar.tsx
import React, { useState } from 'react';
import {
  Calendar,
  Box,
  SpaceBetween,
  Container,
  Header,
  Grid,
  Cards,
  Badge,
  Button,
} from '@cloudscape-design/components';
import { useTranslation } from 'react-i18next';
import BoardItem from "@cloudscape-design/board-components/board-item";
import Board from "@cloudscape-design/board-components/board";

// 강의 타입 정의
interface Course {
  id: string;
  title: string;
  instructor: string;
  time: string;
  location: string;
  type: string;
  level: string;
  seats: number;
  remainingSeats: number;
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

// 샘플 교육 과정 데이터
const sampleCourses: CoursesCalendarData = {
  "2025-04-15": [
    {
      id: "course1",
      title: "AWS 아키텍처 설계 기초",
      instructor: "김철수",
      time: "10:00 - 16:00",
      location: "강남 교육센터",
      type: "오프라인",
      level: "초급",
      seats: 15,
      remainingSeats: 5,
      description: "AWS의 기본 서비스를 활용한 아키텍처 설계 기초를 학습합니다. EC2, S3, RDS 등의 핵심 서비스 실습이 포함됩니다."
    },
    {
      id: "course2",
      title: "서버리스 애플리케이션 개발",
      instructor: "이영희",
      time: "13:00 - 17:00",
      location: "온라인 화상 강의",
      type: "온라인",
      level: "중급",
      seats: 30,
      remainingSeats: 12,
      description: "AWS Lambda와 API Gateway를 활용한 서버리스 애플리케이션 개발 방법론을 배웁니다."
    }
  ],
  "2025-04-20": [
    {
      id: "course3",
      title: "AWS 보안 최적화 워크샵",
      instructor: "박보안",
      time: "09:00 - 18:00",
      location: "역삼 AWS 교육장",
      type: "오프라인",
      level: "고급",
      seats: 20,
      remainingSeats: 3,
      description: "AWS 환경에서의 보안 위협에 대응하고 보안 서비스를 활용해 인프라를 보호하는 방법을 학습합니다."
    }
  ],
  "2025-04-25": [
    {
      id: "course4",
      title: "컨테이너 오케스트레이션 마스터",
      instructor: "정도커",
      time: "10:00 - 17:00",
      location: "온라인 화상 강의",
      type: "온라인",
      level: "중급",
      seats: 25,
      remainingSeats: 8,
      description: "ECS와 EKS를 활용한 컨테이너 오케스트레이션 방법을 배웁니다. 실제 운영 환경에서 활용 가능한 배포 전략을 다룹니다."
    }
  ]
};

// BoardItem을 위한 인터페이스 정의
interface BoardItemData {
  id: string;
  rowSpan: number;
  columnSpan: number;
  data: Course;
}

const CourseCalendar: React.FC = () => {
  const { t } = useTranslation(['common', 'tnc']);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [boardItems, setBoardItems] = useState<BoardItemData[]>([]);
  const [filters, setFilters] = useState({
    type: 'all',
    level: 'all'
  });

  // 날짜를 선택했을 때 실행되는 함수
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
    return !!sampleCourses[date];
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
        const columnsConstraint = operation.isMinimalColumnsReached
          ? ` (\${t('tnc:calendar.minimal', 'minimal')})`
          : "";
        const rowsConstraint = operation.isMinimalRowsReached
          ? ` (\${t('tnc:calendar.minimal', 'minimal')})`
          : "";
        const sizeAnnouncement =
          operation.direction === "horizontal"
            ? `\${t('tnc:calendar.columns', 'columns')} \${operation.placement.width}\${columnsConstraint}`
            : `\${t('tnc:calendar.rows', 'rows')} \${operation.placement.height}\${rowsConstraint}`;
        return createAnnouncement(
          `\${t('tnc:calendar.item_resized_to', 'Item resized to')} \${sizeAnnouncement}.`,
          operation.conflicts,
          operation.disturbed
        );
      },
      liveAnnouncementDndItemInserted: (operation: any) => {
        const columns = `\${t('tnc:calendar.column', 'column')} \${operation.placement.x + 1}`;
        const rows = `\${t('tnc:calendar.row', 'row')} \${operation.placement.y + 1}`;
        return createAnnouncement(
          `\${t('tnc:calendar.item_inserted_to', 'Item inserted to')} \${columns}, \${rows}.`,
          operation.conflicts,
          operation.disturbed
        );
      },
      liveAnnouncementDndCommitted: (operationType: string) =>
        `\${operationType} \${t('tnc:calendar.committed', 'committed')}`,
      liveAnnouncementDndDiscarded: (operationType: string) =>
        `\${operationType} \${t('tnc:calendar.discarded', 'discarded')}`,
      liveAnnouncementItemRemoved: (op: any) =>
        createAnnouncement(
          `\${t('tnc:calendar.removed_item', 'Removed item')} \${op.item.data.title}.`,
          [],
          op.disturbed
        ),
      navigationAriaLabel: t('tnc:calendar.board_navigation', 'Board navigation'),
      navigationAriaDescription: t('tnc:calendar.board_navigation_desc', 'Click on non-empty item to move focus over'),
      navigationItemAriaLabel: (item: any) =>
        item ? item.data.title : t('tnc:calendar.empty', 'Empty')
    };
  };

  // 과정 등록 버튼 핸들러
  const handleEnrollment = (courseId: string) => {
    console.log(`Enrolling in course: \${courseId}`);
    // 실제 등록 로직 구현 필요
  };

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
            <SpaceBetween size="m">
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
            <Box padding={{ top: 's' }} color="text-body-secondary">
              <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#0972d3',
                  marginRight: '5px'
                }} />
                {t('tnc:calendar.event_indicator', '교육 일정 있음')}
              </div>
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
              {boardItems.length > 0 ? (
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
                          <Header
                            actions={
                              <Button
                                variant="primary"
                                onClick={() => handleEnrollment(course.id)}
                              >
                                {t('tnc:calendar.enroll', '등록하기')}
                              </Button>
                            }
                          >
                            {course.title}
                          </Header>
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
                              <Badge color={course.remainingSeats <= 5 ? 'red' : 'green'}>
                                {t('tnc:calendar.seats_remaining', '남은 좌석: {{count}}', { count: course.remainingSeats })}
                              </Badge>
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
                          <div>
                            <Box variant="awsui-key-label">{t('tnc:calendar.location', '장소')}</Box>
                            <div>{course.location}</div>
                          </div>
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