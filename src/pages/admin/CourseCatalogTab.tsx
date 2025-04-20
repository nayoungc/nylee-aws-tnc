import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    SpaceBetween,
    Box,
    Pagination,
    TextFilter,
    Header,
    Modal,
    FormField,
    Input,
    Select,
    Textarea,
    Alert,
    Multiselect
} from '@cloudscape-design/components';
import { generateClient } from 'aws-amplify/api';
import { useTypedTranslation } from '@utils/i18n-utils';
import {
    listCourseCatalog,
    getCourseCatalog
} from '@graphql/queries';
import {
    createCourseCatalog,
    updateCourseCatalog,
    deleteCourseCatalog
} from '@graphql/mutations';

// 백엔드 스키마와 일치하는 인터페이스
interface CourseCatalog {
    id?: string;
    course_id: string;
    course_name: string;
    description?: string;
    duration?: string;
    level?: string;
    delivery_method?: string;
    objectives?: string[];
    target_audience?: string[];
    createdAt?: string;
    updatedAt?: string;
}

// UI에 표시할 뷰 모델
interface CourseViewModel {
    id: string;
    course_id: string;
    course_name: string;
    title: string; // course_name과 동일 (UI 호환성용)
    description?: string;
    duration?: string;
    level?: string;
    delivery_method?: string;
    objectives?: string[];
    target_audience?: string[];
    // UI 추가 필드
    status?: string;
    createdAt?: string;
    updatedAt?: string;
}

// GraphQL 응답 인터페이스
interface GraphQLResponse<T> {
    data?: T;
    errors?: any[];
}

interface ListCourseCatalogsResponse {
    listCourseCatalogs: {
        items: CourseCatalog[];
        nextToken?: string;
    };
}

interface GetCourseCatalogResponse {
    getCourseCatalog: CourseCatalog;
}

interface CreateCourseCatalogResponse {
    createCourseCatalog: CourseCatalog;
}

interface UpdateCourseCatalogResponse {
    updateCourseCatalog: CourseCatalog;
}

interface DeleteCourseCatalogResponse {
    deleteCourseCatalog: CourseCatalog;
}

// 백엔드 데이터를 UI 뷰모델로 변환하는 함수
const mapToViewModel = (course: CourseCatalog): CourseViewModel => {
    return {
        id: course.id || '',
        course_id: course.course_id || '',
        course_name: course.course_name || '',
        title: course.course_name || '', // UI 호환성용
        description: course.description,
        duration: course.duration,
        level: course.level,
        delivery_method: course.delivery_method,
        objectives: course.objectives || [],
        target_audience: course.target_audience || [],
        status: 'ACTIVE', // UI용 기본값
        createdAt: course.createdAt,
        updatedAt: course.updatedAt
    };
};

// UI 뷰모델을 백엔드 데이터로 변환하는 함수
const mapToBackendModel = (viewModel: CourseViewModel): CourseCatalog => {
    return {
        id: viewModel.id,
        course_id: viewModel.course_id,
        course_name: viewModel.course_name,
        description: viewModel.description,
        duration: viewModel.duration,
        level: viewModel.level,
        delivery_method: viewModel.delivery_method,
        objectives: viewModel.objectives,
        target_audience: viewModel.target_audience
    };
};

