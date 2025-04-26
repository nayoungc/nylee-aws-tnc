// src/pages/admin/CalendarManagementPage.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation(['common', 'tnc', 'admin']);
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
    { label: '오프라인', value: '오프라인' },
    { label: '온라인', value: '온라인' }
  ];

  // 교육 과정 레벨 옵션
  const courseLevelOptions = [
    { label: '초급', value: '초급' },
    { label: '중급', value: '중급' },
    { label: '고급', value: '고급' }
  ];

  return (
    <SpaceBetween size="l">
      <Container
        header={
          <Header
            variant="h1"
            description={t('admin:calendar.management_description', '캘린더에 표시될 교육 과정을 추가, 수정 및 삭제합니다.')}
          >
            {t('admin:calendar.management_title', '교육 일정 관리')}
          </Header>
        }
      >
        <Grid gridDefinition={[{ colspan: 4 }, { colspan: 8 }]}>
          {/* 왼쪽: 캘린더 및 가이드 */}
          <SpaceBetween size="l">
            <Container
              header={
                <Header variant="h2">
                  {t('tnc:calendar.select_date', '날짜 선택')}
                </Header>
              }
            >
              <Calendar
                value={selectedDate}
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
              <Container
                header={<Header variant="h3">{t('admin:calendar.guide', '캘린더 가이드')}</Header>}
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
                        {t('tnc:calendar.dates_with_courses', '교육 과정이 있는 날짜')}
                      </Box>
                    </div>
                  </Box>
                  
                  <Box color="text-body-secondary" fontSize="body-m" padding="s">
                    {selectedDate
                      ? (coursesData[selectedDate]
                        ? t('tnc:calendar.courses_found', '{{count}}개 과정 찾음', { count: coursesData[selectedDate].length })
                        : t('tnc:calendar.no_courses_found', '과정 없음'))
                      : t('tnc:calendar.select_date_to_view', '날짜를 선택하여 과정 확인')
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
                    {t('admin:calendar.add_course', '과정 추가')}
                  </Button>
                }
              >
                {selectedDate
                  ? t('tnc:calendar.courses_for_date', '{{date}} 교육 과정', { date: selectedDate })
                  : t('tnc:calendar.select_date', '날짜를 선택하세요')}
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
                      header: t('admin:calendar.course_title', '과정명'),
                      cell: item => item.title,
                      sortingField: "title"
                    },
                    {
                      id: "instructor",
                      header: t('tnc:calendar.instructor', '강사'),
                      cell: item => item.instructor
                    },
                    {
                      id: "time",
                      header: t('tnc:calendar.time', '시간'),
                      cell: item => item.time
                    },
                    {
                      id: "type",
                      header: t('admin:calendar.course_type', '유형'),
                      cell: item => (
                        <StatusIndicator type={item.type === '온라인' ? 'info' : 'success'}>
                          {item.type}
                        </StatusIndicator>
                      )
                    },
                    {
                      id: "level",
                      header: t('admin:calendar.course_level', '레벨'),
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
                      header: t('admin:calendar.seats', '좌석'),
                      cell: item => `\${item.remainingSeats} / \${item.seats}`
                    },
                    {
                      id: "actions",
                      header: t('admin:calendar.actions', '작업'),
                      cell: item => (
                        <SpaceBetween direction="horizontal" size="xs">
                          <Button
                            iconName="edit"
                            variant="icon"
                            ariaLabel={t('admin:calendar.edit_course', '과정 편집')}
                            onClick={() => handleOpenEditCourseModal(item)}
                          />
                          <Button
                            iconName="remove"
                            variant="icon"
                            ariaLabel={t('admin:calendar.delete_course', '과정 삭제')}
                            onClick={() => handleOpenDeleteModal(item.id)}
                          />
                        </SpaceBetween>
                      )
                    }
                  ]}
                  loadingText={t('common:loading', '로딩 중...')}
                  empty={
                    <Box textAlign="center" color="text-body-secondary" padding="l">
                      <h3>{t('tnc:calendar.no_courses', '해당 날짜에 예정된 교육 과정이 없습니다')}</h3>
                      <p>{t('admin:calendar.add_course_prompt', '새 교육 과정을 추가해보세요.')}</p>
                    </Box>
                  }
                  header={
                    <Header
                      counter={`(\${coursesForSelectedDate.length})`}
                    >
                      {t('admin:calendar.courses_list', '교육 과정 목록')}
                    </Header>
                  }
                />
              ) : (
                <Box textAlign="center" color="text-body-secondary" padding="l">
                  <h3>{t('tnc:calendar.no_courses', '해당 날짜에 예정된 교육 과정이 없습니다')}</h3>
                  <Button onClick={handleOpenAddCourseModal}>
                    {t('admin:calendar.add_first_course', '첫 교육 과정 추가하기')}
                  </Button>
                </Box>
              )
            ) : (
              <Box textAlign="center" color="text-body-secondary" padding="l">
                <h3>{t('tnc:calendar.please_select_date', '왼쪽 캘린더에서 날짜를 선택하세요')}</h3>
                <p>{t('admin:calendar.date_selection_prompt', '날짜를 선택하면 해당 날짜의 교육 과정을 관리할 수 있습니다.')}</p>
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
            ? t('admin:calendar.edit_course', '교육 과정 편집') 
            : t('admin:calendar.add_course', '새 교육 과정 추가')
        }
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setIsFormModalVisible(false)}>
                {t('common:cancel', '취소')}
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSaveCourse} 
                loading={loading}
                disabled={!currentCourse.title || !currentCourse.instructor}
              >
                {t('common:save', '저장')}
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="l">
          <FormField
            label={t('admin:calendar.course_title', '과정명')}
            description={t('admin:calendar.course_title_desc', '교육 과정의 정식 이름을 입력해주세요.')}
          >
            <Input
              value={currentCourse.title}
              onChange={({ detail }) => handleFormChange('title', detail.value)}
              placeholder={t('admin:calendar.course_title_placeholder', '예: AWS 아키텍처 설계 기초')}
            />
          </FormField>

          <FormField
            label={t('tnc:calendar.instructor', '강사')}
            description={t('admin:calendar.instructor_desc', '강의를 진행할 강사의 이름을 입력해주세요.')}
          >
            <Input
              value={currentCourse.instructor}
              onChange={({ detail }) => handleFormChange('instructor', detail.value)}
              placeholder={t('admin:calendar.instructor_placeholder', '예: 김철수')}
            />
          </FormField>

          <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
            <FormField
              label={t('tnc:calendar.time', '시간')}
              description={t('admin:calendar.time_desc', '교육 시작 및 종료 시간')}
            >
              <Input
                value={currentCourse.time}
                onChange={({ detail }) => handleFormChange('time', detail.value)}
                placeholder={t('admin:calendar.time_placeholder', '예: 10:00 - 16:00')}
              />
            </FormField>

            <FormField
              label={t('admin:calendar.course_type', '유형')}
              description={t('admin:calendar.course_type_desc', '교육 진행 방식')}
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
              label={t('admin:calendar.course_level', '레벨')}
              description={t('admin:calendar.course_level_desc', '교육 난이도')}
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
              label={t('admin:calendar.location', '장소')}
              description={t('admin:calendar.location_desc', '교육 진행 장소')}
            >
              <Input
                value={currentCourse.location}
                onChange={({ detail }) => handleFormChange('location', detail.value)}
                placeholder={t('admin:calendar.location_placeholder', '예: 강남 교육센터')}
              />
            </FormField>

            <FormField
              label={t('admin:calendar.seats', '총 좌석 수')}
              description={t('admin:calendar.seats_desc', '수용 가능한 최대 인원')}
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
                label={t('admin:calendar.remaining_seats', '남은 좌석 수')}
                description={t('admin:calendar.remaining_seats_desc', '현재 예약 가능한 좌석')}
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
            label={t('admin:calendar.description', '설명')}
            description={t('admin:calendar.description_desc', '교육 과정에 대한 상세 설명')}
          >
            <Textarea
              value={currentCourse.description}
              onChange={({ detail }) => handleFormChange('description', detail.value)}
              rows={5}
              placeholder={t('admin:calendar.description_placeholder', '교육 과정에 대한 설명을 입력하세요...')}
            />
          </FormField>
        </SpaceBetween>
      </Modal>

      {/* 삭제 확인 모달 */}
      <Modal
        visible={isDeleteModalVisible}
        onDismiss={() => setIsDeleteModalVisible(false)}
        size="small"
        header={t('admin:calendar.confirm_delete', '삭제 확인')}
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setIsDeleteModalVisible(false)}>
                {t('common:cancel', '취소')}
              </Button>
              <Button 
                variant="primary" 
                onClick={handleDeleteCourse} 
                loading={loading}
              >
                {t('common:delete', '삭제')}
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Box variant="span">
          {t('admin:calendar.delete_confirmation', '정말로 이 교육 과정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')}
        </Box>
      </Modal>
    </SpaceBetween>
  );
};

export default CalendarManagementPage;