// src/components/CourseDetail.tsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetCourse, useDeleteCourse } from '../hooks/useCourseHooks';
import { 
  Container, Header, SpaceBetween, Button, 
  ColumnLayout, StatusIndicator, Box 
} from '@cloudscape-design/components';
import { i18n } from '../utils/i18n';

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { course, loading, error } = useGetCourse(courseId);
  const { deleteCourse, loading: deleteLoading } = useDeleteCourse();

  if (loading) {
    return <Box>{i18n.t('loading')}</Box>;
  }

  if (error) {
    return <Box>{i18n.t('errors.failedToLoadCourse')}: {error}</Box>;
  }

  if (!course) {
    return <Box>{i18n.t('courseNotFound')}</Box>;
  }

  const handleDelete = async () => {
    if (window.confirm(i18n.t('confirmDeleteCourse'))) {
      try {
        await deleteCourse(course.courseId);
        navigate('/courses');
      } catch (err) {
        console.error(i18n.t('errors.failedToDeleteCourse'), err);
      }
    }
  };

  return (
    <Container
      header={
        <Header
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button onClick={() => navigate(`/courses/\${course.courseId}/edit`)}>
                {i18n.t('edit')}
              </Button>
              <Button variant="danger" loading={deleteLoading} onClick={handleDelete}>
                {i18n.t('delete')}
              </Button>
            </SpaceBetween>
          }
        >
          {i18n.t('courseDetails')}
        </Header>
      }
    >
      <ColumnLayout columns={2} variant="text-grid">
        <div>
          <Box variant="awsui-key-label">{i18n.t('courseId')}</Box>
          <div>{course.courseId}</div>
        </div>
        <div>
          <Box variant="awsui-key-label">{i18n.t('startDate')}</Box>
          <div>{new Date(course.startDate).toLocaleDateString()}</div>
        </div>
        <div>
          <Box variant="awsui-key-label">{i18n.t('instructor')}</Box>
          <div>{course.instructor}</div>
        </div>
        <div>
          <Box variant="awsui-key-label">{i18n.t('location')}</Box>
          <div>{course.location || '-'}</div>
        </div>
        <div>
          <Box variant="awsui-key-label">{i18n.t('status')}</Box>
          <StatusIndicator type={getStatusType(course.status)}>
            {course.status || i18n.t('notAvailable')}
          </StatusIndicator>
        </div>
        <div>
          <Box variant="awsui-key-label">{i18n.t('attendance')}</Box>
          <div>{course.attendance || '-'}</div>
        </div>
        <div>
          <Box variant="awsui-key-label">{i18n.t('catalogId')}</Box>
          <div>{course.catalogId}</div>
        </div>
        <div>
          <Box variant="awsui-key-label">{i18n.t('customerId')}</Box>
          <div>{course.customerId}</div>
        </div>
        <div>
          <Box variant="awsui-key-label">{i18n.t('shareCode')}</Box>
          <div>{course.shareCode}</div>
        </div>
        <div>
          <Box variant="awsui-key-label">{i18n.t('duration')}</Box>
          <div>{course.durations || '-'}</div>
        </div>
      </ColumnLayout>
    </Container>
  );
};

// 상태에 따른 StatusIndicator 타입 반환
function getStatusType(status?: string): "success" | "warning" | "error" | "info" | "pending" {
  switch (status) {
    case 'scheduled': return 'pending';
    case 'inProgress': return 'info';
    case 'completed': return 'success';
    case 'cancelled': return 'error';
    default: return 'pending';
  }
}

export default CourseDetail;