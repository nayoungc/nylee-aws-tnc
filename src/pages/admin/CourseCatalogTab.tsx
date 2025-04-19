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
import { Amplify } from 'aws-amplify';
import { useTypedTranslation } from '../../utils/i18n-utils';

// Define Course interface based on DynamoDB schema
interface Course {
    id?: string;
    title: string;
    description?: string;
    duration?: number;
    level?: string;
    price?: number;
    category?: string;
    publishedDate?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

// GraphQL operations for Tnc-CourseCatalog table
const listCourses = /* GraphQL */ `
  query ListCourses(
    \$filter: ModelTncCourseCatalogFilterInput
    \$limit: Int
    \$nextToken: String
  ) {
    listTncCourseCatalogs(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        id
        title
        description
        duration
        level
        price
        category
        publishedDate
        isActive
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

const getCourse = /* GraphQL */ `
  query GetCourse(\$id: ID!) {
    getTncCourseCatalog(id: \$id) {
      id
      title
      description
      duration
      level
      price
      category
      publishedDate
      isActive
      createdAt
      updatedAt
    }
  }
`;

const createCourse = /* GraphQL */ `
  mutation CreateCourse(\$input: CreateTncCourseCatalogInput!) {
    createTncCourseCatalog(input: \$input) {
      id
      title
      description
      duration
      level
      price
      category
      publishedDate
      isActive
      createdAt
      updatedAt
    }
  }
`;

const updateCourse = /* GraphQL */ `
  mutation UpdateCourse(\$input: UpdateTncCourseCatalogInput!) {
    updateTncCourseCatalog(input: \$input) {
      id
      title
      description
      duration
      level
      price
      category
      publishedDate
      isActive
      createdAt
      updatedAt
    }
  }
`;

const deleteCourse = /* GraphQL */ `
  mutation DeleteCourse(\$input: DeleteTncCourseCatalogInput!) {
    deleteTncCourseCatalog(input: \$input) {
      id
      title
    }
  }
`;

// GraphQL response interfaces
interface GraphQLResponse<T> {
    data?: T;
    errors?: any[];
}

interface ListCoursesResponse {
    listTncCourseCatalogs: {
        items: Course[];
        nextToken?: string;
    };
}

interface GetCourseResponse {
    getTncCourseCatalog: Course;
}

interface CreateCourseResponse {
    createTncCourseCatalog: Course;
}

interface UpdateCourseResponse {
    updateTncCourseCatalog: Course;
}

interface DeleteCourseResponse {
    deleteTncCourseCatalog: Course;
}

const CourseCatalogTab: React.FC = () => {
    const { tString, t } = useTypedTranslation();

    // State management
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false);
    const [filterText, setFilterText] = useState<string>('');
    const [currentPageIndex, setCurrentPageIndex] = useState<number>(1);
    const [error, setError] = useState<string | null>(null);
    const [nextToken, setNextToken] = useState<string | null>(null);

    // Create API client
    const client = generateClient();

    // Fetch courses from DynamoDB
    const fetchCourses = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await client.graphql({
                query: listCourses,
                variables: {
                    limit: 100,
                    nextToken: nextToken
                },
                authMode: 'userPool'
            }) as GraphQLResponse<ListCoursesResponse>;

            if (result.data?.listTncCourseCatalogs?.items) {
                setCourses(result.data.listTncCourseCatalogs.items);
                setNextToken(result.data.listTncCourseCatalogs.nextToken || null);
            }
        } catch (err) {
            console.error(t('admin.courses.error_loading'), err);
            setError(t('admin.courses.error_loading'));
            
            // If in dev environment, provide sample data
            if (process.env.NODE_ENV === 'development') {
                setCourses([
                    {
                        id: '1',
                        title: 'AWS Cloud Practitioner',
                        description: 'Fundamental AWS concepts',
                        duration: 20,
                        level: 'BEGINNER',
                        price: 29.99,
                        category: 'Cloud',
                        isActive: true
                    },
                    {
                        id: '2',
                        title: 'AWS Solutions Architect',
                        description: 'Advanced architecture patterns',
                        duration: 40,
                        level: 'ADVANCED',
                        price: 49.99,
                        category: 'Architecture',
                        isActive: true
                    }
                ]);
            }
        } finally {
            setLoading(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        fetchCourses();
    }, []);

    // Filter items based on search text
    const filteredItems = courses.filter(course =>
        !filterText ||
        course.title?.toLowerCase().includes(filterText.toLowerCase()) ||
        course.description?.toLowerCase().includes(filterText.toLowerCase()) ||
        course.category?.toLowerCase().includes(filterText.toLowerCase())
    );

    // Pagination settings
    const PAGE_SIZE = 10;
    const paginatedItems = filteredItems.slice(
        (currentPageIndex - 1) * PAGE_SIZE,
        currentPageIndex * PAGE_SIZE
    );

    // Create new course
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

    // Edit existing course
    const handleEditCourse = async (course: Course) => {
        setLoading(true);
        try {
            // Get the latest course data
            if (course.id) {
                const result = await client.graphql({
                    query: getCourse,
                    variables: { id: course.id },
                    authMode: 'userPool'
                }) as GraphQLResponse<GetCourseResponse>;
                
                if (result.data?.getTncCourseCatalog) {
                    setCurrentCourse({ ...result.data.getTncCourseCatalog });
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

    // Show delete confirmation modal
    const handleDeleteCourseClick = (course: Course) => {
        setCurrentCourse(course);
        setIsDeleteModalVisible(true);
    };

    // Save course (create or update)
    const handleSaveCourse = async () => {
        if (!currentCourse || !currentCourse.title) return;

        setLoading(true);
        setError(null);

        try {
            if (currentCourse.id) {
                // Update existing course
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
                    variables: { input: courseInput },
                    authMode: 'userPool'
                }) as GraphQLResponse<UpdateCourseResponse>;

                // Update state with updated course
                if (result.data?.updateTncCourseCatalog) {
                    setCourses(prevCourses =>
                        prevCourses.map(c => c.id === currentCourse.id ? result.data!.updateTncCourseCatalog : c)
                    );
                }
            } else {
                // Create new course
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
                    variables: { input: courseInput },
                    authMode: 'userPool'
                }) as GraphQLResponse<CreateCourseResponse>;

                // Add new course to state
                if (result.data?.createTncCourseCatalog) {
                    setCourses(prevCourses => [...prevCourses, result.data!.createTncCourseCatalog]);
                }
            }

            // Close modal
            setIsModalVisible(false);
            setCurrentCourse(null);
        } catch (err) {
            console.error(t('admin.courses.error_saving'), err);
            setError(t('admin.courses.error_saving'));
        } finally {
            setLoading(false);
        }
    };

    // Delete course
    const handleDeleteCourse = async () => {
        if (!currentCourse?.id) return;

        setLoading(true);
        setError(null);

        try {
            const result = await client.graphql({
                query: deleteCourse,
                variables: {
                    input: { id: currentCourse.id }
                },
                authMode: 'userPool'
            }) as GraphQLResponse<DeleteCourseResponse>;

            if (result.data?.deleteTncCourseCatalog) {
                // Remove deleted course
                setCourses(prevCourses =>
                    prevCourses.filter(c => c.id !== currentCourse.id)
                );
            }

            // Close modal
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
                {/* Header and search tools */}
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

                {/* Course table */}
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
                            cell: item => item.duration ? `\${item.duration} \${t('admin.courses.hours')}` : "-",
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

            {/* Add/edit course modal */}
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
                        <FormField label={t('admin.courses.form.title')} errorText={!currentCourse.title ? t('admin.courses.form.title_required') : undefined}>
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
                                    { label: tString('conversation.difficulty.advanced'), value: 'ADVANCED' }
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

                        <FormField label={t('admin.courses.form.published_date')}>
                            <DatePicker
                                value={currentCourse.publishedDate || ''}
                                onChange={({ detail }) =>
                                    setCurrentCourse(prev => prev ? ({ ...prev, publishedDate: detail.value }) : null)
                                }
                                placeholder="YYYY-MM-DD"
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

            {/* Delete confirmation modal */}
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
                    {t('admin.courses.delete_confirm', { title: currentCourse?.title })}
                </Box>
            </Modal>
        </Box>
    );
};

export default CourseCatalogTab;