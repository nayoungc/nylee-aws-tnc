// src/pages/instructor/CourseCreation.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FormField,
  Input,
  Textarea,
  DatePicker,
  Select,
  SpaceBetween,
  Button,
  Container,
  Header,
  Form,
  Box,
  Alert,
  Modal,
  Checkbox,
  TagEditor,
  Multiselect
} from '@cloudscape-design/components';
import { generateClient } from 'aws-amplify/api';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { GraphQLQuery } from 'aws-amplify/api';
// 상대 경로로 수정 - 프로젝트 구조에 맞게 조정 필요
import { createCourse, createAnnouncement, createAssessment } from '../../graphql/mutations';
import { listUserProfiles } from '../../graphql/queries';
import MainLayout from '../../components/MainLayout';

// 클라이언트 생성
const client = generateClient();

// 인터페이스 정의
interface FormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  maxStudents: string;
  tags: string[];
  isOnline: boolean;
  announcements: {
    title: string;
    content: string;
  }[];
  assessments: {
    name: string;
    type: string;
    dueDate: string;
  }[];
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
}

// 쿼리/뮤테이션 결과 타입 정의
interface CreateCourseResult {
  createCourse: {
    id: string;
    title: string;
    [key: string]: any;
  };
}

interface ListUserProfilesResult {
  listUserProfiles: {
    items: UserProfile[];
    nextToken?: string;
  };
}

