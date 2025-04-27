// src/pages/admin/CalendarManagementPage.tsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  Calendar,
  Container,
  FormField,
  Grid,
  Header,
  Input,
  Modal,
  Select,
  SpaceBetween,
  Table,
  Textarea,
  StatusIndicator
} from '@cloudscape-design/components';
import { useAppTranslation } from '@/hooks/useAppTranslation';

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

// 캘린더 데이터를 위한 Record 타입 정의
type CoursesCalendarData = Record<string, Course[]>;

// 기본 빈 폼 상태
const emptyFormState: Course = {
  id: '',
  title: '',
  instructor: '',
  time: '',
  location: '',
  type: '오프라인',
  level: '초급',
  seats: 20,
  remainingSeats: 20,
  description: ''
};

// 샘플 교육 과정 데이터 (실제 구현에서는 API로 가져올 것)
const initialCoursesData: CoursesCalendarData = {
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

const CalendarManagementPage: React.FC = () => {
  const { t } = useAppTranslation();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [coursesData, setCoursesData] = useState<CoursesCalendarData>(initialCoursesData);
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Course>(emptyFormState);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

  // 선택 날짜의 과정 목록
  const coursesForSelectedDate = selectedDate ? (coursesData[selectedDate] || []) : [];

  // 날짜가 교육 과정이 있는지 확인
  const isDateWithEvent = (date: string): boolean => {
    return date in coursesData;
  };

  // 날짜 선택 핸들러
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  // 새 과정 추가 모달 열기
  const handleOpenAddCourseModal = () => {
    setIsEditMode(false);
    setCurrentCourse({
      ...emptyFormState,
      id: `course\${Date.now()}` // 임시 ID 생성
    });
    setIsFormModalVisible(true);
  };

  // 과정 수정 모달 열기
  const handleOpenEditCourseModal = (course: Course) => {
    setIsEditMode(true);
    setCurrentCourse({...course});
    setIsFormModalVisible(true);
  };

  // 과정 삭제 모달 열기
  const handleOpenDeleteModal = (courseId: string) => {
    setCourseToDelete(courseId);
    setIsDeleteModalVisible(true);
  };

  // 폼 필드 변경 핸들러
  const handleFormChange = (field: keyof Course, value: any) => {
    setCurrentCourse(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 과정 저장 핸들러
  const handleSaveCourse = () => {
    setLoading(true);

    // 실제 구현에서는 API 호출이 필요함
    setTimeout(() => {
      const updatedCoursesData = {...coursesData};
      
      // 선택된 날짜에 대한 과정 배열이 없으면 생성
      if (!updatedCoursesData[selectedDate]) {
        updatedCoursesData[selectedDate] = [];
      }

      if (isEditMode) {
        // 기존 과정 업데이트
        updatedCoursesData[selectedDate] = updatedCoursesData[selectedDate].map(course => 
          course.id === currentCourse.id ? currentCourse : course
        );
      } else {
        // 새 과정 추가
        updatedCoursesData[selectedDate].push(currentCourse);
      }
      
      setCoursesData(updatedCoursesData);
      setIsFormModalVisible(false);
      setLoading(false);
    }, 500);
  };

  // 과정 삭제 핸들러
  const handleDeleteCourse = () => {
    if (!courseToDelete) return;
    
    setLoading(true);

    // 실제 구현에서는 API 호출이 필요함
    setTimeout(() => {
      const updatedCoursesData = {...coursesData};
      
      // 과정 삭제
      updatedCoursesData[selectedDate] = updatedCoursesData[selectedDate].filter(
        course => course.id !== courseToDelete
      );
      
      // 날짜에 과정이 없으면 날짜 항목 삭제
      if (updatedCoursesData[selectedDate].length === 0) {
        delete updatedCoursesData[selectedDate];
      }
      
      setCoursesData(updatedCoursesData);
      setIsDeleteModalVisible(false);
      setCourseToDelete(null);
      setLoading(false);
    }, 500);
  };

  // 교육 과정 유형 옵션
  const courseTypeOptions = [
    { label: t('calendar_course_type_offline'), value: '오프라인' },
    { label: t('calendar_course_type_online'), value: '온라인' }
  ];

  // 교육 과정 레벨 옵션
  const courseLevelOptions = [
    { label: t('calendar_course_level_beginner'), value: '초급' },
    { label: t('calendar_course_level_intermediate'), value: '중급' },
    { label: t('calendar_course_level_advanced'), value: '고급' }
  ];

  return (
    <SpaceBetween size="l">
      <Container
        header={
          <Header
            variant="h1"
            description={t('calendar_management_description')}
          >
            {t('calendar_management_title')}
          </Header>
        }
      >
        <Grid gridDefinition={[{ colspan: 4 }, { colspan: 8 }]}>
          {/* 왼쪽: 캘린더 및 가이드 */}
          <SpaceBetween size="l">
            <Container
              header={
                <Header variant="h2">
                  {t('calendar_select_date')}
                </Header>
              }
            >
              <Calendar
                value={selectedDate}
                onChange={({ detail }) => handleDateSelect(detail.value)}
                locale={t('locale')}
                startOfWeek={0}
                isDateEnabled={() => true}
                i18nStrings={{
                  todayAriaLabel: t('calendar_today'),
                  previousMonthAriaLabel: t('calendar_previous_month'),
                  nextMonthAriaLabel: t('calendar_next_month')
                }}
                ariaLabelledby="calendar-heading"
              />
              
              {/* 교육 일정 가이드 */}
              <Container
                header={<Header variant="h3">{t('calendar_guide')}</Header>}
              >
                <SpaceBetween size="s">
                  <Box padding="s">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: '#0972d3',
                        marginRight: '8px'
                      }} />
                      <Box color="text-body-secondary" fontSize="body-m">
                        {t('calendar_dates_with_courses')}
                      </Box>
                    </div>
                  </Box>
                  
                  <Box color="text-body-secondary" fontSize="body-m" padding="s">
                    {selectedDate
                      ? (coursesData[selectedDate]
                        ? t('calendar_courses_found', { count: coursesData[selectedDate].length })
                        : t('calendar_no_courses_found'))
                      : t('calendar_select_date_to_view')
                    }
                  </Box>
                </SpaceBetween>
              </Container>
            </Container>
          </SpaceBetween>

          {/* 오른쪽: 교육 과정 목록 및 관리 */}
          <Container
            header={
              <Header
                variant="h2"
                actions={
                  <Button
                    variant="primary"
                    iconName="add-plus"
                    disabled={!selectedDate}
                    onClick={handleOpenAddCourseModal}
                  >
                    {t('calendar_add_course')}
                  </Button>
                }
              >
                {selectedDate
                  ? t('calendar_courses_for_date', { date: selectedDate })
                  : t('calendar_select_date')}
              </Header>
            }
          >
            {selectedDate ? (
              coursesForSelectedDate.length > 0 ? (
                <Table
                  items={coursesForSelectedDate}
                  columnDefinitions={[
                    {
                      id: "title",
                      header: t('calendar_course_title'),
                      cell: item => item.title,
                      sortingField: "title"
                    },
                    {
                      id: "instructor",
                      header: t('calendar_instructor'),
                      cell: item => item.instructor
                    },
                    {
                      id: "time",
                      header: t('calendar_time'),
                      cell: item => item.time
                    },
                    {
                      id: "type",
                      header: t('calendar_course_type'),
                      cell: item => (
                        <StatusIndicator type={item.type === '온라인' ? 'info' : 'success'}>
                          {item.type}
                        </StatusIndicator>
                      )
                    },
                    {
                      id: "level",
                      header: t('calendar_course_level'),
                      cell: item => (
                        <StatusIndicator type={
                          item.level === '초급' ? 'success' :
                          item.level === '중급' ? 'info' : 'warning'
                        }>
                          {item.level}
                        </StatusIndicator>
                      )
                    },
                    {
                      id: "seats",
                      header: t('calendar_seats'),
                      cell: item => `\${item.remainingSeats} / \${item.seats}`
                    },
                    {
                      id: "actions",
                      header: t('calendar_actions'),
                      cell: item => (
                        <SpaceBetween direction="horizontal" size="xs">
                          <Button
                            iconName="edit"
                            variant="icon"
                            ariaLabel={t('calendar_edit_course')}
                            onClick={() => handleOpenEditCourseModal(item)}
                          />
                          <Button
                            iconName="remove"
                            variant="icon"
                            ariaLabel={t('calendar_delete_course')}
                            onClick={() => handleOpenDeleteModal(item.id)}
                          />
                        </SpaceBetween>
                      )
                    }
                  ]}
                  loadingText={t('loading')}
                  empty={
                    <Box textAlign="center" color="text-body-secondary" padding="l">
                      <h3>{t('calendar_no_courses')}</h3>
                      <p>{t('calendar_add_course_prompt')}</p>
                    </Box>
                  }
                  header={
                    <Header
                      counter={`(\${coursesForSelectedDate.length})`}
                    >
                      {t('calendar_courses_list')}
                    </Header>
                  }
                />
              ) : (
                <Box textAlign="center" color="text-body-secondary" padding="l">
                  <h3>{t('calendar_no_courses')}</h3>
                  <Button onClick={handleOpenAddCourseModal}>
                    {t('calendar_add_first_course')}
                  </Button>
                </Box>
              )
            ) : (
              <Box textAlign="center" color="text-body-secondary" padding="l">
                <h3>{t('calendar_please_select_date')}</h3>
                <p>{t('calendar_date_selection_prompt')}</p>
              </Box>
            )}
          </Container>
        </Grid>
      </Container>

      {/* 과정 추가/편집 모달 */}
      <Modal
        visible={isFormModalVisible}
        onDismiss={() => setIsFormModalVisible(false)}
        size="large"
        header={
          isEditMode 
            ? t('calendar_edit_course')
            : t('calendar_add_course')
        }
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setIsFormModalVisible(false)}>
                {t('cancel')}
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSaveCourse} 
                loading={loading}
                disabled={!currentCourse.title || !currentCourse.instructor}
              >
                {t('save')}
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="l">
          <FormField
            label={t('calendar_course_title')}
            description={t('calendar_course_title_desc')}
          >
            <Input
              value={currentCourse.title}
              onChange={({ detail }) => handleFormChange('title', detail.value)}
              placeholder={t('calendar_course_title_placeholder')}
            />
          </FormField>

          <FormField
            label={t('calendar_instructor')}
            description={t('calendar_instructor_desc')}
          >
            <Input
              value={currentCourse.instructor}
              onChange={({ detail }) => handleFormChange('instructor', detail.value)}
              placeholder={t('calendar_instructor_placeholder')}
            />
          </FormField>

          <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
            <FormField
              label={t('calendar_time')}
              description={t('calendar_time_desc')}
            >
              <Input
                value={currentCourse.time}
                onChange={({ detail }) => handleFormChange('time', detail.value)}
                placeholder={t('calendar_time_placeholder')}
              />
            </FormField>

            <FormField
              label={t('calendar_course_type')}
              description={t('calendar_course_type_desc')}
            >
              <Select
                selectedOption={{ label: currentCourse.type, value: currentCourse.type }}
                onChange={({ detail }) => 
                  handleFormChange('type', detail.selectedOption.value)
                }
                options={courseTypeOptions}
              />
            </FormField>

            <FormField
              label={t('calendar_course_level')}
              description={t('calendar_course_level_desc')}
            >
              <Select
                selectedOption={{ label: currentCourse.level, value: currentCourse.level }}
                onChange={({ detail }) => 
                  handleFormChange('level', detail.selectedOption.value)
                }
                options={courseLevelOptions}
              />
            </FormField>
          </Grid>

          <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
            <FormField
              label={t('calendar_location')}
              description={t('calendar_location_desc')}
            >
              <Input
                value={currentCourse.location}
                onChange={({ detail }) => handleFormChange('location', detail.value)}
                placeholder={t('calendar_location_placeholder')}
              />
            </FormField>

            <FormField
              label={t('calendar_seats')}
              description={t('calendar_seats_desc')}
            >
              <Input
                type="number"
                value={currentCourse.seats.toString()}
                onChange={({ detail }) => {
                  const seats = parseInt(detail.value);
                  handleFormChange('seats', seats);
                  // 남은 좌석도 함께 업데이트
                  if (!isEditMode) {
                    handleFormChange('remainingSeats', seats);
                  }
                }}
              />
            </FormField>

            {isEditMode && (
              <FormField
                label={t('calendar_remaining_seats')}
                description={t('calendar_remaining_seats_desc')}
              >
                <Input
                  type="number"
                  value={currentCourse.remainingSeats.toString()}
                  onChange={({ detail }) => handleFormChange('remainingSeats', parseInt(detail.value))}
                />
              </FormField>
            )}
          </Grid>

          <FormField
            label={t('calendar_description')}
            description={t('calendar_description_desc')}
          >
            <Textarea
              value={currentCourse.description}
              onChange={({ detail }) => handleFormChange('description', detail.value)}
              rows={5}
              placeholder={t('calendar_description_placeholder')}
            />
          </FormField>
        </SpaceBetween>
      </Modal>

      {/* 삭제 확인 모달 */}
      <Modal
        visible={isDeleteModalVisible}
        onDismiss={() => setIsDeleteModalVisible(false)}
        size="small"
        header={t('calendar_confirm_delete')}
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setIsDeleteModalVisible(false)}>
                {t('cancel')}
              </Button>
              <Button 
                variant="primary" 
                onClick={handleDeleteCourse} 
                loading={loading}
              >
                {t('delete')}
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Box variant="span">
          {t('calendar_delete_confirmation')}
        </Box>
      </Modal>
    </SpaceBetween>
  );
};

export default CalendarManagementPage;