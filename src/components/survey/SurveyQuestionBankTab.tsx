// src/components/admin/survey/SurveyQuestionBankTab.tsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Header,
    Modal,
    SpaceBetween,
    FormField,
    Input,
    Select,
    Textarea,
    Multiselect,
} from '@cloudscape-design/components';
import EnhancedTable from '@/components/common/EnhancedTable';
import { useAppTranslation } from '@/hooks/useAppTranslation';

// 임시 타입 및 샘플 데이터
interface SurveyQuestion {
    questionId: string;
    content: string;
    questionType: 'multipleChoice' | 'rating' | 'openEnded' | 'dropdown' | 'matrix';
    options?: any[];
    required: boolean;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    createdBy: string;
}

const SurveyQuestionBankTab: React.FC = () => {
    const { t } = useAppTranslation();
    const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
    const [selectedQuestions, setSelectedQuestions] = useState<SurveyQuestion[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [editQuestion, setEditQuestion] = useState<SurveyQuestion | null>(null);

    // 샘플 데이터 로드
    useEffect(() => {
        // API 호출 또는 데이터 로드 로직
        const sampleQuestions = [
            {
                questionId: '1',
                content: '강의 내용은 얼마나 유익했습니까?',
                questionType: 'rating' as const,
                options: [
                    { value: '1', label: '매우 나쁨' },
                    { value: '2', label: '나쁨' },
                    { value: '3', label: '보통' },
                    { value: '4', label: '좋음' },
                    { value: '5', label: '매우 좋음' },
                ],
                required: true,
                tags: ['강의평가', '교육품질'],
                createdAt: '2023-09-01',
                updatedAt: '2023-09-01',
                createdBy: 'admin'
            },
            {
                questionId: '2',
                content: '향후 개선되었으면 하는 점을 자유롭게 작성해주세요.',
                questionType: 'openEnded' as const,
                options: [],
                required: false,
                tags: ['피드백', '개선사항'],
                createdAt: '2023-09-02',
                updatedAt: '2023-09-02',
                createdBy: 'admin'
            }
        ];
        setQuestions(sampleQuestions);
        setLoading(false);
    }, []);

    // 테이블 컬럼 정의
    const columnDefinitions = [
        {
            id: 'content',
            header: t('admin:surveyQuestionBank.columns.content', '질문 내용'),
            cell: (item: SurveyQuestion) => item.content,
            sortingField: 'content',
            isRowHeader: true,
        },
        {
            id: 'questionType',
            header: t('admin:surveyQuestionBank.columns.questionType', '질문 유형'),
            cell: (item: SurveyQuestion) => {
                const typeMap: Record<string, string> = {
                    multipleChoice: '객관식',
                    rating: '평점',
                    openEnded: '주관식',
                    dropdown: '드롭다운',
                    matrix: '행렬식'
                };
                return typeMap[item.questionType] || item.questionType;
            },
            sortingField: 'questionType',
        },
        {
            id: 'required',
            header: t('admin:surveyQuestionBank.columns.required', '필수 여부'),
            cell: (item: SurveyQuestion) => item.required ? '필수' : '선택',
            sortingField: 'required',
        },
        {
            id: 'tags',
            header: t('admin:surveyQuestionBank.columns.tags', '태그'),
            cell: (item: SurveyQuestion) => item.tags.join(', '),
            sortingField: 'tags',
        },
        {
            id: 'createdAt',
            header: t('admin:surveyQuestionBank.columns.createdAt', '생성일'),
            cell: (item: SurveyQuestion) => item.createdAt,
            sortingField: 'createdAt',
        },
        {
            id: 'actions',
            header: t('admin:surveyQuestionBank.columns.actions', '작업'),
            cell: (item: SurveyQuestion) => (
                <SpaceBetween direction="horizontal" size="xs">
                    <Button
                        variant="link"
                        onClick={() => handleEditQuestion(item)}
                    >
                        {t('common:edit', '편집')}
                    </Button>
                    <Button
                        variant="link"
                        onClick={() => handleDeleteQuestion(item.questionId)}
                    >
                        {t('common:delete', '삭제')}
                    </Button>
                </SpaceBetween>
            ),
        },
    ];

    // 필터링 속성 정의
    const filteringProperties = [
        {
            key: 'content',
            label: t('admin:surveyQuestionBank.columns.content', '질문 내용')
        },
        {
            key: 'questionType',
            label: t('admin:surveyQuestionBank.columns.questionType', '질문 유형')
        },
        {
            key: 'tags',
            label: t('admin:surveyQuestionBank.columns.tags', '태그')
        }
    ];

    // 액션 핸들러
    const handleRefresh = () => {
        setLoading(true);
        // API 호출 또는 데이터 리로드 로직
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    };

    const handleCreateQuestion = () => {
        setEditQuestion(null);
        setModalVisible(true);
    };

    const handleEditQuestion = (question: SurveyQuestion) => {
        setEditQuestion(question);
        setModalVisible(true);
    };

    const handleDeleteQuestion = (questionId: string) => {
        // 삭제 로직 구현
        setQuestions(questions.filter(q => q.questionId !== questionId));
    };

    const handleBatchDelete = () => {
        // 선택된 항목 일괄 삭제 로직
        const remainingQuestions = questions.filter(
            q => !selectedQuestions.some(sq => sq.questionId === q.questionId)
        );
        setQuestions(remainingQuestions);
        setSelectedQuestions([]);
    };

    const handleModalSubmit = (formData: any) => {
        // 저장 로직 구현 (신규 또는 수정)
        if (editQuestion) {
            // 기존 질문 수정
            setQuestions(questions.map(q =>
                q.questionId === editQuestion.questionId ? { ...q, ...formData, updatedAt: new Date().toISOString().split('T')[0] } : q
            ));
        } else {
            // 신규 질문 추가
            const newQuestion = {
                ...formData,
                questionId: Date.now().toString(), // 임시 ID 생성
                createdAt: new Date().toISOString().split('T')[0],
                updatedAt: new Date().toISOString().split('T')[0],
                createdBy: 'admin' // 현재 로그인한 사용자로 설정해야 함
            };
            setQuestions([...questions, newQuestion]);
        }
        setModalVisible(false);
    };

    // 질문 편집/생성 모달
    const renderQuestionModal = () => {
        return (
            <Modal
                visible={modalVisible}
                onDismiss={() => setModalVisible(false)}
                header={
                    <Header variant="h2">
                        {editQuestion
                            ? t('admin:surveyQuestionBank.modal.editTitle', '설문 문항 편집')
                            : t('admin:surveyQuestionBank.modal.createTitle', '새 설문 문항 생성')}
                    </Header>
                }
                footer={
                    <Box float="right">
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button variant="link" onClick={() => setModalVisible(false)}>
                                {t('common:cancel', '취소')}
                            </Button>
                            <Button variant="primary" onClick={() => handleModalSubmit({/* 폼 데이터 */ })}>
                                {t('common:save', '저장')}
                            </Button>
                        </SpaceBetween>
                    </Box>
                }
                size="large"
            >
                <SpaceBetween size="l">
                    <FormField
                        label={t('admin:surveyQuestionBank.form.content', '질문 내용')}
                        description={t('admin:surveyQuestionBank.form.contentDesc', '설문조사에서 표시될 질문 내용을 입력하세요.')}
                    >
                        <Textarea
                            value={editQuestion?.content || ''}
                            onChange={({ detail }) => {
                                if (editQuestion) {
                                    setEditQuestion({ ...editQuestion, content: detail.value });
                                }
                            }}
                        />
                    </FormField>

                    <FormField
                        label={t('admin:surveyQuestionBank.form.questionType', '질문 유형')}
                    >
                        <Select
                            selectedOption={{ value: editQuestion?.questionType || 'multipleChoice', label: editQuestion?.questionType || '객관식' }}
                            options={[
                                { value: 'multipleChoice', label: '객관식' },
                                { value: 'rating', label: '평점' },
                                { value: 'openEnded', label: '주관식' },
                                { value: 'dropdown', label: '드롭다운' },
                                { value: 'matrix', label: '행렬식' }
                            ]}
                            onChange={({ detail }) => {
                                if (editQuestion) {
                                    setEditQuestion({
                                        ...editQuestion,
                                        questionType: detail.selectedOption.value as any,
                                        options: detail.selectedOption.value === 'openEnded' ? [] : editQuestion.options
                                    });
                                }
                            }}
                        />
                    </FormField>

                    <FormField
                        label={t('admin:surveyQuestionBank.form.required', '필수 응답 여부')}
                    >
                        <Select
                            selectedOption={{
                                value: editQuestion?.required ? 'true' : 'false',
                                label: editQuestion?.required ? '필수' : '선택'
                            }}
                            options={[
                                { value: 'true', label: '필수' },
                                { value: 'false', label: '선택' }
                            ]}
                            onChange={({ detail }) => {
                                if (editQuestion) {
                                    setEditQuestion({
                                        ...editQuestion,
                                        required: detail.selectedOption.value === 'true'
                                    });
                                }
                            }}
                        />
                    </FormField>

                    <FormField
                        label={t('admin:surveyQuestionBank.form.tags', '태그')}
                        description={t('admin:surveyQuestionBank.form.tagsDesc', '질문을 분류하는 태그를 추가하세요')}
                    >
                        <Multiselect
                            selectedOptions={editQuestion?.tags.map(tag => ({ value: tag, label: tag })) || []}
                            options={[
                                { value: '강의평가', label: '강의평가' },
                                { value: '교육품질', label: '교육품질' },
                                { value: '피드백', label: '피드백' },
                                { value: '개선사항', label: '개선사항' },
                                { value: '강사평가', label: '강사평가' }
                            ]}
                            onChange={({ detail }) => {
                                if (editQuestion) {
                                    setEditQuestion({
                                        ...editQuestion,
                                        tags: detail.selectedOptions.map(option => option.value || '')
                                            .filter((value): value is string => value !== undefined)
                                    });
                                }
                            }}
                        />

                    </FormField>
                </SpaceBetween>
            </Modal>
        );
    };

    return (
        <Box padding="l">
            <SpaceBetween size="l">
                <Header
                    variant="h1"
                    description={t('admin:surveyQuestionBank.description', '설문조사에 사용될 문항을 관리합니다.')}
                >
                    {t('admin:surveyQuestionBank.title', '설문 문항 관리')}
                </Header>

                <EnhancedTable
                    title={t('admin:surveyQuestionBank.tableTitle', '설문조사 문항 목록')}
                    description={t('admin:surveyQuestionBank.tableDescription', '모든 설문 문항을 조회하고 관리할 수 있습니다.')}
                    columnDefinitions={columnDefinitions}
                    items={questions}
                    loading={loading}
                    selectionType="multi"
                    selectedItems={selectedQuestions}
                    onSelectionChange={setSelectedQuestions}
                    onRefresh={handleRefresh}
                    actions={{
                        primary: {
                            text: t('admin:surveyQuestionBank.actions.create', '새 문항 만들기'),
                            onClick: handleCreateQuestion
                        }
                    }}
                    batchActions={[
                        {
                            text: t('admin:surveyQuestionBank.actions.batchDelete', '선택 항목 삭제'),
                            onClick: handleBatchDelete,
                            disabled: selectedQuestions.length === 0
                        }
                    ]}
                    filteringProperties={filteringProperties}
                    usePropertyFilter={true}
                    defaultSortingColumn="createdAt"
                    defaultSortingDescending={true}
                    emptyText={{
                        title: t('admin:surveyQuestionBank.emptyState.title', '문항이 없습니다'),
                        subtitle: t('admin:surveyQuestionBank.emptyState.subtitle', '새 설문 문항을 추가해보세요'),
                        action: {
                            text: t('admin:surveyQuestionBank.actions.create', '새 문항 만들기'),
                            onClick: handleCreateQuestion
                        }
                    }}
                    stickyHeader={true}
                    stripedRows={true}
                    resizableColumns={true}
                    preferences={true}
                    trackBy="questionId"
                />

                {renderQuestionModal()}
            </SpaceBetween>
        </Box>
    );
};

export default SurveyQuestionBankTab;