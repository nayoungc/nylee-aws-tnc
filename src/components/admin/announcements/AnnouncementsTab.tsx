// src/components/admin/announcements/AnnouncementsTab.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Header,
  SpaceBetween,
  Table,
  TextFilter,
  Pagination,
  Modal,
  Form,
  FormField,
  Input,
  Textarea,
  Select,
  SelectProps,
  DatePicker,
  StatusIndicator,
  Badge
} from '@cloudscape-design/components';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import EnhancedTable from '@/components/common/EnhancedTable';

// 공지사항 인터페이스
interface Announcement {
  id: string;
  title: string;
  content: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// 샘플 데이터
const sampleAnnouncements: Announcement[] = [
  {
    id: '1',
    title: '시스템 점검 안내',
    content: '2025년 5월 1일 오전 2시부터 4시까지 시스템 점검이 있을 예정입니다.',
    status: 'PUBLISHED',
    priority: 'HIGH',
    startDate: '2025-04-28',
    endDate: '2025-05-02',
    createdAt: '2025-04-26T09:00:00Z',
    updatedAt: '2025-04-26T09:00:00Z',
    createdBy: '관리자'
  },
  {
    id: '2',
    title: '신규 과정 오픈 안내',
    content: 'AWS 클라우드 보안 고급 과정이 새롭게 오픈되었습니다.',
    status: 'PUBLISHED',
    priority: 'MEDIUM',
    startDate: '2025-04-25',
    endDate: '2025-05-25',
    createdAt: '2025-04-25T10:30:00Z',
    updatedAt: '2025-04-25T10:30:00Z',
    createdBy: '김교육'
  },
  {
    id: '3',
    title: '교육장 위치 변경 안내',
    content: '강남 교육장 위치가 변경되었습니다. 자세한 사항은 본문을 참조해주세요.',
    status: 'DRAFT',
    priority: 'MEDIUM',
    createdAt: '2025-04-23T14:20:00Z',
    updatedAt: '2025-04-23T15:45:00Z',
    createdBy: '이시설'
  }
];

const AnnouncementsTab: React.FC = () => {
  const { t } = useAppTranslation();
  const [announcements, setAnnouncements] = useState<Announcement[]>(sampleAnnouncements);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Announcement[]>([]);
  const [formData, setFormData] = useState<Partial<Announcement>>({
    title: '',
    content: '',
    status: 'DRAFT',
    priority: 'MEDIUM'
  });
  const [isLoading, setIsLoading] = useState(false);

  // 공지사항 생성
  const handleCreateAnnouncement = () => {
    const newAnnouncement: Announcement = {
      id: `ann-\${Date.now()}`,
      ...formData,
      status: formData.status || 'DRAFT',
      priority: formData.priority || 'MEDIUM',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: '현재 사용자'
    } as Announcement;

    setAnnouncements([...announcements, newAnnouncement]);
    setIsCreateModalVisible(false);
    resetForm();
  };

  // 공지사항 수정
  const handleUpdateAnnouncement = () => {
    if (!selectedAnnouncement) return;
    
    const updatedAnnouncements = announcements.map(item => 
      item.id === selectedAnnouncement.id 
        ? { ...selectedAnnouncement, ...formData, updatedAt: new Date().toISOString() } 
        : item
    );
    
    setAnnouncements(updatedAnnouncements);
    setIsEditModalVisible(false);
    setSelectedAnnouncement(null);
  };

  // 공지사항 삭제
  const handleDeleteAnnouncement = () => {
    if (!selectedAnnouncement) return;
    
    const filteredAnnouncements = announcements.filter(item => item.id !== selectedAnnouncement.id);
    setAnnouncements(filteredAnnouncements);
    setIsDeleteModalVisible(false);
    setSelectedAnnouncement(null);
  };

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      status: 'DRAFT',
      priority: 'MEDIUM',
      startDate: undefined,
      endDate: undefined
    });
  };

  // 편집 시작
  const handleEditClick = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      status: announcement.status,
      priority: announcement.priority,
      startDate: announcement.startDate,
      endDate: announcement.endDate
    });
    setIsEditModalVisible(true);
  };

  // 삭제 시작
  const handleDeleteClick = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsDeleteModalVisible(true);
  };

  // 상태 표시 컴포넌트
  const renderStatusIndicator = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <StatusIndicator type="success">{t('announcement_status_published')}</StatusIndicator>;
      case 'DRAFT':
        return <StatusIndicator type="pending">{t('announcement_status_draft')}</StatusIndicator>;
      case 'ARCHIVED':
        return <StatusIndicator type="stopped">{t('announcement_status_archived')}</StatusIndicator>;
      default:
        return <StatusIndicator type="info">{status}</StatusIndicator>;
    }
  };

  // 우선순위 표시 컴포넌트
  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return <Badge color="red">{t('announcement_priority_critical')}</Badge>;
      case 'HIGH':
        return <Badge color="green">{t('announcement_priority_high')}</Badge>;
      case 'MEDIUM':
        return <Badge color="blue">{t('announcement_priority_medium')}</Badge>;
      case 'LOW':
        return <Badge color="grey">{t('announcement_priority_low')}</Badge>;
      default:
        return priority;
    }
  };

  // 테이블 컬럼 정의
  const columnDefinitions = [
    {
      id: 'title',
      header: t('announcement_field_title'),
      cell: (item: Announcement) => item.title,
      sortingField: 'title',
    },
    {
      id: 'status',
      header: t('announcement_field_status'),
      cell: (item: Announcement) => renderStatusIndicator(item.status),
      sortingField: 'status',
    },
    {
      id: 'priority',
      header: t('announcement_field_priority'),
      cell: (item: Announcement) => renderPriorityBadge(item.priority),
      sortingField: 'priority',
    },
    {
      id: 'dateRange',
      header: t('announcement_field_date_range'),
      cell: (item: Announcement) => {
        if (item.startDate && item.endDate) {
          return `\${item.startDate} ~ \${item.endDate}`;
        } else if (item.startDate) {
          return `\${item.startDate} ~`;
        } else if (item.endDate) {
          return `~ \${item.endDate}`;
        }
        return '-';
      },
    },
    {
      id: 'updatedAt',
      header: t('announcement_field_updated_at'),
      cell: (item: Announcement) => new Date(item.updatedAt).toLocaleDateString(),
      sortingField: 'updatedAt',
    },
    {
      id: 'actions',
      header: t('field_actions'),
      cell: (item: Announcement) => (
        <SpaceBetween direction="horizontal" size="xs">
          <Button
            variant="link"
            onClick={() => handleEditClick(item)}
          >
            {t('edit')}
          </Button>
          <Button
            variant="link"
            onClick={() => handleDeleteClick(item)}
          >
            {t('delete')}
          </Button>
        </SpaceBetween>
      ),
    }
  ];

  return (
    <SpaceBetween size="l">
      <EnhancedTable
        title={t('announcements_title')}
        description={t('announcements_description')}
        columnDefinitions={columnDefinitions}
        items={announcements}
        loading={isLoading}
        selectionType="multi"
        selectedItems={selectedItems}
        onSelectionChange={setSelectedItems}
        actions={{
          primary: {
            text: t('announcement_action_create'),
            onClick: () => {
              resetForm();
              setIsCreateModalVisible(true);
            }
          }
        }}
        batchActions={[
          {
            text: t('actions_delete_selected'),
            onClick: () => {
              if (selectedItems.length === 1) {
                setSelectedAnnouncement(selectedItems[0]);
                setIsDeleteModalVisible(true);
              }
            },
            disabled: selectedItems.length !== 1
          }
        ]}
        filteringProperties={[
          { key: 'title', label: t('announcement_field_title') },
          { key: 'status', label: t('announcement_field_status') },
          { key: 'priority', label: t('announcement_field_priority') }
        ]}
        stickyHeader={true}
        stripedRows={true}
        defaultSortingColumn="updatedAt"
        emptyText={{
          title: t('empty_state_title'),
          subtitle: t('announcements_empty_message'),
          action: {
            text: t('announcement_action_create'),
            onClick: () => {
              resetForm();
              setIsCreateModalVisible(true);
            }
          }
        }}
      />

      {/* 공지사항 생성 모달 */}
      <Modal
        visible={isCreateModalVisible}
        onDismiss={() => setIsCreateModalVisible(false)}
        header={t('announcement_modal_create_title')}
        size="large"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setIsCreateModalVisible(false)}>
                {t('cancel')}
              </Button>
              <Button variant="primary" onClick={handleCreateAnnouncement}>
                {t('create')}
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Form>
          <SpaceBetween size="l">
            <FormField label={t('announcement_field_title')}>
              <Input
                value={formData.title || ''}
                onChange={({ detail }) => setFormData(prev => ({ ...prev, title: detail.value }))}
              />
            </FormField>

            <FormField label={t('announcement_field_content')}>
              <Textarea
                value={formData.content || ''}
                onChange={({ detail }) => setFormData(prev => ({ ...prev, content: detail.value }))}
                rows={8}
              />
            </FormField>

            <SpaceBetween direction="horizontal" size="xs">
              <FormField label={t('announcement_field_status')}>
                <Select
                  selectedOption={{
                    label: t(`announcement_status_\${formData.status?.toLowerCase()}`),
                    value: formData.status
                  }}
                  onChange={({ detail }) => setFormData(prev => ({ 
                    ...prev, 
                    status: detail.selectedOption.value as 'PUBLISHED' | 'DRAFT' | 'ARCHIVED' 
                  }))}
                  options={[
                    { label: t('announcement_status_draft'), value: 'DRAFT' },
                    { label: t('announcement_status_published'), value: 'PUBLISHED' },
                    { label: t('announcement_status_archived'), value: 'ARCHIVED' }
                  ]}
                />
              </FormField>

              <FormField label={t('announcement_field_priority')}>
                <Select
                  selectedOption={{
                    label: t(`announcement_priority_\${formData.priority?.toLowerCase()}`),
                    value: formData.priority
                  }}
                  onChange={({ detail }) => setFormData(prev => ({ 
                    ...prev, 
                    priority: detail.selectedOption.value as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' 
                  }))}
                  options={[
                    { label: t('announcement_priority_low'), value: 'LOW' },
                    { label: t('announcement_priority_medium'), value: 'MEDIUM' },
                    { label: t('announcement_priority_high'), value: 'HIGH' },
                    { label: t('announcement_priority_critical'), value: 'CRITICAL' }
                  ]}
                />
              </FormField>
            </SpaceBetween>

            <SpaceBetween direction="horizontal" size="xs">
              <FormField label={t('announcement_field_start_date')}>
                <DatePicker
                  value={formData.startDate || ''}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, startDate: detail.value }))}
                  placeholder="YYYY/MM/DD"
                />
              </FormField>

              <FormField label={t('announcement_field_end_date')}>
                <DatePicker
                  value={formData.endDate || ''}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, endDate: detail.value }))}
                  placeholder="YYYY/MM/DD"
                />
              </FormField>
            </SpaceBetween>
          </SpaceBetween>
        </Form>
      </Modal>

      {/* 공지사항 편집 모달 */}
      <Modal
        visible={isEditModalVisible}
        onDismiss={() => setIsEditModalVisible(false)}
        header={t('announcement_modal_edit_title')}
        size="large"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setIsEditModalVisible(false)}>
                {t('cancel')}
              </Button>
              <Button variant="primary" onClick={handleUpdateAnnouncement}>
                {t('save')}
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Form>
          <SpaceBetween size="l">
            <FormField label={t('announcement_field_title')}>
              <Input
                value={formData.title || ''}
                onChange={({ detail }) => setFormData(prev => ({ ...prev, title: detail.value }))}
              />
            </FormField>

            <FormField label={t('announcement_field_content')}>
              <Textarea
                value={formData.content || ''}
                onChange={({ detail }) => setFormData(prev => ({ ...prev, content: detail.value }))}
                rows={8}
              />
            </FormField>

            <SpaceBetween direction="horizontal" size="xs">
              <FormField label={t('announcement_field_status')}>
                <Select
                  selectedOption={{
                    label: t(`announcement_status_\${formData.status?.toLowerCase()}`),
                    value: formData.status
                  }}
                  onChange={({ detail }) => setFormData(prev => ({ 
                    ...prev, 
                    status: detail.selectedOption.value as 'PUBLISHED' | 'DRAFT' | 'ARCHIVED' 
                  }))}
                  options={[
                    { label: t('announcement_status_draft'), value: 'DRAFT' },
                    { label: t('announcement_status_published'), value: 'PUBLISHED' },
                    { label: t('announcement_status_archived'), value: 'ARCHIVED' }
                  ]}
                />
              </FormField>

              <FormField label={t('announcement_field_priority')}>
                <Select
                  selectedOption={{
                    label: t(`announcement_priority_\${formData.priority?.toLowerCase()}`),
                    value: formData.priority
                  }}
                  onChange={({ detail }) => setFormData(prev => ({ 
                    ...prev, 
                    priority: detail.selectedOption.value as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' 
                  }))}
                  options={[
                    { label: t('announcement_priority_low'), value: 'LOW' },
                    { label: t('announcement_priority_medium'), value: 'MEDIUM' },
                    { label: t('announcement_priority_high'), value: 'HIGH' },
                    { label: t('announcement_priority_critical'), value: 'CRITICAL' }
                  ]}
                />
              </FormField>
            </SpaceBetween>

            <SpaceBetween direction="horizontal" size="xs">
              <FormField label={t('announcement_field_start_date')}>
                <DatePicker
                  value={formData.startDate || ''}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, startDate: detail.value }))}
                  placeholder="YYYY/MM/DD"
                />
              </FormField>

              <FormField label={t('announcement_field_end_date')}>
                <DatePicker
                  value={formData.endDate || ''}
                  onChange={({ detail }) => setFormData(prev => ({ ...prev, endDate: detail.value }))}
                  placeholder="YYYY/MM/DD"
                />
              </FormField>
            </SpaceBetween>
          </SpaceBetween>
        </Form>
      </Modal>

      {/* 공지사항 삭제 확인 모달 */}
      <Modal
        visible={isDeleteModalVisible}
        onDismiss={() => setIsDeleteModalVisible(false)}
        header={t('announcement_modal_delete_title')}
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                variant="link"
                onClick={() => setIsDeleteModalVisible(false)}
              >
                {t('cancel')}
              </Button>
              <Button
                variant="primary"
                onClick={handleDeleteAnnouncement}
              >
                {t('delete')}
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Box>
          {selectedAnnouncement ? (
            t('announcement_modal_delete_confirmation', { title: selectedAnnouncement.title })
          ) : (
            t('announcement_modal_delete_confirmation_general')
          )}
        </Box>
      </Modal>
    </SpaceBetween>
  );
};

export default AnnouncementsTab;