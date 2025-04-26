// src/components/admin/EventDetailsModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal, Box, SpaceBetween, Button, FormField,
  Input, Textarea, Select, DatePicker, TimeInput
} from '@cloudscape-design/components';
import { useTranslation } from 'react-i18next';
import { schema } from '../../../amplify/data/resource';

type Course = typeof schema.CourseEvent;
type Instructor = typeof schema.Instructor;
type Location = typeof schema.Location;

interface EventDetailsModalProps {
  event: Course | null;
  instructors: Instructor[];
  locations: Location[];
  onSave: (eventData: any) => void;
  onClose: () => void;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ 
  event, 
  instructors, 
  locations, 
  onSave, 
  onClose 
}) => {
  const { t } = useTranslation(['calendar', 'common']);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    instructorId: '',
    locationId: '',
    type: 'offline',
    level: 'beginner',
    maxSeats: 20,
    status: 'scheduled'
  });

  // 이벤트 데이터로 폼 초기화
  useEffect(() => {
    if (event) {
      setFormData({
        id: event.id,
        title: event.title,
        description: event.description || '',
        startDate: event.startDate,
        endDate: event.endDate,
        instructorId: event.instructorId,
        locationId: event.locationId,
        type: event.type,
        level: event.level,
        maxSeats: event.maxSeats,
        status: event.status
      });
    } else {
      // 새 이벤트 기본값 설정
      const startDate = new Date();
      startDate.setHours(9, 0, 0, 0);
      
      const endDate = new Date();
      endDate.setHours(17, 0, 0, 0);
      
      setFormData({
        id: '',
        title: '',
        description: '',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        instructorId: '',
        locationId: '',
        type: 'offline',
        level: 'beginner',
        maxSeats: 20,
        status: 'scheduled'
      });
    }
  }, [event]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  // 날짜/시간 처리 헬퍼 함수
  const formatDateForInput = (isoString: string) => {
    return isoString.split('T')[0];
  };

  const formatTimeForInput = (isoString: string) => {
    const date = new Date(isoString);
    return `\${date.getHours().toString().padStart(2, '0')}:\${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const combineDateAndTime = (dateString: string, timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date(dateString);
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
  };

  return (
    <Modal
      visible={true}
      onDismiss={onClose}
      header={event ? t('calendar:modal.edit_title') : t('calendar:modal.create_title')}
      size="large"
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onClose}>{t('common:cancel')}</Button>
            <Button variant="primary" onClick={handleSubmit}>{t('common:save')}</Button>
          </SpaceBetween>
        </Box>
      }
    >
      <SpaceBetween size="l">
        <FormField label={t('calendar:fields.title')}>
          <Input
            value={formData.title}
            onChange={e => handleChange('title', e.detail.value)}
          />
        </FormField>
        
        <FormField label={t('calendar:fields.description')}>
          <Textarea
            value={formData.description}
            onChange={e => handleChange('description', e.detail.value)}
          />
        </FormField>
        
        <SpaceBetween direction="horizontal" size="xs">
          <FormField label={t('calendar:fields.start_date')}>
            <DatePicker
              value={formatDateForInput(formData.startDate)}
              onChange={e => {
                const newDate = combineDateAndTime(
                  e.detail.value, 
                  formatTimeForInput(formData.startDate)
                );
                handleChange('startDate', newDate);
              }}
            />
          </FormField>
          
          <FormField label={t('calendar:fields.start_time')}>
            <TimeInput
              value={formatTimeForInput(formData.startDate)}
              onChange={e => {
                const newTime = combineDateAndTime(
                  formatDateForInput(formData.startDate),
                  e.detail.value
                );
                handleChange('startDate', newTime);
              }}
            />
          </FormField>
        </SpaceBetween>
        
        {/* 다른 필드들도 비슷하게 구현 */}
        
        <FormField label={t('calendar:fields.instructor')}>
          <Select
            selectedOption={{ 
              value: formData.instructorId,
              label: instructors.find(i => i.id === formData.instructorId)?.name || t('calendar:dropdown.select_instructor')
            }}
            onChange={e => handleChange('instructorId', e.detail.selectedOption.value)}
            options={instructors.map(instructor => ({
              value: instructor.id,
              label: instructor.name
            }))}
          />
        </FormField>
        
        <FormField label={t('calendar:fields.type')}>
          <Select
            selectedOption={{
              value: formData.type,
              label: t(`calendar:course_types.\${formData.type}`)
            }}
            onChange={e => handleChange('type', e.detail.selectedOption.value)}
            options={[
              { value: 'online', label: t('calendar:course_types.online') },
              { value: 'offline', label: t('calendar:course_types.offline') }
            ]}
          />
        </FormField>
      </SpaceBetween>
    </Modal>
  );
};

export default EventDetailsModal;