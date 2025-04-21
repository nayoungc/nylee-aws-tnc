// src/pages/instructor/quizizz/QuizList.tsx
import React, { useState, useEffect } from 'react';
import {
    Button,
    Container,
    Header,
    Select,
    SpaceBetween,
    FormField,
    Modal,
    Spinner,
    Box,
    Table,
    Checkbox,
    SegmentedControl,
    Alert,
    TextFilter
} from '@cloudscape-design/components';
import { SelectProps } from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';
import { useTypedTranslation } from '@utils/i18n-utils';
import { client, listCourseCatalog, generateQuizFromContent, listQuizzes, getQuiz } from '@graphql/client';
import MainLayout from '@layouts/MainLayout';

// 타입 정의
interface Question {
    id?: string;
    question: string;
    options: string[];
    correctAnswer: string | number;
}

interface QuizItem {
    id: string;
    title: string;
    quizType: string;
    courseId: string;
    courseName?: string;
    questionCount: number;
    createdAt: string;
    updatedAt: string;
}

interface CourseCatalog {
    id: string; // 이전의 catalogId에서 변경됨
    title: string;
    description?: string;
    version: string;
}

export default function QuizList() {
    const { t, tString } = useTypedTranslation();
    const navigate = useNavigate();
    const [selectedCourse, setSelectedCourse] = useState<SelectProps.Option | null>(null);
    const [courses, setCourses] = useState<SelectProps.Option[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingQuizzes, setLoadingQuizzes] = useState(false);
    const [showAiModal, setShowAiModal] = useState(false);
    const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
    const [existingQuizzes, setExistingQuizzes] = useState<QuizItem[]>([]);
    const [quizType, setQuizType] = useState<'pre' | 'post'>('pre');
    const [syncQuizzes, setSyncQuizzes] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [aiModelType, setAiModelType] = useState<'basic' | 'advanced'>('basic');
    const [filterText, setFilterText] = useState('');

    // 페이지 로드 시 과정 목록 가져오기
    useEffect(() => {
        fetchCourses();
    }, []);

    // 과정 선택 시 해당 과정의 퀴즈 목록 가져오기
    useEffect(() => {
        if (selectedCourse && selectedCourse.value) {
            fetchQuizzes(selectedCourse.value, quizType);
        }
    }, [selectedCourse, quizType]);

    // 과정 목록 가져오기
    const fetchCourses = async () => {
        setLoadingCourses(true);
        setError(null);

        try {
            // Amplify Gen 2 API 사용
            const response = await listCourseCatalog({
                limit: 100
            });

            if (response.errors) {
                throw new Error(response.errors.map(e => e.message).join(', '));
            }

            if (response.data) {
                // 응답 구조에 따라 적절히 처리
                const courseList = Array.isArray(response.data) 
                    ? response.data 
                    : [];

                const courseOptions: SelectProps.Option[] = courseList.map((course: CourseCatalog) => ({
                    label: course.title,
                    value: course.id, // catalogId가 id로 변경됨
                    description: course.description || '',
                }));

                setCourses(courseOptions);
            }
        } catch (error) {
            console.error(t('quiz_management.errors.course_load'), error);
            setError(t('quiz_management.errors.course_load_message'));

            // 개발 환경에서 더미 데이터 제공
            if (process.env.NODE_ENV === 'development') {
                const fallbackOptions: SelectProps.Option[] = [
                    { label: "AWS Cloud Practitioner", value: "course-1" },
                    { label: "AWS Solutions Architect Associate", value: "course-2" },
                    { label: "AWS Developer Associate", value: "course-3" }
                ];
                setCourses(fallbackOptions);
            }
        } finally {
            setLoadingCourses(false);
        }
    };

    // 퀴즈 목록 가져오기
    const fetchQuizzes = async (courseId: string, type: string) => {
        if (!courseId) return;

        setLoadingQuizzes(true);
        setError(null);

        try {
            // Amplify Gen 2 API 사용
            const response = await listQuizzes({
                filter: {
                    courseId: { eq: courseId },
                    quizType: { eq: type }
                }
            });

            if (response.errors) {
                throw new Error(response.errors.map(e => e.message).join(', '));
            }

            if (response.data) {
                setExistingQuizzes(response.data);
            } else {
                setExistingQuizzes([]);
            }
        } catch (error) {
            console.error(t('quiz_management.errors.quiz_load'), error);
            setError(t('quiz_management.errors.quiz_load_message'));

            // 개발 환경에서 더미 데이터 제공
            if (process.env.NODE_ENV === 'development' && courseId === 'course-1') {
                setExistingQuizzes([
                    {
                        id: "quiz-1",
                        title: "AWS Cloud Concepts Quiz",
                        quizType: "pre",
                        courseId: "course-1",
                        courseName: "AWS Cloud Practitioner",
                        questionCount: 10,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                ]);
            } else {
                setExistingQuizzes([]);
            }
        } finally {
            setLoadingQuizzes(false);
        }
    };

    // 사전 퀴즈 복사하기 
    const copyFromPreQuiz = async () => {
        if (!selectedCourse || !selectedCourse.value || quizType !== 'post') return;

        setLoading(true);
        setError(null);

        try {
            // 사전 퀴즈 가져오기
            const response = await listQuizzes({
                filter: {
                    courseId: { eq: selectedCourse.value },
                    quizType: { eq: 'pre' }
                }
            });

            if (response.errors) {
                throw new Error(response.errors.map(e => e.message).join(', '));
            }

            if (response.data && response.data.length > 0) {
                const preQuiz = response.data[0];

                // 사전 퀴즈의 질문 가져오기
                const questionsResponse = await client.graphql({
                    query: `
                    query GetQuizQuestions(\$quizId: ID!) {
                      getQuizQuestions(quizId: \$quizId) {
                        items {
                          id
                          question
                          options
                          correctAnswer
                        }
                      }
                    }`,
                    variables: { quizId: preQuiz.id }
                });

                // 결과 추출
                const typedResult = questionsResponse as any;
                const questions = typedResult.data?.getQuizQuestions?.items || [];

                // 퀴즈 생성기로 이동 - 사전 퀴즈의 질문을 가지고
                navigate('/instructor/assessments/quiz-create', {
                    state: {
                        courseId: selectedCourse.value,
                        courseName: selectedCourse.label,
                        quizType: 'post',
                        initialQuestions: questions,
                        preQuizId: preQuiz.id,
                        copyMode: true
                    }
                });
            } else {
                setError(t('quiz_management.errors.no_pre_quiz'));
            }
        } catch (error) {
            console.error(t('quiz_management.errors.copy_quiz'), error);
            setError(t('quiz_management.errors.copy_quiz_message'));
        } finally {
            setLoading(false);
        }
    };

    // AI로 퀴즈 생성하기
    const generateQuizWithAI = async () => {
        if (!selectedCourse) return;

        setLoading(true);
        setShowAiModal(true);
        setGeneratedQuestions([]);
        setError(null);

        try {
            // AI 서비스를 통해 퀴즈 생성
            const questions = await generateQuizFromContent({
                courseId: selectedCourse.value as string,
                quizType,
                modelType: aiModelType,
                questionCount: 10
            });

            setGeneratedQuestions(questions);
        } catch (error) {
            console.error(t('quiz_management.errors.quiz_generation'), error);
            setError(t('quiz_management.errors.generation_failed'));
        } finally {
            setLoading(false);
        }
    };

    // 퀴즈 삭제하기
    const deleteQuiz = async (quizId: string) => {
        if (!window.confirm(tString('quiz_management.delete_confirm'))) {
            return;
        }

        try {
            await client.graphql({
                query: `
                mutation DeleteQuiz(\$input: DeleteQuizInput!) {
                  deleteQuiz(input: \$input) {
                    id
                  }
                }`,
                variables: {
                    input: { id: quizId }
                }
            });

            // 퀴즈 목록 새로고침
            if (selectedCourse && selectedCourse.value) {
                fetchQuizzes(selectedCourse.value, quizType);
            }

        } catch (error) {
            console.error(t('quiz_management.errors.delete_quiz'), error);
            setError(t('quiz_management.errors.delete_quiz_message'));
        }
    };

    // 필터링 로직
    const filteredQuizzes = existingQuizzes.filter(quiz => {
        if (!filterText) return true;
        return quiz.title.toLowerCase().includes(filterText.toLowerCase());
    });

    // 퀴즈 생성 페이지로 이동
    const navigateToQuizCreator = (questions?: Question[]) => {
        if (!selectedCourse) return;

        navigate('/instructor/assessments/quiz-create', {
            state: {
                courseId: selectedCourse.value,
                courseName: selectedCourse.label,
                quizType: quizType,
                initialQuestions: questions || []
            }
        });
    };

    return (
        <SpaceBetween size="l">
            <Container header={<Header variant="h2">{t('quiz_management.subtitle')}</Header>}>
                <SpaceBetween size="l">
                    {error && <Alert type="error">{error}</Alert>}

                    <FormField label={t('quiz_management.course_selection')}>
                        <Select
                            selectedOption={selectedCourse}
                            onChange={({ detail }) => setSelectedCourse(detail.selectedOption)}
                            options={courses}
                            placeholder={tString('quiz_management.course_placeholder')}
                            filteringType="auto"
                            statusType={loadingCourses ? "loading" : "finished"}
                            loadingText={tString('quiz_management.loading.courses')}
                            empty={
                                <Box textAlign="center" color="inherit">
                                    <b>{t('quiz_management.empty_states.no_courses')}</b>
                                    <Box padding={{ bottom: "xs" }}>
                                        {t('quiz_management.empty_states.register_course')}
                                    </Box>
                                </Box>
                            }
                        />
                    </FormField>

                    <FormField label={t('quiz_management.quiz_type')}>
                        <SegmentedControl
                            selectedId={quizType}
                            onChange={({ detail }) => setQuizType(detail.selectedId as 'pre' | 'post')}
                            label={tString('quiz_management.select_quiz_type')}
                            options={[
                                { id: 'pre', text: tString('quiz_management.pre_quiz') },
                                { id: 'post', text: tString('quiz_management.post_quiz') },
                            ]}
                        />
                    </FormField>

                    {quizType === 'post' && (
                        <Checkbox
                            checked={syncQuizzes}
                            onChange={({ detail }) => setSyncQuizzes(detail.checked)}
                        >
                            {t('quiz_management.sync_with_pre_quiz')}
                        </Checkbox>
                    )}

                    <SpaceBetween direction="horizontal" size="xs">
                        <Button
                            variant="primary"
                            disabled={!selectedCourse || (quizType === 'post' && syncQuizzes)}
                            onClick={() => navigateToQuizCreator()}
                            iconName="add-plus"
                        >
                            {t('quiz_management.actions.create_quiz')}
                        </Button>
                        <Button
                            onClick={generateQuizWithAI}
                            iconName="file-open"
                            disabled={!selectedCourse}
                        >
                            {t('quiz_management.actions.ai_generate')}
                        </Button>
                        {quizType === 'post' && syncQuizzes && (
                            <Button
                                variant="normal"
                                iconName="copy"
                                onClick={copyFromPreQuiz}
                                disabled={!selectedCourse}
                            >
                                {t('quiz_management.actions.copy_from_pre')}
                            </Button>
                        )}
                    </SpaceBetween>
                </SpaceBetween>
            </Container>

            {/* 기존 퀴즈 목록 */}
            <Container
                header={
                    <Header
                        variant="h2"
                        description={t('quiz_management.existing_quiz_description', {
                            type: quizType === 'pre' ? t('quiz_management.pre_quiz') : t('quiz_management.post_quiz')
                        })}
                        actions={
                            <TextFilter
                                filteringText={filterText}
                                filteringPlaceholder={tString('quiz_management.filter_placeholder')}
                                filteringAriaLabel={tString('quiz_management.filter_aria_label')}
                                onChange={({ detail }) => setFilterText(detail.filteringText)}
                            />
                        }
                    >
                        {t('quiz_management.existing_quizzes')}
                    </Header>
                }
            >
                <Table
                    items={filteredQuizzes}
                    loading={loadingQuizzes}
                    loadingText={tString('quiz_management.loading.quizzes')}
                    columnDefinitions={[
                        {
                            id: "title",
                            header: t('quiz_management.columns.title'),
                            cell: item => item.title,
                            sortingField: 'title'
                        },
                        {
                            id: "questionCount",
                            header: t('quiz_management.columns.question_count'),
                            cell: item => item.questionCount
                        },
                        {
                            id: "createdAt",
                            header: t('quiz_management.columns.created_at'),
                            cell: item => new Date(item.createdAt).toLocaleDateString(),
                            sortingField: 'createdAt'
                        },
                        {
                            id: "actions",
                            header: t('quiz_management.columns.actions'),
                            cell: item => (
                                <SpaceBetween direction="horizontal" size="xs">
                                    <Button
                                        iconName="search"
                                        onClick={() => navigate(`/instructor/assessments/quiz-view/\${item.id}`)}
                                    >
                                        {t('quiz_management.actions.view')}
                                    </Button>
                                    <Button
                                        iconName="edit"
                                        onClick={() => navigate(`/instructor/assessments/quiz-create`, {
                                            state: {
                                                quizId: item.id,
                                                courseId: item.courseId,
                                                courseName: item.courseName,
                                                quizType: item.quizType,
                                                editMode: true
                                            }
                                        })}
                                    >
                                        {t('quiz_management.actions.edit')}
                                    </Button>
                                    <Button
                                        iconName="remove"
                                        onClick={() => deleteQuiz(item.id)}
                                    >
                                        {t('quiz_management.actions.delete')}
                                    </Button>
                                </SpaceBetween>
                            )
                        }
                    ]}
                    empty={
                        <Box textAlign="center" color="inherit">
                            <b>{t('quiz_management.empty_states.no_quizzes')}</b>
                            <Box padding={{ bottom: "xs" }}>
                                {t('quiz_management.empty_states.create_new_quiz')}
                            </Box>
                            <Button onClick={() => navigateToQuizCreator()} iconName="add-plus">
                                {t('quiz_management.actions.create_quiz')}
                            </Button>
                        </Box>
                    }
                    sortingDisabled={false}
                    sortingColumn={{ sortingField: 'createdAt' }}
                    sortingDescending={true}
                />
            </Container>

            {/* AI 퀴즈 생성 모달 */}
            <Modal
                visible={showAiModal}
                onDismiss={() => setShowAiModal(false)}
                header={t('quiz_management.modal.ai_generation', {
                    type: quizType === 'pre' ? t('quiz_management.pre_quiz') : t('quiz_management.post_quiz')
                })}
                size="large"
            >
                {loading ? (
                    <Box textAlign="center" padding="l">
                        <Spinner />
                        <p>{t('quiz_management.modal.generating')}</p>
                    </Box>
                ) : (
                    <SpaceBetween size="l">
                        {error && <Alert type="error">{error}</Alert>}

                        {/* AI 모델 선택 */}
                        <FormField label={t('quiz_management.model_selection')}>
                            <SegmentedControl
                                selectedId={aiModelType}
                                onChange={({ detail }) => setAiModelType(detail.selectedId as 'basic' | 'advanced')}
                                options={[
                                    { id: 'basic', text: tString('quiz_management.model_types.basic') },
                                    { id: 'advanced', text: tString('quiz_management.model_types.advanced') },
                                ]}
                            />
                            <Box color="text-status-info" fontSize="body-s" padding={{ top: "xxxs" }}>
                                {aiModelType === 'advanced' ?
                                    t('quiz_management.model_description.advanced') :
                                    t('quiz_management.model_description.basic')}
                            </Box>
                        </FormField>

                        {generatedQuestions.length > 0 && (
                            <>
                                <p>{t('quiz_management.modal.generated_count', { count: generatedQuestions.length })}</p>

                                {/* 생성된 질문 목록 표시 */}
                                <Table
                                    columnDefinitions={[
                                        {
                                            id: "question",
                                            header: t('quiz_management.modal.question'),
                                            cell: item => (
                                                <div>
                                                    <div>{item.question}</div>
                                                    <Box color="text-status-success" fontSize="body-s">
                                                        {item.options.map((opt: string, idx: number) => (
                                                            <span key={idx}>
                                                                {(item.correctAnswer === idx || item.correctAnswer === opt) &&
                                                                    `\${t('quiz_management.correct_answer')}: \${opt}`}
                                                            </span>
                                                        ))}
                                                    </Box>
                                                </div>
                                            )
                                        },
                                        {
                                            id: "quality",
                                            header: t('quiz_management.modal.quality'),
                                            cell: item => (
                                                <Box color={item.quality >= 0.8 ? "text-status-success" :
                                                    item.quality >= 0.6 ? "text-status-info" :
                                                        "text-status-warning"}>
                                                    {item.quality >= 0.8 ? t('quiz_management.quality.high') :
                                                        item.quality >= 0.6 ? t('quiz_management.quality.medium') :
                                                            t('quiz_management.quality.low')}
                                                </Box>
                                            )
                                        }
                                    ]}
                                    items={generatedQuestions.map((q, i) => ({ ...q, quality: Math.random() * 0.4 + 0.5 }))}
                                    trackBy="question"
                                    selectionType="multi"
                                    empty={
                                        <Box textAlign="center">{t('quiz_management.no_questions_generated')}</Box>
                                    }
                                    header={<Header>{t('quiz_management.generated_questions')}</Header>}
                                />

                                <SpaceBetween direction="horizontal" size="xs" alignItems="center">
                                    <Button onClick={() => generateQuizWithAI()}>
                                        {t('quiz_management.actions.regenerate')}
                                    </Button>
                                    <Button onClick={() => setShowAiModal(false)}>
                                        {t('quiz_management.actions.cancel')}
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={() => {
                                            setShowAiModal(false);
                                            navigateToQuizCreator(generatedQuestions);
                                        }}
                                    >
                                        {t('quiz_management.actions.create_with_questions')}
                                    </Button>
                                </SpaceBetween>
                            </>
                        )}

                        {generatedQuestions.length === 0 && !loading && !error && (
                            <SpaceBetween size="l">
                                <Box textAlign="center">
                                    {t('quiz_management.empty_states.no_generated_questions')}
                                </Box>
                                <SpaceBetween direction="horizontal" size="xs" alignItems="center">
                                    <Button onClick={() => setShowAiModal(false)}>
                                        {t('quiz_management.actions.cancel')}
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={() => generateQuizWithAI()}
                                    >
                                        {t('quiz_management.actions.try_generation')}
                                    </Button>
                                </SpaceBetween>
                            </SpaceBetween>
                        )}
                    </SpaceBetween>
                )}
            </Modal>
        </SpaceBetween>
    );
}