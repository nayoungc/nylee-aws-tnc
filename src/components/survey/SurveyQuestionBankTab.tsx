// src/components/survey/SurveyQuestionBankTab.tsx
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
    ColumnLayout,
    Tabs,
    FileUpload,
    Alert,
    Toggle
} from '@cloudscape-design/components';
import EnhancedTable from '@/components/common/EnhancedTable';
import { useAppTranslation } from '@/hooks/useAppTranslation';

// 임시 타입 및 샘플 데이터
interface SurveyQuestion {
    questionId: string;
    content: string;
    questionType: 'multipleChoice' | 'rating' | 'openEnded' | 'dropdown' | 'matrix';
    options: { value: string; label: string }[]; // 항상 배열로 정의 (undefined 아님)
    required: boolean;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    courseId?: string;
    courseName?: string;
    moduleId?: string;
    moduleName?: string;
}

// 문항 타입 매핑
const questionTypeMap: Record<string, string> = {
    multipleChoice: '객관식',
    rating: '평점',
    openEnded: '주관식',
    dropdown: '드롭다운',
    matrix: '행렬식'
};

const SurveyQuestionBankTab: React.FC = () => {
    const { t } = useAppTranslation();
    const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
    const [selectedQuestions, setSelectedQuestions] = useState<SurveyQuestion[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [editQuestion, setEditQuestion] = useState<SurveyQuestion | null>(null);
    const [importModalVisible, setImportModalVisible] = useState<boolean>(false);
    const [importTabId, setImportTabId] = useState('file');
    const [fileUploadValue, setFileUploadValue] = useState<File[]>([]);
    const [aiGenerationModalVisible, setAiGenerationModalVisible] = useState<boolean>(false);
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [selectedModule, setSelectedModule] = useState<string>('');
    const [questionCount, setQuestionCount] = useState<number>(5);
    const [generatingQuestions, setGeneratingQuestions] = useState<boolean>(false);
    const [clipboardContent, setClipboardContent] = useState<string>('');

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
                createdBy: 'admin',
                courseId: 'course-1',
                courseName: 'AWS 기초 과정',
                moduleId: 'module-3',
                moduleName: '클라우드 컴퓨팅 개요'
            },
            {
                questionId: '2',
                content: '향후 개선되었으면 하는 점을 자유롭게 작성해주세요.',
                questionType: 'openEnded' as const,
                options: [], // 빈 배열로 초기화
                required: false,
                tags: ['피드백', '개선사항'],
                createdAt: '2023-09-02',
                updatedAt: '2023-09-02',
                createdBy: 'admin',
                courseId: 'course-1',
                courseName: 'AWS 기초 과정',
                moduleId: 'module-5',
                moduleName: 'AWS 서비스 소개'
            },
            {
                questionId: '3',
                content: '강사의 전문성에 대해 어떻게 평가하십니까?',
                questionType: 'multipleChoice' as const,
                options: [
                    { value: 'excellent', label: '매우 뛰어남' },
                    { value: 'good', label: '뛰어남' },
                    { value: 'average', label: '보통' },
                    { value: 'below_average', label: '미흡' },
                    { value: 'poor', label: '매우 미흡' },
                ],
                required: true,
                tags: ['강사평가', '전문성'],
                createdAt: '2023-09-03',
                updatedAt: '2023-09-03',
                createdBy: 'admin',
                courseId: 'course-2',
                courseName: 'AWS 고급 과정',
                moduleId: 'module-1',
                moduleName: '시스템 설계 원칙'
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
                return questionTypeMap[item.questionType] || item.questionType;
            },
            sortingField: 'questionType',
        },
        {
            id: 'courseName',
            header: t('admin:surveyQuestionBank.columns.course', '과정명'),
            cell: (item: SurveyQuestion) => item.courseName || '-',
            sortingField: 'courseName',
        },
        {
            id: 'moduleName',
            header: t('admin:surveyQuestionBank.columns.module', '모듈'),
            cell: (item: SurveyQuestion) => item.moduleName || '-',
            sortingField: 'moduleName',
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
            key: 'courseName',
            label: t('admin:surveyQuestionBank.columns.course', '과정명')
        },
        {
            key: 'moduleName',
            label: t('admin:surveyQuestionBank.columns.module', '모듈')
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
        // 새 질문 생성 시 빈 옵션 배열로 초기화
        setEditQuestion({
            questionId: '',
            content: '',
            questionType: 'multipleChoice',
            options: [],
            required: false,
            tags: [],
            createdAt: '',
            updatedAt: '',
            createdBy: '',
        });
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

    const handleImportQuestions = () => {
        setImportModalVisible(true);
    };

    const handleFileUpload = () => {
        // 파일 업로드 처리 로직
        if (fileUploadValue.length > 0) {
            // 파일 파싱 및 문제 가져오기 로직 구현
            console.log('파일에서 문제 가져오기:', fileUploadValue[0].name);

            // 여기서 실제 파일 처리 후 새 문제들을 추가할 것입니다
            // 임시로 몇 개의 더미 문제 추가
            const newQuestions: SurveyQuestion[] = [
                {
                    questionId: `imported-\${Date.now()}-1`,
                    content: '가져온 질문: 교육 내용이 실무에 얼마나 도움이 될 것으로 생각하십니까?',
                    questionType: 'rating',
                    options: [
                        { value: '1', label: '전혀 도움 안됨' },
                        { value: '2', label: '약간 도움' },
                        { value: '3', label: '보통' },
                        { value: '4', label: '많은 도움' },
                        { value: '5', label: '매우 큰 도움' }
                    ],
                    required: true,
                    tags: ['교육효과성', '실무적용'],
                    createdAt: new Date().toISOString().split('T')[0],
                    updatedAt: new Date().toISOString().split('T')[0],
                    createdBy: 'admin',
                    courseId: 'course-3',
                    courseName: 'AWS DevOps 전문가 과정',
                    moduleId: 'module-2',
                    moduleName: 'CI/CD 파이프라인 구축'
                },
                {
                    questionId: `imported-\${Date.now()}-2`,
                    content: '가져온 질문: 이 교육에서 가장 유용했던 부분은 무엇입니까?',
                    questionType: 'openEnded',
                    options: [],
                    required: false,
                    tags: ['피드백', '교육품질'],
                    createdAt: new Date().toISOString().split('T')[0],
                    updatedAt: new Date().toISOString().split('T')[0],
                    createdBy: 'admin',
                    courseId: 'course-3',
                    courseName: 'AWS DevOps 전문가 과정',
                    moduleId: 'module-4',
                    moduleName: '컨테이너화 및 서비스 오케스트레이션'
                }
            ];

            setQuestions([...questions, ...newQuestions]);
            setImportModalVisible(false);
            setFileUploadValue([]);
        }
    };

    const handleClipboardImport = () => {
        if (clipboardContent.trim()) {
            // 클립보드 내용 처리 (예: CSV 형식 파싱)
            const lines = clipboardContent.trim().split('\n');
            const newQuestions: SurveyQuestion[] = [];

            // 헤더 행 제외, 각 행을 처리
            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(',');
                if (cols.length >= 3) { // 최소 3개의 열 필요
                    const questionType = (cols[1].trim() as SurveyQuestion['questionType']) || 'openEnded';

                    let options: { value: string; label: string }[] = [];
                    if (questionType === 'rating') {
                        options = [
                            { value: '1', label: '매우 불만족' },
                            { value: '2', label: '불만족' },
                            { value: '3', label: '보통' },
                            { value: '4', label: '만족' },
                            { value: '5', label: '매우 만족' }
                        ];
                    }

                    newQuestions.push({
                        questionId: `clipboard-\${Date.now()}-\${i}`,
                        content: cols[0].trim(),
                        questionType,
                        options,
                        required: cols[2].trim().toLowerCase() === 'true',
                        tags: cols[3] ? cols[3].split(';').map(t => t.trim()) : [],
                        createdAt: new Date().toISOString().split('T')[0],
                        updatedAt: new Date().toISOString().split('T')[0],
                        createdBy: 'admin',
                        courseName: cols[4] || undefined,
                        moduleName: cols[5] || undefined
                    });
                }
            }

            if (newQuestions.length > 0) {
                setQuestions([...questions, ...newQuestions]);
                setClipboardContent('');
                setImportModalVisible(false);
            }
        }
    };

    const handleAIGenerate = () => {
        setAiGenerationModalVisible(true);
    };

    const handleGenerateQuestions = () => {
        if (!selectedCourse) {
            return; // 과정을 선택하지 않았으면 중단
        }

        setGeneratingQuestions(true);

        // 실제로는 Bedrock API를 호출하여 질문을 생성하겠지만, 여기서는 시뮬레이션
        setTimeout(() => {
            // 생성된 질문 예시
            const generatedQuestions: SurveyQuestion[] = [
                {
                    questionId: `ai-gen-\${Date.now()}-1`,
                    content: 'AWS Knowledge Base에서 자동 생성된 질문: 이 교육에서 AWS Lambda 관련 내용이 귀하의 업무에 얼마나 도움이 될 것 같습니까?',
                    questionType: 'rating',
                    options: [
                        { value: '1', label: '전혀 도움 안됨' },
                        { value: '2', label: '약간 도움' },
                        { value: '3', label: '보통' },
                        { value: '4', label: '많은 도움' },
                        { value: '5', label: '매우 큰 도움' }
                    ],
                    required: true,
                    tags: ['교육효과성', 'Lambda', '서버리스'],
                    createdAt: new Date().toISOString().split('T')[0],
                    updatedAt: new Date().toISOString().split('T')[0],
                    createdBy: 'ai-bedrock',
                    courseId: selectedCourse,
                    courseName: 'AWS 서버리스 아키텍처',
                    moduleId: selectedModule || undefined,
                    moduleName: selectedModule ? 'Lambda 소개 및 활용' : undefined
                },
                {
                    questionId: `ai-gen-\${Date.now()}-2`,
                    content: 'AWS Knowledge Base에서 자동 생성된 질문: 실습 환경은 학습에 충분히 적합했습니까?',
                    questionType: 'multipleChoice',
                    options: [
                        { value: 'very_suitable', label: '매우 적합했음' },
                        { value: 'suitable', label: '적합했음' },
                        { value: 'neutral', label: '보통' },
                        { value: 'not_suitable', label: '적합하지 않았음' },
                        { value: 'very_unsuitable', label: '전혀 적합하지 않았음' }
                    ],
                    required: true,
                    tags: ['실습환경', '교육시설'],
                    createdAt: new Date().toISOString().split('T')[0],
                    updatedAt: new Date().toISOString().split('T')[0],
                    createdBy: 'ai-bedrock',
                    courseId: selectedCourse,
                    courseName: 'AWS 서버리스 아키텍처',
                    moduleId: selectedModule || undefined,
                    moduleName: selectedModule ? '실습: Lambda 함수 생성 및 배포' : undefined
                },
                {
                    questionId: `ai-gen-\${Date.now()}-3`,
                    content: 'AWS Knowledge Base에서 자동 생성된 질문: AWS 서버리스 서비스에 대한 강사의 설명이 이해하기 쉬웠나요?',
                    questionType: 'rating',
                    options: [
                        { value: '1', label: '매우 어려웠음' },
                        { value: '2', label: '어려웠음' },
                        { value: '3', label: '보통' },
                        { value: '4', label: '쉬웠음' },
                        { value: '5', label: '매우 쉬웠음' }
                    ],
                    required: true,
                    tags: ['강사평가', '전달력', '서버리스'],
                    createdAt: new Date().toISOString().split('T')[0],
                    updatedAt: new Date().toISOString().split('T')[0],
                    createdBy: 'ai-bedrock',
                    courseId: selectedCourse,
                    courseName: 'AWS 서버리스 아키텍처',
                    moduleId: selectedModule || undefined,
                    moduleName: selectedModule ? '서버리스 아키텍처 소개' : undefined
                }
            ];

            // 요청한 문제 수만큼 생성 (여기서는 3개 예시만 추가)
            setQuestions([...questions, ...generatedQuestions]);
            setGeneratingQuestions(false);
            setAiGenerationModalVisible(false);
            // 상태 초기화
            setSelectedCourse('');
            setSelectedModule('');
            setQuestionCount(5);
        }, 2000);
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

    // 샘플 과정 목록
    const courseOptions = [
        { value: 'course-1', label: 'AWS 기초 과정' },
        { value: 'course-2', label: 'AWS 고급 과정' },
        { value: 'course-3', label: 'AWS DevOps 전문가 과정' },
        { value: 'course-4', label: 'AWS 보안 전문가 과정' },
        { value: 'course-5', label: '클라우드 아키텍처 설계' }
    ];

    // 샘플 모듈 목록 (선택된 과정에 따라 다름)
    const getModuleOptions = (courseId: string) => {
        const modulesByCourseid: Record<string, any[]> = {
            'course-1': [
                { value: 'module-1', label: 'AWS 소개' },
                { value: 'module-2', label: 'AWS 계정 관리' },
                { value: 'module-3', label: '클라우드 컴퓨팅 개요' },
                { value: 'module-4', label: 'AWS 네트워크 기초' },
                { value: 'module-5', label: 'AWS 서비스 소개' }
            ],
            'course-2': [
                { value: 'module-1', label: '시스템 설계 원칙' },
                { value: 'module-2', label: '고가용성 아키텍처' },
                { value: 'module-3', label: '마이크로서비스 아키텍처' }
            ],
            'course-3': [
                { value: 'module-1', label: 'DevOps 개요' },
                { value: 'module-2', label: 'CI/CD 파이프라인 구축' },
                { value: 'module-3', label: '인프라 자동화' },
                { value: 'module-4', label: '컨테이너화 및 서비스 오케스트레이션' }
            ]
        };

        return modulesByCourseid[courseId] || [];
    };

    // 질문 편집/생성 모달
    const renderQuestionModal = () => {
        // 현재 편집 중인 질문이 없으면 빈 객체로 처리
        const currentQuestion = editQuestion || {
            questionId: '',
            content: '',
            questionType: 'multipleChoice' as const,
            options: [], // 빈 배열로 초기화
            required: false,
            tags: [],
            createdAt: '',
            updatedAt: '',
            createdBy: ''
        };

        return (
            <Modal
                visible={modalVisible}
                onDismiss={() => setModalVisible(false)}
                header={
                    <Header variant="h2">
                        {editQuestion?.questionId
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
                            value={currentQuestion.content}
                            onChange={({ detail }) => {
                                if (editQuestion) {
                                    setEditQuestion({ ...editQuestion, content: detail.value });
                                }
                            }}
                        />
                    </FormField>

                    <ColumnLayout columns={2}>
                        <FormField
                            label={t('admin:surveyQuestionBank.form.course', '관련 과정')}
                        >
                            <Select
                                selectedOption={
                                    currentQuestion.courseId
                                        ? { value: currentQuestion.courseId, label: currentQuestion.courseName || currentQuestion.courseId }
                                        : null
                                }
                                options={courseOptions}
                                onChange={({ detail }) => {
                                    if (editQuestion) {
                                        setEditQuestion({
                                            ...editQuestion,
                                            courseId: detail.selectedOption?.value,
                                            courseName: detail.selectedOption?.label,
                                            // 과정이 바뀌면 모듈도 초기화
                                            moduleId: undefined,
                                            moduleName: undefined
                                        });
                                    }
                                }}
                                placeholder="과정 선택(선택사항)"
                            />
                        </FormField>

                        <FormField
                            label={t('admin:surveyQuestionBank.form.module', '관련 모듈')}
                        >
                            <Select
                                selectedOption={
                                    currentQuestion.moduleId
                                        ? { value: currentQuestion.moduleId, label: currentQuestion.moduleName || currentQuestion.moduleId }
                                        : null
                                }
                                options={currentQuestion.courseId ? getModuleOptions(currentQuestion.courseId) : []}
                                onChange={({ detail }) => {
                                    if (editQuestion) {
                                        setEditQuestion({
                                            ...editQuestion,
                                            moduleId: detail.selectedOption?.value,
                                            moduleName: detail.selectedOption?.label
                                        });
                                    }
                                }}
                                placeholder="모듈 선택(선택사항)"
                                disabled={!currentQuestion.courseId}
                            />
                        </FormField>
                    </ColumnLayout>

                    <FormField
                        label={t('admin:surveyQuestionBank.form.questionType', '질문 유형')}
                    >
                        <Select
                            selectedOption={{
                                value: currentQuestion.questionType || 'multipleChoice',
                                label: questionTypeMap[currentQuestion.questionType] || '객관식'
                            }}
                            options={[
                                { value: 'multipleChoice', label: '객관식' },
                                { value: 'rating', label: '평점' },
                                { value: 'openEnded', label: '주관식' },
                                { value: 'dropdown', label: '드롭다운' },
                                { value: 'matrix', label: '행렬식' }
                            ]}
                            onChange={({ detail }) => {
                                if (editQuestion) {
                                    // 타입 단언을 사용하여 안전하게 값 설정
                                    const newType = detail.selectedOption.value as SurveyQuestion['questionType'];
                                    setEditQuestion({
                                        ...editQuestion,
                                        questionType: newType,
                                        // 주관식이면 options는 빈 배열로 초기화
                                        options: newType === 'openEnded' ? [] : (editQuestion.options || [])
                                    });
                                }
                            }}
                        />
                    </FormField>

                    <FormField
                        label={t('admin:surveyQuestionBank.form.required', '필수 응답 여부')}
                    >
                        <Toggle
                            checked={currentQuestion.required}
                            onChange={({ detail }) => {
                                if (editQuestion) {
                                    setEditQuestion({ ...editQuestion, required: detail.checked });
                                }
                            }}
                        >
                            {currentQuestion.required ? '필수 질문' : '선택 질문'}
                        </Toggle>
                    </FormField>

                    {/* 선택지 관리 섹션 - 질문 유형에 따라 표시 */}
                    {(currentQuestion.questionType === 'multipleChoice' ||
                        currentQuestion.questionType === 'rating' ||
                        currentQuestion.questionType === 'dropdown') && (
                            <FormField
                                label={t('admin:surveyQuestionBank.form.options', '선택지')}
                                description={t('admin:surveyQuestionBank.form.optionsDesc', '응답자가 선택할 수 있는 옵션을 설정하세요')}
                            >
                                <SpaceBetween size="xs">
                                    {(currentQuestion.options || []).map((option, index) => (
                                        <SpaceBetween key={index} direction="horizontal" size="xs">
                                            <Input
                                                value={option.label}
                                                onChange={({ detail }) => {
                                                    if (editQuestion) {
                                                        // 새 배열 생성하여 불변성 유지
                                                        const newOptions = [...editQuestion.options];
                                                        newOptions[index] = { ...option, label: detail.value };
                                                        setEditQuestion({
                                                            ...editQuestion,
                                                            options: newOptions
                                                        });
                                                    }
                                                }}
                                            />
                                            <Button
                                                iconName="remove"
                                                variant="icon"
                                                onClick={() => {
                                                    if (editQuestion) {
                                                        const newOptions = editQuestion.options.filter((_, i) => i !== index);
                                                        setEditQuestion({
                                                            ...editQuestion,
                                                            options: newOptions
                                                        });
                                                    }
                                                }}
                                            />
                                        </SpaceBetween>
                                    ))}
                                    <Button
                                        iconName="add-plus"
                                        onClick={() => {
                                            if (editQuestion) {
                                                // 옵션 배열의 존재 여부를 확인
                                                const options = editQuestion.options || [];
                                                // 새 옵션 추가
                                                const optionValue = `option-\${options.length + 1}`;
                                                setEditQuestion({
                                                    ...editQuestion,
                                                    options: [
                                                        ...options,
                                                        {
                                                            value: optionValue,
                                                            label: editQuestion.questionType === 'rating' ?
                                                                `\${options.length + 1}` :
                                                                `옵션 \${options.length + 1}`
                                                        }
                                                    ]
                                                });
                                            }
                                        }}
                                    >
                                        선택지 추가
                                    </Button>
                                    {currentQuestion.questionType === 'rating' && (
                                        <Box color="text-body-secondary">
                                            참고: 평점은 일반적으로 낮은 값에서 높은 값 순서로 구성됩니다.
                                        </Box>
                                    )}
                                </SpaceBetween>
                            </FormField>
                        )}

                    <FormField
                        label={t('admin:surveyQuestionBank.form.tags', '태그')}
                        description={t('admin:surveyQuestionBank.form.tagsDesc', '질문을 분류하는 태그를 추가하세요')}
                    >
                        <Multiselect
                            selectedOptions={(currentQuestion.tags || []).map(tag => ({ value: tag, label: tag }))}
                            options={[
                                { value: '강의평가', label: '강의평가' },
                                { value: '교육품질', label: '교육품질' },
                                { value: '피드백', label: '피드백' },
                                { value: '개선사항', label: '개선사항' },
                                { value: '강사평가', label: '강사평가' },
                                { value: '실습환경', label: '실습환경' },
                                { value: '교육시설', label: '교육시설' },
                                { value: '교육내용', label: '교육내용' },
                                { value: '전달력', label: '전달력' }
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
                            filteringType="auto"
                            placeholder="태그 선택 또는 입력"
                        />
                    </FormField>
                </SpaceBetween>
            </Modal>
        );
    };

    // 파일 가져오기 모달
    const renderImportModal = () => {
        return (
            <Modal
                visible={importModalVisible}
                onDismiss={() => setImportModalVisible(false)}
                header={
                    <Header variant="h2">
                        {t('admin:surveyQuestionBank.importModal.title', '문항 가져오기')}
                    </Header>
                }
                footer={
                    <Box float="right">
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button variant="link" onClick={() => setImportModalVisible(false)}>
                                {t('common:cancel', '취소')}
                            </Button>
                            <Button
                                variant="primary"
                                onClick={importTabId === 'file' ? handleFileUpload : handleClipboardImport}
                                disabled={(importTabId === 'file' && fileUploadValue.length === 0) ||
                                    (importTabId === 'clipboard' && !clipboardContent.trim())}
                            >
                                {t('admin:surveyQuestionBank.importModal.import', '가져오기')}
                            </Button>
                        </SpaceBetween>
                    </Box>
                }
                size="large"
            >
                <SpaceBetween size="l">
                    <Tabs
                        activeTabId={importTabId}
                        onChange={({ detail }) => setImportTabId(detail.activeTabId)}
                        tabs={[
                            {
                                id: 'file',
                                label: t('admin:surveyQuestionBank.importModal.tabs.file', '파일에서 가져오기'),
                                content: (
                                    <SpaceBetween size="l">
                                        <Alert type="info">
                                            {t('admin:surveyQuestionBank.importModal.fileInfo',
                                                'Excel(XLSX) 또는 CSV 형식의 파일에서 문항을 가져올 수 있습니다. 샘플 양식을 다운로드하여 참고하세요.')}
                                        </Alert>

                                        <Button iconName="download">
                                            {t('admin:surveyQuestionBank.importModal.downloadTemplate', '문항 템플릿 다운로드')}
                                        </Button>

                                        <FileUpload
                                            onChange={({ detail }) => setFileUploadValue(detail.value)}
                                            value={fileUploadValue}
                                            constraintText={t('admin:surveyQuestionBank.importModal.fileConstraint', 'Excel(XLSX) 또는 CSV 파일만 허용됩니다.')}
                                            accept=".xlsx,.csv"
                                            i18nStrings={{
                                                uploadButtonText: (e) => e ? '다시 선택' : '파일 선택',
                                                dropzoneText: (_) => '파일을 여기에 드롭하세요',
                                                removeFileAriaLabel: (e) => `\${e} 제거`
                                            }}
                                        />
                                    </SpaceBetween>
                                )
                            },
                            {
                                id: 'clipboard',
                                label: t('admin:surveyQuestionBank.importModal.tabs.clipboard', '클립보드에서 가져오기'),
                                content: (
                                    <SpaceBetween size="l">
                                        <Alert type="info">
                                            {t('admin:surveyQuestionBank.importModal.clipboardInfo',
                                                '엑셀이나 다른 문서에서 복사한 내용을 붙여넣으세요. 각 행은 별도의 문항으로 처리됩니다.')}
                                        </Alert>

                                        <FormField
                                            label={t('admin:surveyQuestionBank.importModal.pasteHere', '내용 붙여넣기')}
                                        >
                                            <Textarea
                                                rows={10}
                                                value={clipboardContent}
                                                onChange={({ detail }) => setClipboardContent(detail.value)}
                                                placeholder={t('admin:surveyQuestionBank.importModal.pasteFormat',
                                                    '질문내용,질문유형,필수여부,태그,과정,모듈\n예시: 강의 내용은 이해하기 쉬웠습니까?,rating,true,강의평가;교육품질,AWS 기초 과정,클라우드 컴퓨팅 개요')}
                                            />
                                        </FormField>
                                    </SpaceBetween>
                                )
                            }
                        ]}
                    />
                </SpaceBetween>
            </Modal>
        );
    };

    // AI 문항 생성 모달
    const renderAIGenerationModal = () => {
        return (
            <Modal
                visible={aiGenerationModalVisible}
                onDismiss={() => setAiGenerationModalVisible(false)}
                header={
                    <Header variant="h2">
                        {t('admin:surveyQuestionBank.aiModal.title', 'AI 문항 자동 생성')}
                    </Header>
                }
                footer={
                    <Box float="right">
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button variant="link" onClick={() => setAiGenerationModalVisible(false)}>
                                {t('common:cancel', '취소')}
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleGenerateQuestions}
                                disabled={!selectedCourse || generatingQuestions}
                                loading={generatingQuestions}
                            >
                                {t('admin:surveyQuestionBank.aiModal.generate', '생성하기')}
                            </Button>
                        </SpaceBetween>
                    </Box>
                }
                size="large"
            >
                <SpaceBetween size="l">
                    <Alert type="info">
                        {t('admin:surveyQuestionBank.aiModal.info',
                            'AWS Bedrock과 Knowledge Base를 활용하여 선택한 교육 과정에 맞는 설문 문항을 자동으로 생성합니다. 생성된 문항은 검토 후 사용하세요.')}
                    </Alert>

                    <FormField
                        label={t('admin:surveyQuestionBank.aiModal.course', '교육 과정 선택')}
                        description={t('admin:surveyQuestionBank.aiModal.courseDesc', '문항을 생성할 교육 과정을 선택하세요')}
                    >
                        <Select
                            selectedOption={selectedCourse ? { value: selectedCourse, label: courseOptions.find(c => c.value === selectedCourse)?.label || selectedCourse } : null}
                            options={courseOptions}
                            onChange={({ detail }) => setSelectedCourse(detail.selectedOption?.value || '')}
                            placeholder="교육 과정 선택"
                        />
                    </FormField>

                    <FormField
                        label={t('admin:surveyQuestionBank.aiModal.module', '모듈 선택 (선택사항)')}
                        description={t('admin:surveyQuestionBank.aiModal.moduleDesc', '특정 모듈에 대한 문항만 생성하려면 선택하세요')}
                    >
                        <Select
                            selectedOption={selectedModule ? { value: selectedModule, label: getModuleOptions(selectedCourse).find(m => m.value === selectedModule)?.label || selectedModule } : null}
                            options={selectedCourse ? getModuleOptions(selectedCourse) : []}
                            onChange={({ detail }) => setSelectedModule(detail.selectedOption?.value || '')}
                            placeholder="모듈 선택 (선택사항)"
                            disabled={!selectedCourse}
                        />
                    </FormField>

                    <FormField
                        label={t('admin:surveyQuestionBank.aiModal.count', '생성할 문항 수')}
                    >
                        <Input
                            value={questionCount.toString()}
                            onChange={({ detail }) => setQuestionCount(parseInt(detail.value) || 5)}
                        />
                    </FormField>

                    <FormField
                        label={t('admin:surveyQuestionBank.aiModal.types', '생성할 문항 유형')}
                    >
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button iconName="check">객관식</Button>
                            <Button iconName="check">평점</Button>
                            <Button>주관식</Button>
                            <Button>드롭다운</Button>
                        </SpaceBetween>
                    </FormField>

                    <FormField
                        label={t('admin:surveyQuestionBank.aiModal.focus', '문항 주제 영역')}
                        description={t('admin:surveyQuestionBank.aiModal.focusDesc', '문항의 주요 주제 영역을 선택하세요 (복수 선택 가능)')}
                    >
                        <Multiselect
                            selectedOptions={[
                                { value: '강의내용', label: '강의 내용' },
                                { value: '강사역량', label: '강사 역량' }
                            ]}
                            options={[
                                { value: '강의내용', label: '강의 내용' },
                                { value: '강사역량', label: '강사 역량' },
                                { value: '교육자료', label: '교육 자료' },
                                { value: '실습환경', label: '실습 환경' },
                                { value: '학습경험', label: '학습 경험' },
                                { value: '교육시설', label: '교육 시설' },
                                { value: '교육효과', label: '교육 효과' }
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
                            filteringType="auto"
                            placeholder="태그 선택 또는 입력"
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
                    {t('admin:surveyQuestionBank.title', '설문 문항 은행')}
                </Header>

                <EnhancedTable
                    title={t('admin:surveyQuestionBank.tableTitle', '설문조사 문항 목록')}
                    description={t('admin:surveyQuestionBank.tableDescription', '모든 설문 문항을 조회하고 관리할 수 있습니다.')}
                    columnDefinitions={columnDefinitions}
                    items={questions}
                    loading={loading}
                    loadingText={t('common:loading', '로딩 중...')}
                    selectionType="multi"
                    selectedItems={selectedQuestions}
                    onSelectionChange={setSelectedQuestions}
                    onRefresh={handleRefresh}
                    actions={{
                        primary: {
                            text: t('admin:surveyQuestionBank.actions.create', '새 문항 만들기'),
                            onClick: handleCreateQuestion
                        },
                        secondary: [
                            {
                                text: t('admin:surveyQuestionBank.actions.import', '문항 가져오기'),
                                onClick: handleImportQuestions
                            },
                            {
                                text: t('admin:surveyQuestionBank.actions.aiGenerate', 'AI 문항 생성'),
                                onClick: handleAIGenerate
                            }
                        ]
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
                {renderImportModal()}
                {renderAIGenerationModal()}
            </SpaceBetween>
        </Box>
    );
};

export default SurveyQuestionBankTab;