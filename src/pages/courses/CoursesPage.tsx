// src/pages/courses/CoursesPage.tsx
import React, { useState } from "react";
import { useCollection } from '@cloudscape-design/collection-hooks';
import {
  Table,
  Box,
  Button,
  TextFilter,
  Pagination,
  Header,
  SpaceBetween,
  Container,
  Input,
  StatusIndicator
} from '@cloudscape-design/components';
import { CourseStatus, Course } from '@/models/course'; // 통일된 타입 임포트

// Props 타입 정의
interface CourseTableProps {
  courses: Course[];
  onUpdateCourse: (data: { courseId: string; attendance: number }) => Promise<void>;
  onDeleteCourse: (courseId: string) => void;
}

/**
 * 과정 상태 표시 정보
 */
interface CourseStatusDisplayInfo {
  label: string;
  indicatorType: "success" | "info" | "error" | "warning";
}

/**
 * 과정 상태별 표시 정보
 */
const COURSE_STATUS_INFO: Record<CourseStatus, CourseStatusDisplayInfo> = {
  [CourseStatus.SCHEDULED]: { 
    label: '예정', 
    indicatorType: 'warning' 
  },
  [CourseStatus.IN_PROGRESS]: { 
    label: '진행 중', 
    indicatorType: 'success' 
  },
  [CourseStatus.COMPLETED]: { 
    label: '완료', 
    indicatorType: 'info' 
  },
  [CourseStatus.CANCELLED]: { 
    label: '취소', 
    indicatorType: 'error' 
  }
};

export default function CourseTable({ courses = [], onUpdateCourse, onDeleteCourse }: CourseTableProps) {
  const [loading, setLoading] = useState(false);

  // 컬렉션 후크를 사용하여 필터링, 정렬, 페이지네이션 처리
  const { items, filteredItemsCount, collectionProps, paginationProps, filterProps } = useCollection(courses, {
    filtering: {
      empty: <Box textAlign="center" color="inherit">
        <b>일치하는 과정이 없습니다</b>
        <Box padding={{ bottom: "s" }} variant="p" color="inherit">
          필터를 조정하시거나 검색어를 변경해보세요
        </Box>
      </Box>,
      noMatch: <Box textAlign="center" color="inherit">
        <b>일치하는 과정이 없습니다</b>
        <Box padding={{ bottom: "s" }} variant="p" color="inherit">
          필터를 조정하시거나 검색어를 변경해보세요
        </Box>
      </Box>,
    },
    pagination: { pageSize: 10 },
    sorting: {},
  });

  const handleAttendanceChange = async (courseId: string, newAttendance: string): Promise<void> => {
    setLoading(true);
    try {
      await onUpdateCourse({ 
        courseId, 
        attendance: parseInt(newAttendance, 10) 
      });
    } catch (error) {
      console.error("참석 인원 업데이트 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Table
        {...collectionProps}
        resizableColumns
        stickyHeader
        variant="full-page"
        selectionType="multi"
        enableKeyboardNavigation
        columnDefinitions={[
          {
            id: "courseId",
            header: "과정 ID",
            cell: (item: Course) => item.courseId,
            sortingField: "courseId",
            isRowHeader: true,
          },
          {
            id: "startDate",
            header: "시작 날짜",
            cell: (item: Course) => new Date(item.startDate).toLocaleDateString(),
            sortingField: "startDate",
          },
          {
            id: "catalogId",
            header: "카탈로그 ID",
            cell: (item: Course) => item.catalogId,
          },
          {
            id: "instructor",
            header: "강사",
            cell: (item: Course) => item.instructor,
            sortingField: "instructor",
          },
          {
            id: "location",
            header: "장소",
            cell: (item: Course) => item.location || "-",
          },
          {
            id: "attendance",
            header: "참석 인원",
            minWidth: 120,
            cell: (item: Course) => item.attendance || 0,
            editConfig: {
              ariaLabel: "참석 인원",
              editIconAriaLabel: "편집 가능",
              errorIconAriaLabel: "참석 인원 오류",
              editingCell: (
                item: Course,
                { currentValue, setValue }: { currentValue: string | undefined; setValue: (value: string) => void }
              ) => {
                return (
                  <Input
                    autoFocus={true}
                    type="number"
                    value={currentValue ?? (item.attendance?.toString() || '0')}
                    onChange={event => setValue(event.detail.value)}
                  />
                );
              }
            },
          },
          {
            id: "durations",
            header: "기간 (일)",
            cell: (item: Course) => item.durations || "-",
          },
          {
            id: "status",
            header: "상태",
            cell: (item: Course) => {
              // item.status가 있는지 확인하고 CourseStatus 타입에 있는지 확인
              const status = item.status as CourseStatus;
              const statusInfo = status && COURSE_STATUS_INFO[status] ? 
                COURSE_STATUS_INFO[status] : 
                { label: item.status || '알 수 없음', indicatorType: 'info' as const };
              
              return (
                <StatusIndicator type={statusInfo.indicatorType}>
                  {statusInfo.label}
                </StatusIndicator>
              );
            },
            sortingField: "status",
          },
          {
            id: "actions",
            header: "작업",
            cell: (item: Course) => (
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={() => onDeleteCourse(item.courseId)} variant="link">삭제</Button>
              </SpaceBetween>
            ),
          },
        ]}
        items={items}
        loading={loading}
        loadingText="과정 데이터 로딩 중..."
        submitEdit={async (item: any) => {
          try {
            if (item.column.id === 'attendance') {
              await handleAttendanceChange(item.item.courseId, item.value);
            }
            return Promise.resolve();
          } catch (error) {
            console.error("변경사항 저장 실패:", error);
            return Promise.reject(error);
          }
        }}
        empty={
          <Box
            margin={{ vertical: "xs" }}
            textAlign="center"
            color="inherit"
          >
            <SpaceBetween size="m">
              <b>등록된 과정이 없습니다</b>
              <Button>새 과정 등록</Button>
            </SpaceBetween>
          </Box>
        }
        header={
          <Header
            counter={`\${filteredItemsCount} 과정`}
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button>새 과정 등록</Button>
              </SpaceBetween>
            }
          >
            과정 목록
          </Header>
        }
        filter={
          <TextFilter
            {...filterProps}
            countText={`\${filteredItemsCount} 개 찾음`}
            filteringPlaceholder="과정 검색"
          />
        }
        pagination={<Pagination {...paginationProps} />}
      />
    </Container>
  );
}