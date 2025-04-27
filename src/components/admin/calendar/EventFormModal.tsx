// src/components/Calendar/EventFormModal.tsx (수정된 부분)
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Checkbox,
  DatePicker,
  Form,
  FormField,
  Input,
  Modal,
  Select,
  SelectProps,
  SpaceBetween,
  TagEditor,
  Textarea,
  TimeInput // TimeInput 추가
} from '@cloudscape-design/components';
import { CalendarEvent, CalendarInput, EventType } from '@/models/calendar';
import { useAppTranslation } from '@/hooks/useAppTranslation';

interface EventFormModalProps {
  event?: CalendarEvent | null;
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (data: Partial<CalendarInput>) => void;
}

function EventFormModal({ 
    event, 
    visible, 
    onDismiss, 
    onSubmit 
  }: EventFormModalProps): JSX.Element {
    const { t } = useAppTranslation();
    const [formData, setFormData] = useState<Partial<CalendarInput>>({
    date: '',
    title: '',
    title_ko: '',
    title_en: '',
    startTime: '',
    endTime: '',
    location: '',
    location_ko: '',
    location_en: '',
    instructorName: '',
    instructorId: '',
    maxAttendees: 30,
    currentAttendees: 0,
    eventType: 'CLASS',
    isRegistrationOpen: true,
    tags: [],
    description: '',
    description_ko: '',
    description_en: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // 이벤트가 제공된 경우 폼 데이터 초기화
  useEffect(() => {
    if (event) {
      setFormData({
        date: event.date,
        title: event.title,
        title_ko: event.title_ko || '',
        title_en: event.title_en || '',
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        location_ko: event.location_ko || '',
        location_en: event.location_en || '',
        instructorName: event.instructorName,
        instructorId: event.instructorId || '',
        maxAttendees: event.maxAttendees,
        currentAttendees: event.currentAttendees,
        eventType: event.eventType,
        isRegistrationOpen: event.isRegistrationOpen !== false,
        tags: event.tags || [],
        description: event.description || '',
        description_ko: event.description_ko || '',
        description_en: event.description_en || ''
      });
    } else {
      // 새 이벤트일 경우 기본값 설정
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        date: today,
        title: '',
        title_ko: '',
        title_en: '',
        startTime: '09:00',
        endTime: '17:00',
        location: '',
        location_ko: '',
        location_en: '',
        instructorName: '',
        instructorId: '',
        maxAttendees: 30,
        currentAttendees: 0,
        eventType: 'CLASS',
        isRegistrationOpen: true,
        tags: [],
        description: '',
        description_ko: '',
        description_en: ''
      });
    }
    
    // 에러 초기화
    setErrors({});
  }, [event, visible]);
  
  // 유효성 검사
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title) newErrors.title = t('event_form_error_title');
    if (!formData.date) newErrors.date = t('event_form_error_date');
    if (!formData.startTime) newErrors.startTime = t('event_form_error_start_time');
    if (!formData.endTime) newErrors.endTime = t('event_form_error_end_time');
    if (!formData.location) newErrors.location = t('event_form_error_location');
    if (!formData.instructorName) newErrors.instructorName = t('event_form_error_instructor');
    if (!formData.maxAttendees || formData.maxAttendees <= 0) {
      newErrors.maxAttendees = t('event_form_error_max_attendees');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 이벤트 핸들러
  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleEventTypeChange = (event: { detail: SelectProps.ChangeDetail }) => {
    setFormData(prev => ({ 
      ...prev, 
      eventType: event.detail.selectedOption.value as EventType 
    }));
  };
  
  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      header={event ? t('event_modal_edit_title') : t('event_modal_create_title')}
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onDismiss}>
              {t('cancel')}
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {event ? t('save') : t('create')}
            </Button>
          </SpaceBetween>
        </Box>
      }
      size="large"
    >
      <Form>
        <SpaceBetween size="l">
          <FormField
            label={t('event_field_title')}
            errorText={errors.title}
          >
            <Input
              value={formData.title || ''}
              onChange={({ detail }) => 
                setFormData(prev => ({ ...prev, title: detail.value }))
              }
            />
          </FormField>
          
          {/* date input을 DatePicker로 변경 */}
          <FormField
            label={t('event_field_date')}
            errorText={errors.date}
          >
            <DatePicker
              value={formData.date || ''}
              onChange={({ detail }) => 
                setFormData(prev => ({ ...prev, date: detail.value }))
              }
              placeholder="YYYY/MM/DD"
            />
          </FormField>
          
          <SpaceBetween direction="horizontal" size="xs">
            {/* time input을 TimeInput으로 변경 */}
            <FormField
              label={t('event_field_start_time')}
              errorText={errors.startTime}
            >
              <TimeInput
                value={formData.startTime || ''}
                onChange={({ detail }) => 
                  setFormData(prev => ({ ...prev, startTime: detail.value }))
                }
              />
            </FormField>
            
            <FormField
              label={t('event_field_end_time')}
              errorText={errors.endTime}
            >
              <TimeInput
                value={formData.endTime || ''}
                onChange={({ detail }) => 
                  setFormData(prev => ({ ...prev, endTime: detail.value }))
                }
              />
            </FormField>
          </SpaceBetween>
          
          <FormField
            label={t('event_field_tags')}
          >
            <TagEditor
              i18nStrings={{
                keyHeader: t('tag_key'),
                valueHeader: t('tag_value'),
                addButton: t('tag_add'),
                removeButton: t('tag_remove'),
                undoButton: t('tag_undo'),
                undoPrompt: t('tag_undo_prompt'),
                loading: t('tag_loading'),
                keyPlaceholder: t('tag_key_placeholder'),
                valuePlaceholder: t('tag_value_placeholder'),
                emptyTags: t('tag_empty'),
              }}
              tags={formData.tags?.map(tag => ({
                key: tag,
                value: "", // 필수 필드 추가
                existing: true // 필수 필드 추가
              })) || []}
              onChange={({ detail }) => 
                setFormData(prev => ({ 
                  ...prev, 
                  tags: detail.tags.map(tag => tag.key) 
                }))
              }
            />
          </FormField>
          
          <FormField
            label={t('event_field_instructor')}
            errorText={errors.instructorName}
          >
            <Input
              value={formData.instructorName || ''}
              onChange={({ detail }) => 
                setFormData(prev => ({ ...prev, instructorName: detail.value }))
              }
            />
          </FormField>
          
          <SpaceBetween direction="horizontal" size="xs">
            <FormField
              label={t('event_field_max_attendees')}
              errorText={errors.maxAttendees}
            >
              <Input
                type="number"
                value={formData.maxAttendees?.toString() || ''}
                onChange={({ detail }) => 
                  setFormData(prev => ({ 
                    ...prev, 
                    maxAttendees: parseInt(detail.value) || 0 
                  }))
                }
              />
            </FormField>
            
            <FormField
              label={t('event_field_current_attendees')}
            >
              <Input
                type="number"
                value={formData.currentAttendees?.toString() || '0'}
                onChange={({ detail }) => 
                  setFormData(prev => ({ 
                    ...prev, 
                    currentAttendees: parseInt(detail.value) || 0 
                  }))
                }
              />
            </FormField>
          </SpaceBetween>
          
        
          <FormField
            label={t('event_field_description')}
          >
            <Textarea
              value={formData.description || ''}
              onChange={({ detail }) => 
                setFormData(prev => ({ ...prev, description: detail.value }))
              }
              rows={5}
            />
          </FormField>
          
          <FormField>
            <Checkbox
              checked={formData.isRegistrationOpen === true}
              onChange={({ detail }) => 
                setFormData(prev => ({ ...prev, isRegistrationOpen: detail.checked }))
              }
            >
              {t('event_field_allow_registration')}
            </Checkbox>
          </FormField>

          <Box variant="h4">{t('event_field_multilanguage')}</Box>
          
          <FormField label={t('event_field_title_ko')}>
            <Input
              value={formData.title_ko || ''}
              onChange={({ detail }) => 
                setFormData(prev => ({ ...prev, title_ko: detail.value }))
              }
            />
          </FormField>
          
          <FormField label={t('event_field_title_en')}>
            <Input
              value={formData.title_en || ''}
              onChange={({ detail }) => 
                setFormData(prev => ({ ...prev, title_en: detail.value }))
              }
            />
          </FormField>

          <FormField label={t('event_field_location_ko')}>
            <Input
              value={formData.location_ko || ''}
              onChange={({ detail }) => 
                setFormData(prev => ({ ...prev, location_ko: detail.value }))
              }
            />
          </FormField>
          
          <FormField label={t('event_field_location_en')}>
            <Input
              value={formData.location_en || ''}
              onChange={({ detail }) => 
                setFormData(prev => ({ ...prev, location_en: detail.value }))
              }
            />
          </FormField>
          
          <FormField label={t('event_field_description_ko')}>
            <Textarea
              value={formData.description_ko || ''}
              onChange={({ detail }) => 
                setFormData(prev => ({ ...prev, description_ko: detail.value }))
              }
              rows={3}
            />
          </FormField>
          
          <FormField label={t('event_field_description_en')}>
            <Textarea
              value={formData.description_en || ''}
              onChange={({ detail }) => 
                setFormData(prev => ({ ...prev, description_en: detail.value }))
              }
              rows={3}
            />
          </FormField>
        </SpaceBetween>
      </Form>
    </Modal>
  );
}

export default EventFormModal;