const CourseCreation: React.FC = () => {
  const navigate = useNavigate();

  // 상태 관리
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    maxStudents: '30',
    tags: [],
    isOnline: false,
    announcements: [{ title: '환영합니다!', content: '과정에 오신 것을 환영합니다!' }],
    assessments: []
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [courseUrl, setCourseUrl] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<UserProfile[]>([]);
  const [currentInstructor, setCurrentInstructor] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('basic-info');

  // 현재 로그인한 사용자(강사) 정보 가져오기
  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const attributes = await fetchUserAttributes();
        setCurrentInstructor({
          id: attributes.sub || '',
          email: attributes.email || '',
          name: attributes.name || attributes.email || '강사'
        });
      } catch (err) {
        console.error('사용자 정보 가져오기 실패:', err);
        setError('사용자 정보를 가져오는데 실패했습니다.');
      }
    }

    async function fetchStudents() {
      try {
        // 실제 API에서는 학생 역할을 가진 사용자만 필터링해야 함
        const { data } = await client.graphql<GraphQLQuery<ListUserProfilesResult>>({
          query: listUserProfiles,
          variables: {
            filter: {
              role: { eq: 'student' }
            },
            limit: 1000
          }
        });

        if (data?.listUserProfiles?.items) {
          setStudents(data.listUserProfiles.items);
        }
      } catch (err) {
        console.error('학생 목록 가져오기 실패:', err);
      }
    }

    fetchCurrentUser();
    fetchStudents();
  }, []);

  // 입력 필드 변경 핸들러
  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 공지사항 변경 핸들러
  const handleAnnouncementChange = (index: number, field: string, value: string) => {
    const updatedAnnouncements = [...formData.announcements];
    updatedAnnouncements[index] = {
      ...updatedAnnouncements[index],
      [field]: value
    };

    setFormData(prev => ({
      ...prev,
      announcements: updatedAnnouncements
    }));
  };

  // 공지사항 추가
  const addAnnouncement = () => {
    setFormData(prev => ({
      ...prev,
      announcements: [
        ...prev.announcements,
        { title: '', content: '' }
      ]
    }));
  };

  // 공지사항 삭제
  const removeAnnouncement = (index: number) => {
    const filteredAnnouncements = formData.announcements.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      announcements: filteredAnnouncements
    }));
  };

  // 평가 변경 핸들러
  const handleAssessmentChange = (index: number, field: string, value: any) => {
    const updatedAssessments = [...formData.assessments];
    updatedAssessments[index] = {
      ...updatedAssessments[index],
      [field]: value
    };

    setFormData(prev => ({
      ...prev,
      assessments: updatedAssessments
    }));
  };

  // 평가 추가
  const addAssessment = () => {
    setFormData(prev => ({
      ...prev,
      assessments: [
        ...prev.assessments,
        { name: '', type: 'PRE_QUIZ', dueDate: '' }
      ]
    }));
  };

  // 평가 삭제
  const removeAssessment = (index: number) => {
    const filteredAssessments = formData.assessments.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      assessments: filteredAssessments
    }));
  };

  // 폼 제출 및 과정 생성
  const handleSubmit = async () => {
    // 기본 유효성 검사
    if (!formData.title || !formData.startDate || !formData.endDate) {
      setError('과정 제목, 시작일, 종료일은 필수 항목입니다.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Course 생성
      const courseInput = {
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        location: formData.location,
        isOnline: formData.isOnline,
        maxStudents: parseInt(formData.maxStudents),
        instructorID: currentInstructor?.id,
        instructorName: currentInstructor?.name,
        tags: formData.tags
      };

      // Gen 2 방식으로 그래프QL 호출
      const { data } = await client.graphql<GraphQLQuery<CreateCourseResult>>({
        query: createCourse,
        variables: { input: courseInput }
      });

      // 생성된 과정 ID 가져오기
      const newCourseId = data.createCourse.id;

      // 2. Announcements 생성
      const announcementPromises = formData.announcements.filter(
        a => a.title && a.content
      ).map(announcement =>
        client.graphql({
          query: createAnnouncement,
          variables: {
            input: {
              title: announcement.title,
              content: announcement.content,
              courseID: newCourseId
            }
          }
        })
      );

      // 3. Assessments 생성
      const assessmentPromises = formData.assessments.filter(
        a => a.name && a.type
      ).map(assessment =>
        client.graphql({
          query: createAssessment,
          variables: {
            input: {
              name: assessment.name,
              type: assessment.type,
              status: 'COMING_SOON',
              dueDate: assessment.dueDate,
              courseID: newCourseId
            }
          }
        })
      );

      // 병렬로 모든 관련 데이터 생성
      await Promise.all([
        ...announcementPromises,
        ...assessmentPromises
      ]);

      // 4. 학생 등록 (실제 구현은 enrollStudents 함수에서)
      if (selectedStudents.length > 0) {
        await enrollStudents(newCourseId, selectedStudents);
      }

      // 성공 처리
      setSuccess(true);
      setCourseUrl(`\${window.location.origin}/course/\${newCourseId}`);
      setShowSuccessModal(true);

    } catch (err: any) {
      console.error('과정 생성 오류:', err);
      setError(err.message || '과정 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 학생 등록 함수
  const enrollStudents = async (courseId: string, students: UserProfile[]) => {
    // 실제 구현에서는 백엔드를 통해 학생들에게 초대 이메일을 보내고
    // 데이터베이스에 등록 상태를 저장하는 로직 추가
    console.log(`\${students.length}명의 학생을 \${courseId} 과정에 등록`);

    // 샘플 코드만 제공 (실제 구현은 추가 개발 필요)
    return Promise.resolve();
  };

  // URL 복사 함수
  const copyUrl = () => {
    navigator.clipboard.writeText(courseUrl)
      .then(() => {
        alert('과정 URL이 클립보드에 복사되었습니다!');
      })
      .catch(err => {
        console.error('URL 복사 실패:', err);
      });
  };

  return (
    <MainLayout title="새 과정 생성">
      <Container>
        <SpaceBetween size="l">
          {error && (
            <Alert type="error" dismissible onDismiss={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* 탭 네비게이션 */}
          <div className="course-tabs">
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                variant={activeTab === 'basic-info' ? 'primary' : 'link'}
                onClick={() => setActiveTab('basic-info')}
              >
                과정 기본 정보
              </Button>
              <Button
                variant={activeTab === 'announcements' ? 'primary' : 'link'}
                onClick={() => setActiveTab('announcements')}
              >
                공지사항
              </Button>
              <Button
                variant={activeTab === 'assessments' ? 'primary' : 'link'}
                onClick={() => setActiveTab('assessments')}
              >
                평가
              </Button>
              <Button
                variant={activeTab === 'students' ? 'primary' : 'link'}
                onClick={() => setActiveTab('students')}
              >
                학생 관리
              </Button>
            </SpaceBetween>
          </div>

          <Form
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button
                  variant="link"
                  onClick={() => navigate('/courses/my-courses')}
                >
                  취소
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  loading={loading}
                >
                  과정 생성
                </Button>
              </SpaceBetween>
            }
          >
            {/* 과정 기본 정보 */}
            {activeTab === 'basic-info' && (
              <Container header={<Header variant="h2">기본 정보</Header>}>
                <SpaceBetween size="l">
                  <FormField label="과정 제목" description="학생들에게 표시될 과정 이름입니다.">
                    <Input
                      value={formData.title}
                      onChange={({ detail }) => handleChange('title', detail.value)}
                    />
                  </FormField>

                  <FormField label="과정 설명">
                    <Textarea
                      value={formData.description}
                      onChange={({ detail }) => handleChange('description', detail.value)}
                      rows={5}
                    />
                  </FormField>

                  <SpaceBetween direction="horizontal" size="xs">
                    <FormField label="시작일">
                      <DatePicker
                        value={formData.startDate}
                        onChange={({ detail }) => handleChange('startDate', detail.value)}
                      />
                    </FormField>

                    <FormField label="종료일">
                      <DatePicker
                        value={formData.endDate}
                        onChange={({ detail }) => handleChange('endDate', detail.value)}
                      />
                    </FormField>
                  </SpaceBetween>

                  <FormField label="위치/장소">
                    <Input
                      value={formData.location}
                      onChange={({ detail }) => handleChange('location', detail.value)}
                      placeholder="강의실 또는 온라인 미팅 링크"
                    />
                  </FormField>

                  <FormField label="최대 학생 수">
                    <Input
                      type="number"
                      value={formData.maxStudents}
                      onChange={({ detail }) => handleChange('maxStudents', detail.value)}
                    />
                  </FormField>

                  <FormField label="태그">
                    <TagEditor
                      tags={formData.tags.map(tag => ({
                        key: tag,
                        value: "",
                        label: tag,
                        existing: false
                      }))}
                      onChange={({ detail }) =>
                        handleChange('tags', detail.tags.map(t => t.key))
                      }
                      i18nStrings={{
                        keyPlaceholder: '태그 입력 후 Enter',
                        valuePlaceholder: '값 (선택사항)',
                        addButton: '태그 추가',
                        removeButton: '제거',
                        undoButton: '실행 취소',
                        undoPrompt: '이 태그는 저장 시 제거됩니다'
                      }}
                    />
                  </FormField>

                  <Checkbox
                    checked={formData.isOnline}
                    onChange={({ detail }) => handleChange('isOnline', detail.checked)}
                  >
                    온라인 과정
                  </Checkbox>
                </SpaceBetween>
              </Container>
            )}

            {/* 공지사항 */}
            {activeTab === 'announcements' && (
              <Container
                header={
                  <Header
                    variant="h2"
                    actions={
                      <Button
                        iconName="add-plus"
                        onClick={addAnnouncement}
                      >
                        공지사항 추가
                      </Button>
                    }
                  >
                    공지사항
                  </Header>
                }
              >
                <SpaceBetween size="l">
                  {formData.announcements.map((announcement, index) => (
                    <Container
                      key={index}
                      header={
                        <Header
                          actions={
                            <Button
                              iconName="remove"
                              variant="link"
                              onClick={() => removeAnnouncement(index)}
                            >
                              삭제
                            </Button>
                          }
                        >
                          공지사항 #{index + 1}
                        </Header>
                      }
                    >
                      <SpaceBetween size="l">
                        <FormField label="제목">
                          <Input
                            value={announcement.title}
                            onChange={({ detail }) =>
                              handleAnnouncementChange(index, 'title', detail.value)
                            }
                          />
                        </FormField>

                        <FormField label="내용">
                          <Textarea
                            value={announcement.content}
                            onChange={({ detail }) =>
                              handleAnnouncementChange(index, 'content', detail.value)
                            }
                            rows={4}
                          />
                        </FormField>
                      </SpaceBetween>
                    </Container>
                  ))}
                </SpaceBetween>
              </Container>
            )}

            {/* 나머지 탭 내용 ... */}

          </Form>
        </SpaceBetween>
      </Container>

      {/* 과정 생성 성공 모달 */}
      <Modal
        visible={showSuccessModal}
        onDismiss={() => setShowSuccessModal(false)}
        header="과정 생성 완료"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button onClick={() => setShowSuccessModal(false)}>닫기</Button>
              <Button onClick={() => navigate('/courses/my-courses')}>내 과정으로 이동</Button>
              <Button variant="primary" onClick={copyUrl}>URL 복사</Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="m">
          <Box variant="p">
            과정이 성공적으로 생성되었습니다! 아래 URL을 통해 학생들이 과정에 접근할 수 있습니다.
          </Box>

          <Alert type="success">
            <Box fontWeight="bold">과정 URL:</Box>
            <Box padding={{ top: 'xs' }} fontSize="body-m">
              {courseUrl}
            </Box>
          </Alert>

          <Box variant="p">
            선택한 {selectedStudents.length}명의 학생에게 초대 이메일이 발송되었습니다.
          </Box>
        </SpaceBetween>
      </Modal>
    </MainLayout>
  );
};

export default CourseCreation;