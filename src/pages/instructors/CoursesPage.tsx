// src/pages/instructors/CoursesPage.tsx
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
import { useState } from "react";

// Course 타입 정의
interface Course {
  courseId: string;
  startDate: string;
  catalogId: string;
  instructor: string;
  location?: string;
  attendance?: number;
  durations?: number;
  status: string;
  shareCode: string;
  customerId: string;
  createdAt?: string;
  updatedAt?: string;
}

// Props 타입 정의
interface CourseTableProps {
  courses: Course[];
  onUpdateCourse: (data: { courseId: string; attendance: number }) => Promise<void>;
  onDeleteCourse: (courseId: string) => void;
}

// 상태 값 타입
type CourseStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'SCHEDULED';

const CourseStatusOptions = [
  { label: "활성", value: "ACTIVE" },
  { label: "완료", value: "COMPLETED" },
  { label: "취소", value: "CANCELLED" },
  { label: "예정", value: "SCHEDULED" }
];

// status 매개변수 타입 명시
const getStatusType = (status: string): "success" | "info" | "error" | "warning" => {
  switch (status) {
    case 'ACTIVE': return 'success';
    case 'COMPLETED': return 'info';
    case 'CANCELLED': return 'error';
    case 'SCHEDULED': return 'warning';
    default: return 'info';
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
            cell: (item: Course) => (
              <StatusIndicator type={getStatusType(item.status)}>
                {item.status}
              </StatusIndicator>
            ),
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
            // Cloudscape 컴포넌트에서는 item에 detail 속성이 없고 
            // 직접 { item, column, value } 구조로 제공됩니다
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