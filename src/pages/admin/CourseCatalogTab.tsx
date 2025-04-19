// src/pages/admin/CourseCatalogTab.tsx
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
    Checkbox,
    DatePicker,
    Alert
} from '@cloudscape-design/components';
import { generateClient } from 'aws-amplify/api';
import { listCourses, getCourse } from '../../graphql/queries';
import { createCourse, updateCourse, deleteCourse } from '../../graphql/mutations';
import { Course } from '../../models/Course';
import { useTypedTranslation } from '../../utils/i18n-utils';

// GraphQL 응답 타입 인터페이스
interface GraphQLResponse<T> {
    data?: T;
    errors?: any[];
}

// 쿼리 응답 인터페이스
interface ListCoursesResponse {
    listCourses: {
        items: Course[];
        nextToken?: string;
    };
}

interface GetCourseResponse {
    getCourse: Course;
}

// 뮤테이션 응답 인터페이스
interface CreateCourseResponse {
    createCourse: Course;
}

interface UpdateCourseResponse {
    updateCourse: Course;
}

interface DeleteCourseResponse {
    deleteCourse: Course;
}

const CourseCatalogTab: React.FC = () => {
    const { tString, t } = useTypedTranslation();

    // 상태 관리
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false);
    const [filterText, setFilterText] = useState<string>('');
    const [currentPageIndex, setCurrentPageIndex] = useState<number>(1);
    const [error, setError] = useState<string | null>(null);

    // API 클라이언트 생성
    const client = generateClient();

    // 과정 목록 불러오기
    const fetchCourses = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await client.graphql({
                query: listCourses,
                variables: {
                    limit: 20
                }
            }) as GraphQLResponse<ListCoursesResponse>;

            if (result.data?.listCourses?.items) {
                setCourses(result.data.listCourses.items);
            }
        } catch (err) {
            console.error(t('admin.courses.error_loading'), err);
            setError(t('admin.courses.error_loading'));
        } finally {
            setLoading(false);
        }
    };

    // 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        fetchCourses();
    }, []);

    // 필터링된 아이템
    const filteredItems = courses.filter(course =>
        !filterText ||
        course.title?.toLowerCase().includes(filterText.toLowerCase()) ||
        course.description?.toLowerCase().includes(filterText.toLowerCase()) ||
        course.category?.toLowerCase().includes(filterText.toLowerCase())
    );

    // 페이지당 아이템 수
    const PAGE_SIZE = 10;
    const paginatedItems = filteredItems.slice(
        (currentPageIndex - 1) * PAGE_SIZE,
        currentPageIndex * PAGE_SIZE
    );

    // 새 과정 만들기
    const handleCreateCourse = () => {
        setCurrentCourse({
            title: '',
            description: '',
            duration: 0,
            level: 'BEGINNER',
            price: 0,
            category: '',
            isActive: true
        });
        setIsModalVisible(true);
    };

    // 과정 수정
    const handleEditCourse = (course: Course) => {
        setCurrentCourse({ ...course });
        setIsModalVisible(true);
    };

    // 과정 삭제 모달 표시
    const handleDeleteCourseClick = (course: Course) => {
        setCurrentCourse(course);
        setIsDeleteModalVisible(true);
    };

    // 과정 저장 (생성/수정)
    const handleSaveCourse = async () => {
        if (!currentCourse || !currentCourse.title) return;

        setLoading(true);
        setError(null);

        try {
            if (currentCourse.id) {
                // 기존 과정 수정
                const courseInput = {
                    id: currentCourse.id,
                    title: currentCourse.title,
                    description: currentCourse.description,
                    duration: currentCourse.duration,
                    level: currentCourse.level,
                    price: currentCourse.price,
                    category: currentCourse.category,
                    publishedDate: currentCourse.publishedDate,
                    isActive: currentCourse.isActive
                };

                const result = await client.graphql({
                    query: updateCourse,
                    variables: { input: courseInput }
                }) as GraphQLResponse<UpdateCourseResponse>;

                // 수정된 과정으로 상태 업데이트
                if (result.data?.updateCourse) {
                    setCourses(prevCourses =>
                        prevCourses.map(c => c.id === currentCourse.id ? result.data!.updateCourse : c)
                    );
                }
            } else {
                // 새 과정 생성
                const courseInput = {
                    title: currentCourse.title,
                    description: currentCourse.description,
                    duration: currentCourse.duration,
                    level: currentCourse.level,
                    price: currentCourse.price,
                    category: currentCourse.category,
                    publishedDate: currentCourse.publishedDate,
                    isActive: currentCourse.isActive
                };

                const result = await client.graphql({
                    query: createCourse,
                    variables: { input: courseInput }
                }) as GraphQLResponse<CreateCourseResponse>;

                // 생성된 과정 추가
                if (result.data?.createCourse) {
                    setCourses(prevCourses => [...prevCourses, result.data!.createCourse]);
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
                query: deleteCourse,
                variables: {
                    input: { id: currentCourse.id }
                }
            }) as GraphQLResponse<DeleteCourseResponse>;

            if (result.data?.deleteCourse) {
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
                {/* 헤더 및 검색/필터 도구 */}
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
                            id: "title",
                            header: t('admin.courses.column.title'),
                            cell: item => item.title,
                            sortingField: "title"
                        },
                        {
                            id: "category",
                            header: t('admin.courses.column.category'),
                            cell: item => item.category || "-",
                            sortingField: "category"
                        },
                        {
                            id: "duration",
                            header: t('admin.courses.column.duration'),
                            cell: item => item.duration || "-",
                            sortingField: "duration"
                        },
                        {
                            id: "level",
                            header: t('admin.courses.column.level'),
                            cell: item => getLevelLabel(item.level || '')
                        },
                        {
                            id: "price",
                            header: t('admin.courses.column.price'),
                            cell: item => item.price ? `\${item.price.toLocaleString()}\${t('admin.courses.currency')}` : "-"
                        },
                        {
                            id: "status",
                            header: t('admin.courses.column.status'),
                            cell: item => item.isActive ? t('admin.common.active') : t('admin.common.inactive')
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
                            <Button variant="primary" onClick={handleSaveCourse}>
                                {t('admin.common.save')}
                            </Button>
                        </SpaceBetween>
                    </Box>
                }
            >
                {currentCourse && (
                    <SpaceBetween size="l">
                        <FormField label={t('admin.courses.form.title')}>
                            <Input
                                value={currentCourse.title}
                                onChange={({ detail }) =>
                                    setCurrentCourse(prev => prev ? ({ ...prev, title: detail.value }) : null)
                                }
                            />
                        </FormField>

                        <FormField label={t('admin.courses.form.category')}>
                            <Input
                                value={currentCourse.category || ''}
                                onChange={({ detail }) =>
                                    setCurrentCourse(prev => prev ? ({ ...prev, category: detail.value }) : null)
                                }
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
                                type="number"
                                value={currentCourse.duration?.toString() || '0'}
                                onChange={({ detail }) =>
                                    setCurrentCourse(prev => prev ? ({ ...prev, duration: parseInt(detail.value, 10) || 0 }) : null)
                                }
                            />
                        </FormField>

                        <FormField label={t('admin.courses.form.level')}>
                            <Select
                                selectedOption={
                                    {
                                        label: getLevelLabel(currentCourse.level || 'BEGINNER'),
                                        value: currentCourse.level || 'BEGINNER'
                                    }
                                }
                                onChange={({ detail }) =>
                                    setCurrentCourse(prev => prev ? ({ ...prev, level: detail.selectedOption.value }) : null)
                                }
                                options={[
                                    { label: tString('conversation.difficulty.beginner'), value: 'BEGINNER' },
                                    { label: tString('conversation.difficulty.intermediate'), value: 'INTERMEDIATE' },
                                    { label: ('conversation.difficulty.advanced'), value: 'ADVANCED' }
                                ]}
                            />
                        </FormField>

                        <FormField label={t('admin.courses.form.price')}>
                            <Input
                                type="number"
                                value={currentCourse.price?.toString() || '0'}
                                onChange={({ detail }) =>
                                    setCurrentCourse(prev => prev ? ({ ...prev, price: parseFloat(detail.value) || 0 }) : null)
                                }
                            />
                        </FormField>

                        <FormField label={t('admin.courses.form.published_date') as string}>
                            <DatePicker
                                value={currentCourse.publishedDate || ''}
                                onChange={({ detail }) =>
                                    setCurrentCourse(prev => prev ? ({ ...prev, publishedDate: detail.value }) : null)
                                }
                            />
                        </FormField>

                        <Checkbox
                            checked={currentCourse.isActive || false}
                            onChange={({ detail }) =>
                                setCurrentCourse(prev => prev ? ({ ...prev, isActive: detail.checked }) : null)
                            }
                        >
                            {t('admin.courses.form.active')}
                        </Checkbox>
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
                            <Button variant="primary" onClick={handleDeleteCourse}>
                                {t('admin.common.delete')}
                            </Button>
                        </SpaceBetween>
                    </Box>
                }
            >
                <Box variant="p">
                    {t('admin.courses.delete_confirm', { title: currentCourse?.title })}
                </Box>
            </Modal>
        </Box>
    );
};

export default CourseCatalogTab;