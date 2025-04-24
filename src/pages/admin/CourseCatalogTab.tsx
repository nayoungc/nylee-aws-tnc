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
    Alert,
    Multiselect
} from '@cloudscape-design/components';
import { useTypedTranslation } from '@utils/i18n-utils';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import { getCurrentUser } from 'aws-amplify/auth';
import {
    CourseCatalog
} from '@api/types';

import {
    listCourseCatalogs,
    getCourseCatalog,
    createCourseCatalog,
    queryCatalogByTitle
} from '@api/catalog'; // Update the import path as needed

// Define a view model to handle UI-specific fields and transformations
interface CourseViewModel {
    catalogId: string;
    title: string;
    version: string;
    awsCode?: string;
    description?: string;
    isPublished: boolean;
    publishedDate?: string;
    level?: string;
    duration?: number;
    price?: number;
    currency?: string;
    status?: string;
    category?: string;
    deliveryMethod?: string;
    objectives?: string[];
    targetAudience?: string[];
}

// Mapping functions between backend and view models
const mapToViewModel = (course: CourseCatalog): CourseViewModel => {
    return {
        ...course
    };
};

const mapToBackendModel = (viewModel: CourseViewModel): CourseCatalog => {
    return {
        ...viewModel,
        isPublished: viewModel.isPublished !== undefined ? viewModel.isPublished : false
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
    const [lastEvaluatedKey, setLastEvaluatedKey] = useState<any>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    // 목표와 대상 청중을 위한 선택 옵션
    const [objectiveOptions, setObjectiveOptions] = useState<{ label: string, value: string }[]>([]);
    const [audienceOptions, setAudienceOptions] = useState<{ label: string, value: string }[]>([]);

    // DynamoDB에서 과정 목록 가져오기
    const fetchCourses = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await listCourseCatalogs({
                limit: 100,
                ExclusiveStartKey: lastEvaluatedKey
            });

            if (response.data) {
                // Add explicit type assertion
                const typedData = response.data as unknown as CourseCatalog[];
                const viewModels = typedData.map(course => mapToViewModel(course));
                setCourses(viewModels);

                // 모든 과정에서 고유 목표 및 대상 청중 수집
                const allObjectives = new Set<string>();
                const allAudiences = new Set<string>();

                typedData.forEach(course => {
                    course.objectives?.forEach(obj => allObjectives.add(obj));
                    course.targetAudience?.forEach(audience => allAudiences.add(audience));
                });

                setObjectiveOptions(Array.from(allObjectives).map(obj => ({ label: obj, value: obj })));
                setAudienceOptions(Array.from(allAudiences).map(audience => ({ label: audience, value: audience })));
            }
        } catch (err) {
            console.error('Error loading course data', err);
            setError(t('admin.courses.error_loading'));

            // 개발 환경에서는 샘플 데이터 제공
            if (process.env.NODE_ENV === 'development') {
                setCourses([
                    {
                        catalogId: '1',
                        title: 'AWS Cloud Practitioner',
                        version: '1.0',
                        awsCode: 'AWS-CP',
                        description: 'Fundamental AWS concepts',
                        duration: 20,
                        level: 'BEGINNER',
                        deliveryMethod: 'Online',
                        objectives: ['Learn AWS basics', 'Understand cloud concepts'],
                        targetAudience: ['Beginners', 'IT Professionals'],
                        status: 'ACTIVE',
                        isPublished: true,
                        category: 'Cloud',
                        price: 299,
                        currency: 'USD'
                    },
                    {
                        catalogId: '2',
                        title: 'AWS Solutions Architect',
                        version: '2.0',
                        awsCode: 'AWS-SAA',
                        description: 'Advanced architecture patterns',
                        duration: 40,
                        level: 'ADVANCED',
                        deliveryMethod: 'Blended',
                        objectives: ['Design resilient architectures', 'Design high-performance architectures'],
                        targetAudience: ['Architects', 'Cloud Engineers'],
                        status: 'ACTIVE',
                        isPublished: true,
                        category: 'Architecture',
                        price: 499,
                        currency: 'USD'
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

    // 인증 상태 확인 후 데이터 가져오는 함수
    // 인증 상태 확인 후 데이터 가져오는 함수
const checkAuthAndFetchCourses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 사용자 인증 상태 확인
      await getCurrentUser();
      setIsAuthenticated(true);
      
      try {
        // 인증 확인 후 데이터 가져오기
        await fetchCourses();
      } catch (apiError) {
        console.error('API 오류:', apiError);
        setError(t('admin.courses.error_loading') || 'API 오류 발생');
      }
    } catch (authError) {
      console.error('Authentication check failed:', authError);
      setIsAuthenticated(false);
      setError(t('admin.courses.auth_required') || '로그인이 필요합니다');
      
      // 개발 환경에서 샘플 데이터 (이미 구현됨)
    } finally {
      setLoading(false);
    }
  };
  
  // 컴포넌트 마운트 시 한 번만 호출
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      await checkAuthAndFetchCourses();
    };
    
    if (isMounted) {
      fetchData();
    }
    
    return () => {
      isMounted = false;
    };
  }, []);

    // 검색 텍스트 기반 필터링
    const filteredItems = courses.filter(course =>
        !filterText ||
        course.title.toLowerCase().includes(filterText.toLowerCase()) ||
        course.description?.toLowerCase().includes(filterText.toLowerCase()) ||
        course.awsCode?.toLowerCase().includes(filterText.toLowerCase())
    );

    // 페이지네이션 설정
    const PAGE_SIZE = 10;
    const paginatedItems = filteredItems.slice(
        (currentPageIndex - 1) * PAGE_SIZE,
        currentPageIndex * PAGE_SIZE
    );

    // 새 과정 생성
    const handleCreateCourse = async () => {
        // 인증 상태 확인
        try {
            await getCurrentUser();
        } catch (err) {
            setError(t('admin.courses.auth_required') || '이 기능을 사용하려면 로그인이 필요합니다');
            return;
        }

        const newCourse: CourseViewModel = {
            catalogId: uuidv4(), // Generate a unique ID
            title: '',
            version: '1.0', // Default version
            awsCode: '',
            description: '',
            isPublished: false,
            level: 'BEGINNER',
            duration: 0,
            deliveryMethod: '',
            objectives: [],
            targetAudience: [],
            status: 'DRAFT',
            category: '',
            price: 0,
            currency: 'USD'
        };
        setCurrentCourse(newCourse);
        setIsModalVisible(true);
    };

    // 기존 과정 수정
    const handleEditCourse = async (course: CourseViewModel) => {
        // 인증 상태 확인
        try {
            await getCurrentUser();
        } catch (err) {
            setError(t('admin.courses.auth_required') || '이 기능을 사용하려면 로그인이 필요합니다');
            return;
        }

        setLoading(true);
        try {
            // 최신 과정 데이터 가져오기
            if (course.catalogId && course.title) {
                const response = await getCourseCatalog(course.catalogId, course.title);

                if (response.data) {
                    // 백엔드 데이터를 뷰모델로 변환
                    const typedData = response.data as unknown as CourseCatalog;
                    const viewModel = mapToViewModel(typedData);
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
    const handleDeleteCourseClick = async (course: CourseViewModel) => {
        // 인증 상태 확인
        try {
            await getCurrentUser();
        } catch (err) {
            setError(t('admin.courses.auth_required') || '이 기능을 사용하려면 로그인이 필요합니다');
            return;
        }

        setCurrentCourse(course);
        setIsDeleteModalVisible(true);
    };

    // 과정 저장 (생성 또는 수정)
    const handleSaveCourse = async () => {
        if (!currentCourse || !currentCourse.title) return;

        // 인증 상태 확인
        try {
            await getCurrentUser();
        } catch (err) {
            setError(t('admin.courses.auth_required') || '이 기능을 사용하려면 로그인이 필요합니다');
            return;
        }

        const course = currentCourse; // Create a local reference to avoid null checks
        setLoading(true);
        setError(null);

        try {
            // 타이틀이 중복되는지 확인
            if (!course.catalogId) {
                const existingCourses = await queryCatalogByTitle(course.title);
                if (existingCourses.data && existingCourses.data.length > 0) {
                    setError(t('admin.courses.title_already_exists'));
                    setLoading(false);
                    return;
                }
            }

            // 뷰모델을 백엔드 모델로 변환
            const backendModel = mapToBackendModel(course);

            // 과정 생성 또는 업데이트 (DynamoDB는 put으로 둘 다 처리 가능)
            const response = await createCourseCatalog(backendModel);

            if (response.data) {
                // 응답 데이터를 뷰모델로 변환
                const typedData = response.data as unknown as CourseCatalog;
                const updatedViewModel = mapToViewModel(typedData);

                setCourses(prevCourses => {
                    const index = prevCourses.findIndex(c => c.catalogId === updatedViewModel.catalogId);
                    if (index >= 0) {
                        // 기존 과정 업데이트
                        return [
                            ...prevCourses.slice(0, index),
                            updatedViewModel,
                            ...prevCourses.slice(index + 1)
                        ];
                    } else {
                        // 새 과정 추가
                        return [...prevCourses, updatedViewModel];
                    }
                });
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
        if (!currentCourse?.catalogId || !currentCourse?.title) return;
        
        // 인증 상태 확인
        try {
            await getCurrentUser();
        } catch (err) {
            setError(t('admin.courses.auth_required') || '이 기능을 사용하려면 로그인이 필요합니다');
            return;
        }
        
        const course = currentCourse; // Create a local reference to avoid null checks
        setLoading(true);
        setError(null);

        try {
            // DynamoDB에서는 삭제를 위해 primary key가 필요함
            // 현재 DynamoDB 삭제 함수가 코드에 포함되어 있지 않아 직접 구현 필요
            // 임시로 상태에서만 삭제
            setCourses(prevCourses =>
                prevCourses.filter(c => c.catalogId !== course.catalogId)
            );

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

    // 인증되지 않은 상태에서 로그인 안내 표시
    if (!isAuthenticated && !loading && error) {
        return (
            <Box padding="m">
                <Alert type="warning" header={t('admin.common.auth_required') || '인증 필요'}>
                    <p>{t('admin.common.please_login') || '이 기능을 사용하려면 로그인이 필요합니다.'}</p>
                    <Button variant="primary" onClick={checkAuthAndFetchCourses}>
                        {t('admin.common.retry') || '다시 시도'}
                    </Button>
                </Alert>
            </Box>
        );
    }

    return (
        <Box padding="m">
            {error && <Alert type="error">{error}</Alert>}

            <Header
                actions={
                    <Button variant="primary" onClick={handleCreateCourse}>
                        {t('admin.courses.add_new')}
                    </Button>
                }
            >
                {t('admin.courses.title')}
            </Header>

            <TextFilter
                filteringText={filterText}
                filteringPlaceholder={tString('admin.courses.search_placeholder')}
                filteringAriaLabel={tString('admin.courses.search_aria_label')}
                onChange={({ detail }) => setFilterText(detail.filteringText)}
            />

            <Table
                items={paginatedItems}
                loading={loading}
                columnDefinitions={[
                    {
                        id: 'awsCode',
                        header: t('admin.courses.code'),
                        cell: item => item.awsCode || '-',
                        sortingField: 'awsCode',
                    },
                    {
                        id: 'title',
                        header: t('admin.courses.title'),
                        cell: item => item.title || '-',
                        sortingField: 'title',
                    },
                    {
                        id: 'version',
                        header: t('admin.courses.version'),
                        cell: item => item.version || '-',
                        sortingField: 'version',
                    },
                    {
                        id: 'level',
                        header: t('admin.courses.level'),
                        cell: item => getLevelLabel(item.level || ''),
                        sortingField: 'level',
                    },
                    {
                        id: 'duration',
                        header: t('admin.courses.duration'),
                        cell: item => item.duration ? `\${item.duration} \${t('admin.courses.hours')}` : '-',
                        sortingField: 'duration',
                    },
                    {
                        id: 'status',
                        header: t('admin.courses.status'),
                        cell: item => item.isPublished ? t('admin.courses.published') : t('admin.courses.draft'),
                        sortingField: 'status',
                    },
                    {
                        id: 'actions',
                        header: t('admin.common.actions'),
                        cell: item => (
                            <SpaceBetween direction="horizontal" size="xs">
                                <Button onClick={() => handleEditCourse(item)}>
                                    {t('admin.common.edit')}
                                </Button>
                                <Button variant="primary" formAction="none" iconName="remove" onClick={() => handleDeleteCourseClick(item)}>
                                    {t('admin.common.delete')}
                                </Button>
                            </SpaceBetween>
                        ),
                    },
                ]}
                empty={
                    <Box textAlign="center" color="inherit">
                        <b>{t('admin.courses.no_resources')}</b>
                        <Box padding={{ bottom: 's' }} variant="p" color="inherit">
                            {t('admin.courses.no_resources_to_display')}
                        </Box>
                    </Box>
                }
            />

            <Pagination
                currentPageIndex={currentPageIndex}
                pagesCount={Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE))}
                onChange={({ detail }) => setCurrentPageIndex(detail.currentPageIndex)}
            />

            {/* 과정 생성/수정 모달 */}
            <Modal
                visible={isModalVisible}
                onDismiss={() => setIsModalVisible(false)}
                header={currentCourse?.catalogId ? t('admin.courses.edit') : t('admin.courses.create')}
                size="large"
                footer={
                    <Box float="right">
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button variant="link" onClick={() => setIsModalVisible(false)}>
                                {t('admin.common.cancel')}
                            </Button>
                            <Button variant="primary" onClick={handleSaveCourse} disabled={!currentCourse?.title}>
                                {t('admin.common.save')}
                            </Button>
                        </SpaceBetween>
                    </Box>
                }
            >
                <SpaceBetween size="l">
                    <FormField label={t('admin.courses.aws_code')}>
                        <Input
                            value={currentCourse?.awsCode || ''}
                            onChange={({ detail }) =>
                                setCurrentCourse(curr => curr ? { ...curr, awsCode: detail.value } : null)
                            }
                        />
                    </FormField>

                    <FormField
                        label={
                            <span>
                                {t('admin.courses.title')} <span style={{ color: '#d91515', marginLeft: '2px' }}>*</span>
                            </span>
                        }
                    >
                        <Input
                            value={currentCourse?.title || ''}
                            onChange={({ detail }) =>
                                setCurrentCourse(curr => curr ? { ...curr, title: detail.value } : null)
                            }
                        />
                    </FormField>

                    <FormField label={t('admin.courses.version')}>
                        <Input
                            value={currentCourse?.version || ''}
                            onChange={({ detail }) =>
                                setCurrentCourse(curr => curr ? { ...curr, version: detail.value } : null)
                            }
                        />
                    </FormField>

                    <FormField label={t('admin.courses.description')}>
                        <Textarea
                            value={currentCourse?.description || ''}
                            onChange={({ detail }) =>
                                setCurrentCourse(curr => curr ? { ...curr, description: detail.value } : null)
                            }
                            rows={4}
                        />
                    </FormField>

                    <SpaceBetween direction="horizontal" size="xl">
                        <FormField label={t('admin.courses.level')}>
                            <Select
                                selectedOption={{
                                    value: currentCourse?.level || 'BEGINNER',
                                    label: getLevelLabel(currentCourse?.level || 'BEGINNER')
                                }}
                                onChange={({ detail }) =>
                                    setCurrentCourse(curr => curr ?
                                        { ...curr, level: detail.selectedOption.value || 'BEGINNER' } : null)
                                }
                                options={[
                                    { value: 'BEGINNER', label: getLevelLabel('BEGINNER') },
                                    { value: 'INTERMEDIATE', label: getLevelLabel('INTERMEDIATE') },
                                    { value: 'ADVANCED', label: getLevelLabel('ADVANCED') }
                                ]}
                            />
                        </FormField>

                        <FormField label={t('admin.courses.duration')}>
                            <Input
                                type="number"
                                value={currentCourse?.duration?.toString() || ''}
                                onChange={({ detail }) =>
                                    setCurrentCourse(curr => curr ?
                                        { ...curr, duration: detail.value ? Number(detail.value) : undefined } : null)
                                }
                            />
                        </FormField>

                        <FormField label={t('admin.courses.delivery_method')}>
                            <Select
                                selectedOption={{
                                    value: currentCourse?.deliveryMethod || '',
                                    label: currentCourse?.deliveryMethod || tString('admin.courses.select_delivery')
                                }}
                                onChange={({ detail }) =>
                                    setCurrentCourse(curr => curr ?
                                        { ...curr, deliveryMethod: detail.selectedOption.value || '' } : null)
                                }
                                options={[
                                    { value: 'Online', label: 'Online' },
                                    { value: 'Classroom', label: 'Classroom' },
                                    { value: 'Blended', label: 'Blended' },
                                    { value: 'Virtual', label: 'Virtual Classroom' }
                                ]}
                            />
                        </FormField>

                        <FormField label={t('admin.courses.published')}>
                            <Select
                                selectedOption={{
                                    value: currentCourse?.isPublished ? 'true' : 'false',
                                    label: currentCourse?.isPublished ?
                                        tString('admin.courses.published') : tString('admin.courses.draft')
                                }}
                                onChange={({ detail }) =>
                                    setCurrentCourse(curr => curr ?
                                        { ...curr, isPublished: detail.selectedOption.value === 'true' } : null)
                                }
                                options={[
                                    { value: 'true', label: tString('admin.courses.published') },
                                    { value: 'false', label: tString('admin.courses.draft') }
                                ]}
                            />
                        </FormField>
                    </SpaceBetween>

                    <FormField label={t('admin.courses.objectives')}>
                        <Multiselect
                            selectedOptions={(currentCourse?.objectives || []).map(obj => ({ label: obj, value: obj }))}
                            onChange={({ detail }) =>
                                setCurrentCourse(curr => {
                                    if (!curr) return null;
                                    const objectives = detail.selectedOptions
                                        .map(opt => opt.value)
                                        .filter((value): value is string => value !== undefined);
                                    return { ...curr, objectives };
                                })
                            }
                            options={objectiveOptions}
                            placeholder={tString('admin.courses.add_objectives')}
                        />
                    </FormField>

                    <FormField label={t('admin.courses.target_audience')}>
                        <Multiselect
                            selectedOptions={(currentCourse?.targetAudience || []).map(aud => ({ label: aud, value: aud }))}
                            onChange={({ detail }) =>
                                setCurrentCourse(curr => {
                                    if (!curr) return null;
                                    const targetAudience = detail.selectedOptions
                                        .map(opt => opt.value)
                                        .filter((value): value is string => value !== undefined);
                                    return { ...curr, targetAudience };
                                })
                            }
                            options={audienceOptions}
                            placeholder={tString('admin.courses.add_audience')}
                        />
                    </FormField>

                    <SpaceBetween direction="horizontal" size="xl">
                        <FormField label={t('admin.courses.price')}>
                            <Input
                                type="number"
                                value={currentCourse?.price?.toString() || ''}
                                onChange={({ detail }) =>
                                    setCurrentCourse(curr => curr ?
                                        { ...curr, price: detail.value ? Number(detail.value) : undefined } : null)
                                }
                            />
                        </FormField>

                        <FormField label={t('admin.courses.currency')}>
                            <Select
                                selectedOption={{
                                    value: currentCourse?.currency || 'USD',
                                    label: currentCourse?.currency || 'USD'
                                }}
                                onChange={({ detail }) =>
                                    setCurrentCourse(curr => curr ?
                                        { ...curr, currency: detail.selectedOption.value || 'USD' } : null)
                                }
                                options={[
                                    { value: 'USD', label: 'USD' },
                                    { value: 'EUR', label: 'EUR' },
                                    { value: 'GBP', label: 'GBP' },
                                    { value: 'JPY', label: 'JPY' },
                                    { value: 'KRW', label: 'KRW' }
                                ]}
                            />
                        </FormField>

                        <FormField label={t('admin.courses.category')}>
                            <Input
                                value={currentCourse?.category || ''}
                                onChange={({ detail }) =>
                                    setCurrentCourse(curr => curr ? { ...curr, category: detail.value } : null)
                                }
                            />
                        </FormField>
                    </SpaceBetween>
                </SpaceBetween>
            </Modal>

            {/* 과정 삭제 모달 */}
            <Modal
                visible={isDeleteModalVisible}
                onDismiss={() => setIsDeleteModalVisible(false)}
                header={t('admin.courses.delete')}
                footer={
                    <Box float="right">
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button variant="link" onClick={() => setIsDeleteModalVisible(false)}>
                                {t('admin.common.cancel')}
                            </Button>
                            <Button
                                variant="primary"
                                formAction="none"
                                iconName='remove'
                                onClick={handleDeleteCourse}
                            >
                                {t('admin.common.delete')}
                            </Button>
                        </SpaceBetween>
                    </Box>
                }
            >
                <p>
                    {t('admin.courses.delete_confirmation', {
                        name: currentCourse?.title
                    })}
                </p>
            </Modal>
        </Box>
    );
};

export default CourseCatalogTab;