const CourseCatalogTab: React.FC = () => {
    const { tString, t } = useTypedTranslation();

    // 상태 관리
    const [courses, setCourses] = useState<CourseViewModel[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentCourse, setCurrentCourse] = useState<CourseViewModel | null>(null);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false);
    const [filterText, setFilterText] = useState<string>('');
    const [currentPageIndex, setCurrentPageIndex] = useState<number>(1);
    const [error, setError] = useState<string | null>(null);
    const [nextToken, setNextToken] = useState<string | null>(null);

    // 목표와 대상 청중을 위한 선택 옵션
    const [objectiveOptions, setObjectiveOptions] = useState<{ label: string, value: string }[]>([]);
    const [audienceOptions, setAudienceOptions] = useState<{ label: string, value: string }[]>([]);

    // API 클라이언트 생성
    const client = generateClient();

    // DynamoDB에서 과정 목록 가져오기
    const fetchCourses = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await client.graphql({
                query: listCourseCatalog,
                variables: {
                    limit: 100,
                    nextToken: nextToken
                },
                authMode: 'userPool'
            }) as GraphQLResponse<ListCourseCatalogsResponse>;

            if (result.data?.listCourseCatalogs?.items) {
                // 백엔드 데이터를 뷰모델로 변환
                const viewModels = result.data.listCourseCatalogs.items.map(mapToViewModel);
                setCourses(viewModels);
                setNextToken(result.data.listCourseCatalogs.nextToken || null);

                // 모든 과정에서 고유 목표 및 대상 청중 수집
                const allObjectives = new Set<string>();
                const allAudiences = new Set<string>();

                result.data.listCourseCatalogs.items.forEach(course => {
                    course.objectives?.forEach(obj => allObjectives.add(obj));
                    course.target_audience?.forEach(audience => allAudiences.add(audience));
                });

                setObjectiveOptions(Array.from(allObjectives).map(obj => ({ label: obj, value: obj })));
                setAudienceOptions(Array.from(allAudiences).map(audience => ({ label: audience, value: audience })));
            }
        } catch (err) {
            console.error(t('admin.courses.error_loading'), err);
            setError(t('admin.courses.error_loading'));

            // 개발 환경에서는 샘플 데이터 제공
            if (process.env.NODE_ENV === 'development') {
                setCourses([
                    {
                        id: '1',
                        course_id: 'AWS-CP',
                        course_name: 'AWS Cloud Practitioner',
                        title: 'AWS Cloud Practitioner',
                        description: 'Fundamental AWS concepts',
                        duration: '20',
                        level: 'BEGINNER',
                        delivery_method: 'Online',
                        objectives: ['Learn AWS basics', 'Understand cloud concepts'],
                        target_audience: ['Beginners', 'IT Professionals'],
                        status: 'ACTIVE'
                    },
                    {
                        id: '2',
                        course_id: 'AWS-SAA',
                        course_name: 'AWS Solutions Architect',
                        title: 'AWS Solutions Architect',
                        description: 'Advanced architecture patterns',
                        duration: '40',
                        level: 'ADVANCED',
                        delivery_method: 'Blended',
                        objectives: ['Design resilient architectures', 'Design high-performance architectures'],
                        target_audience: ['Architects', 'Cloud Engineers'],
                        status: 'ACTIVE'
                    }
                ]);

                setObjectiveOptions([
                    { label: 'Learn AWS basics', value: 'Learn AWS basics' },
                    { label: 'Understand cloud concepts', value: 'Understand cloud concepts' },
                    { label: 'Design resilient architectures', value: 'Design resilient architectures' },
                    { label: 'Design high-performance architectures', value: 'Design high-performance architectures' }
                ]);

                setAudienceOptions([
                    { label: 'Beginners', value: 'Beginners' },
                    { label: 'IT Professionals', value: 'IT Professionals' },
                    { label: 'Architects', value: 'Architects' },
                    { label: 'Cloud Engineers', value: 'Cloud Engineers' }
                ]);
            }
        } finally {
            setLoading(false);
        }
    };

    // 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        fetchCourses();
    }, []);

    // 검색 텍스트 기반 필터링
    const filteredItems = courses.filter(course =>
        !filterText ||
        course.course_name.toLowerCase().includes(filterText.toLowerCase()) ||
        course.description?.toLowerCase().includes(filterText.toLowerCase()) ||
        course.course_id.toLowerCase().includes(filterText.toLowerCase())
    );

    // 페이지네이션 설정
    const PAGE_SIZE = 10;
    const paginatedItems = filteredItems.slice(
        (currentPageIndex - 1) * PAGE_SIZE,
        currentPageIndex * PAGE_SIZE
    );

    // 새 과정 생성
    const handleCreateCourse = () => {
        const newCourse: CourseViewModel = {
            id: '',
            course_id: '',
            course_name: '',
            title: '',
            description: '',
            duration: '',
            level: 'BEGINNER',
            delivery_method: '',
            objectives: [],
            target_audience: [],
            status: 'ACTIVE'
        };
        setCurrentCourse(newCourse);
        setIsModalVisible(true);
    };

    // 기존 과정 수정
    const handleEditCourse = async (course: CourseViewModel) => {
        setLoading(true);
        try {
            // 최신 과정 데이터 가져오기
            if (course.id) {
                const result = await client.graphql({
                    query: getCourseCatalog,
                    variables: { id: course.id },
                    authMode: 'userPool'
                }) as GraphQLResponse<GetCourseCatalogResponse>;

                if (result.data?.getCourseCatalog) {
                    // 백엔드 데이터를 뷰모델로 변환
                    const viewModel = mapToViewModel(result.data.getCourseCatalog);
                    setCurrentCourse(viewModel);
                } else {
                    setCurrentCourse({ ...course });
                }
            }
        } catch (err) {
            console.error('Error fetching course details:', err);
            setCurrentCourse({ ...course });
        } finally {
            setLoading(false);
            setIsModalVisible(true);
        }
    };

    // 삭제 확인 모달 표시
    const handleDeleteCourseClick = (course: CourseViewModel) => {
        setCurrentCourse(course);
        setIsDeleteModalVisible(true);
    };

    // 과정 저장 (생성 또는 수정)
    const handleSaveCourse = async () => {
        if (!currentCourse || !currentCourse.course_name || !currentCourse.course_id) return;

        setLoading(true);
        setError(null);

        try {
            // 뷰모델을 백엔드 모델로 변환
            const backendModel = mapToBackendModel(currentCourse);

            if (currentCourse.id) {
                // 기존 과정 수정
                const result = await client.graphql({
                    query: updateCourseCatalog,
                    variables: {
                        input: {
                            id: backendModel.id,
                            course_id: backendModel.course_id,
                            course_name: backendModel.course_name,
                            description: backendModel.description,
                            duration: backendModel.duration,
                            level: backendModel.level,
                            delivery_method: backendModel.delivery_method,
                            objectives: backendModel.objectives,
                            target_audience: backendModel.target_audience
                        }
                    },
                    authMode: 'userPool'
                }) as GraphQLResponse<UpdateCourseCatalogResponse>;

                // 수정된 과정으로 상태 업데이트
                if (result.data?.updateCourseCatalog) {
                    const updatedViewModel = mapToViewModel(result.data.updateCourseCatalog);
                    setCourses(prevCourses =>
                        prevCourses.map(c => c.id === currentCourse.id ? updatedViewModel : c)
                    );
                }
            } else {
                // 새 과정 생성
                const result = await client.graphql({
                    query: createCourseCatalog,
                    variables: {
                        input: {
                            course_id: backendModel.course_id,
                            course_name: backendModel.course_name,
                            description: backendModel.description,
                            duration: backendModel.duration,
                            level: backendModel.level,
                            delivery_method: backendModel.delivery_method,
                            objectives: backendModel.objectives,
                            target_audience: backendModel.target_audience
                        }
                    },
                    authMode: 'userPool'
                }) as GraphQLResponse<CreateCourseCatalogResponse>;

                // 새 과정을 상태에 추가
                if (result.data?.createCourseCatalog) {
                    const newViewModel = mapToViewModel(result.data.createCourseCatalog);
                    setCourses(prevCourses => [...prevCourses, newViewModel]);
                }
            }

            // 모달 닫기
            setIsModalVisible(false);
            setCurrentCourse(null);
        } catch (err) {
            console.error(t('admin.courses.error_saving'), err);
            setError(t('admin.courses.error_saving'));
        } finally {
            setLoading(false);
        }
    };

    // 과정 삭제
    const handleDeleteCourse = async () => {
        if (!currentCourse?.id) return;

        setLoading(true);
        setError(null);

        try {
            const result = await client.graphql({
                query: deleteCourseCatalog,
                variables: {
                    input: { id: currentCourse.id }
                },
                authMode: 'userPool'
            }) as GraphQLResponse<DeleteCourseCatalogResponse>;

            if (result.data?.deleteCourseCatalog) {
                // 삭제된 과정 제거
                setCourses(prevCourses =>
                    prevCourses.filter(c => c.id !== currentCourse.id)
                );
            }

            // 모달 닫기
            setIsDeleteModalVisible(false);
            setCurrentCourse(null);
        } catch (err) {
            console.error(t('admin.courses.error_deleting'), err);
            setError(t('admin.courses.error_deleting'));
        } finally {
            setLoading(false);
        }
    };

    const getLevelLabel = (level: string): string => {
        switch (level) {
            case 'BEGINNER': return t('conversation.difficulty.beginner');
            case 'INTERMEDIATE': return t('conversation.difficulty.intermediate');
            case 'ADVANCED': return t('conversation.difficulty.advanced');
            default: return level;
        }
    };

    return (
        <Box padding="m">
            {error && (
                <Alert type="error" dismissible onDismiss={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <SpaceBetween size="l">
                {/* 헤더 및 검색 도구 */}
                <Box>
                    <SpaceBetween direction="horizontal" size="m">
                        <Header
                            variant="h1"
                            actions={
                                <Button
                                    variant="primary"
                                    onClick={handleCreateCourse}
                                    iconName="add-plus"
                                >
                                    {t('admin.courses.add_course')}
                                </Button>
                            }
                        >
                            {t('admin.courses.course_management')}
                        </Header>

                        <TextFilter
                            filteringText={filterText}
                            filteringPlaceholder={tString('admin.instructors.search_placeholder')}
                            filteringAriaLabel={tString('admin.instructors.search_aria_label')}
                            onChange={({ detail }) => setFilterText(detail.filteringText)}
                        />
                    </SpaceBetween>
                </Box>

                {/* 과정 테이블 */}
                <Table
                    loading={loading}
                    items={paginatedItems}
                    columnDefinitions={[
                        {
                            id: "course_id",
                            header: t('admin.courses.column.course_id'),
                            cell: item => item.course_id,
                            sortingField: "course_id"
                        },
                        {
                            id: "course_name",
                            header: t('admin.courses.column.title'),
                            cell: item => item.course_name,
                            sortingField: "course_name"
                        },
                        {
                            id: "duration",
                            header: t('admin.courses.column.duration'),
                            cell: item => item.duration ? `\${item.duration} \${t('admin.courses.hours')}` : "-",
                            sortingField: "duration"
                        },
                        {
                            id: "level",
                            header: t('admin.courses.column.level'),
                            cell: item => getLevelLabel(item.level || '')
                        },
                        {
                            id: "delivery_method",
                            header: t('admin.courses.column.delivery_method'),
                            cell: item => item.delivery_method || "-"
                        },
                        {
                            id: "actions",
                            header: t('admin.common.actions'),
                            cell: item => (
                                <SpaceBetween direction="horizontal" size="xs">
                                    <Button
                                        variant="normal"
                                        onClick={() => handleEditCourse(item)}
                                    >
                                        {t('admin.common.edit')}
                                    </Button>
                                    <Button
                                        variant="link"
                                        onClick={() => handleDeleteCourseClick(item)}
                                    >
                                        {t('admin.common.delete')}
                                    </Button>
                                </SpaceBetween>
                            )
                        }
                    ]}
                    empty={
                        <Box textAlign="center" color="inherit">
                            <b>{t('admin.courses.no_courses')}</b>
                            <Box padding={{ bottom: "s" }} variant="p" color="inherit">
                                {t('admin.courses.add_new_course_desc')}
                            </Box>
                            <Button onClick={handleCreateCourse}>
                                {t('admin.courses.add_course')}
                            </Button>
                        </Box>
                    }
                    header={
                        <Header
                            counter={`(\${filteredItems.length})`}
                        />
                    }
                    pagination={
                        <Pagination
                            currentPageIndex={currentPageIndex}
                            onChange={({ detail }) =>
                                setCurrentPageIndex(detail.currentPageIndex)
                            }
                            pagesCount={Math.max(
                                1,
                                Math.ceil(filteredItems.length / PAGE_SIZE)
                            )}
                            ariaLabels={{
                                nextPageLabel: tString('admin.common.pagination.next'),
                                previousPageLabel: tString('admin.common.pagination.previous'),
                                pageLabel: pageNumber =>
                                    t('admin.common.pagination.page_label', { pageNumber })
                            }}
                        />
                    }
                />
            </SpaceBetween>

            {/* 과정 추가/수정 모달 */}
            <Modal
                visible={isModalVisible}
                onDismiss={() => setIsModalVisible(false)}
                header={currentCourse?.id ? t('admin.courses.edit_course') : t('admin.courses.add_new_course')}
                footer={
                    <Box float="right">
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button variant="link" onClick={() => setIsModalVisible(false)}>
                                {t('admin.common.cancel')}
                            </Button>
                            <Button variant="primary" onClick={handleSaveCourse} loading={loading}>
                                {t('admin.common.save')}
                            </Button>
                        </SpaceBetween>
                    </Box>
                }
            >
                {currentCourse && (
                    <SpaceBetween size="l">
                        <FormField
                            label={t('admin.courses.form.course_id')}
                            errorText={!currentCourse.course_id ? t('admin.courses.form.course_id_required') : undefined}
                        >
                            <Input
                                value={currentCourse.course_id}
                                onChange={({ detail }) =>
                                    setCurrentCourse(prev => prev ? ({ ...prev, course_id: detail.value }) : null)
                                }
                            />
                        </FormField>

                        <FormField
                            label={t('admin.courses.form.title')}
                            errorText={!currentCourse.course_name ? t('admin.courses.form.title_required') : undefined}
                        >
                            <Input
                                value={currentCourse.course_name}
                                onChange={({ detail }) => {
                                    const value = detail.value;
                                    setCurrentCourse(prev => prev ? ({
                                        ...prev,
                                        course_name: value,
                                        title: value // title과 course_name 동기화
                                    }) : null);
                                }}
                            />
                        </FormField>

                        <FormField label={t('admin.courses.form.description')}>
                            <Textarea
                                value={currentCourse.description || ''}
                                onChange={({ detail }) =>
                                    setCurrentCourse(prev => prev ? ({ ...prev, description: detail.value }) : null)
                                }
                                rows={4}
                            />
                        </FormField>

                        <FormField label={t('admin.courses.form.duration')}>
                            <Input
                                value={currentCourse.duration || ''}
                                onChange={({ detail }) =>
                                    setCurrentCourse(prev => prev ? ({ ...prev, duration: detail.value }) : null)
                                }
                            />
                        </FormField>

                        <FormField label={t('admin.courses.form.level')}>
                            <Select
                                selectedOption={{
                                    label: getLevelLabel(currentCourse.level || 'BEGINNER'),
                                    value: currentCourse.level || 'BEGINNER'
                                }}
                                onChange={({ detail }) =>
                                    setCurrentCourse(prev => prev ? ({ ...prev, level: detail.selectedOption.value }) : null)
                                }
                                options={[
                                    { label: tString('conversation.difficulty.beginner'), value: 'BEGINNER' },
                                    { label: tString('conversation.difficulty.intermediate'), value: 'INTERMEDIATE' },
                                    { label: tString('conversation.difficulty.advanced'), value: 'ADVANCED' }
                                ]}
                            />
                        </FormField>

                        <FormField label={t('admin.courses.form.delivery_method')}>
                            <Input
                                value={currentCourse.delivery_method || ''}
                                onChange={({ detail }) =>
                                    setCurrentCourse(prev => prev ? ({ ...prev, delivery_method: detail.value }) : null)
                                }
                            />
                        </FormField>

                        <FormField label={t('admin.courses.form.objectives')}>
                            <Multiselect
                                selectedOptions={
                                    currentCourse.target_audience?.map(audience => ({ label: audience, value: audience })) || []
                                }
                                onChange={({ detail }) =>
                                    setCurrentCourse(prev => prev ? ({
                                        ...prev,
                                        target_audience: detail.selectedOptions
                                            .map(option => option.value)
                                            .filter((value): value is string => value !== undefined)
                                    }) : null)
                                }
                                options={audienceOptions}
                                placeholder={tString('admin.courses.form.select_audience')}

                                // 필터링 관련
                                filteringType="auto"
                                filteringPlaceholder={tString('admin.courses.form.search_audience')}

                                // 옵션 생성 관련 속성은 타입 단언 사용
                                {...({
                                    allowCreation: true,
                                    createTokens: [',', ';', 'Enter'],
                                    createOptionText: tString('admin.courses.form.create_new'),
                                } as any)}

                                // 기본 i18nStrings만 유지
                                i18nStrings={{
                                    selectAllText: tString('admin.common.select_all'),
                                    tokenLimitShowMore: tString('admin.common.show_more'),
                                    tokenLimitShowFewer: tString('admin.common.show_fewer')
                                }}

                                // 접근성 관련
                                ariaLabel={tString('admin.courses.form.target_audience')}
                            />
                        </FormField>

                        <FormField label={t('admin.courses.form.target_audience')}>
                            <Multiselect
                                selectedOptions={
                                    currentCourse.target_audience?.map(audience => ({ label: audience, value: audience })) || []
                                }
                                onChange={({ detail }) =>
                                    setCurrentCourse(prev => prev ? ({
                                        ...prev,
                                        target_audience: detail.selectedOptions
                                            .map(option => option.value)
                                            .filter((value): value is string => value !== undefined)
                                    }) : null)
                                }
                                options={audienceOptions}
                                placeholder={tString('admin.courses.form.select_audience')}

                                // 필터링 관련
                                filteringType="auto"
                                filteringPlaceholder={tString('admin.courses.form.search_audience')}

                                // 옵션 생성 관련 속성은 타입 단언 사용
                                {...({
                                    allowCreation: true,
                                    createTokens: [',', ';', 'Enter'],
                                    createOptionText: tString('admin.courses.form.create_new'),
                                } as any)}

                                // 기본 i18nStrings만 유지
                                i18nStrings={{
                                    selectAllText: tString('admin.common.select_all'),
                                    tokenLimitShowMore: tString('admin.common.show_more'),
                                    tokenLimitShowFewer: tString('admin.common.show_fewer')
                                }}

                                // 접근성 관련
                                ariaLabel={tString('admin.courses.form.target_audience')}
                            />
                        </FormField>
                    </SpaceBetween>
                )}
            </Modal>

            {/* 삭제 확인 모달 */}
            <Modal
                visible={isDeleteModalVisible}
                onDismiss={() => setIsDeleteModalVisible(false)}
                header={t('admin.courses.delete_course')}
                footer={
                    <Box float="right">
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button variant="link" onClick={() => setIsDeleteModalVisible(false)}>
                                {t('admin.common.cancel')}
                            </Button>
                            <Button variant="primary" onClick={handleDeleteCourse} loading={loading}>
                                {t('admin.common.delete')}
                            </Button>
                        </SpaceBetween>
                    </Box>
                }
            >
                <Box variant="p">
                    {t('admin.courses.delete_confirm', { title: currentCourse?.course_name })}
                </Box>
            </Modal>
        </Box>
    );
};

export default CourseCatalogTab;