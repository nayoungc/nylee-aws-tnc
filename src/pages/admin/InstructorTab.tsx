// src/pages/admin/InstructorTab.tsx
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
    DatePicker,
    Alert,
    Textarea
} from '@cloudscape-design/components';
import { generateClient } from 'aws-amplify/api';
import { listInstructors } from '../../graphql/queries';
import { createInstructor, updateInstructor, deleteInstructor } from '../../graphql/mutations';
import { Instructor } from '../../models/Instructor';
import { useTypedTranslation } from '../../utils/i18n-utils';

// API 클라이언트 생성
const client = generateClient();


// 사용자 정의 GraphQL 응답 타입
interface GraphQLResponse<T> {
    data?: T;
    errors?: any[];
}

// 특정 응답 타입 정의
interface ListInstructorsResponse {
    listInstructors: {
        items: Instructor[];
        nextToken?: string;
    };
}

interface CreateInstructorResponse {
    createInstructor: Instructor;
}

interface UpdateInstructorResponse {
    updateInstructor: Instructor;
}

interface DeleteInstructorResponse {
    deleteInstructor: {
        id: string;
    };
}

const InstructorTab: React.FC = () => {
    const { tString, t } = useTypedTranslation();
    
    // 상태 관리
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentInstructor, setCurrentInstructor] = useState<Instructor | null>(null);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false);
    const [filterText, setFilterText] = useState<string>('');
    const [currentPageIndex, setCurrentPageIndex] = useState<number>(1);
    const [error, setError] = useState<string | null>(null);
    const [cognitoUsers, setCognitoUsers] = useState<any[]>([]);
    const [loadingCognitoUsers, setLoadingCognitoUsers] = useState<boolean>(false);

    // 강사 목록 불러오기
    const fetchInstructors = async () => {
        setLoading(true);
        setError(null);

        try {
            // 사용자 정의 타입으로 GraphQL 응답 처리
            const result = await client.graphql({
                query: listInstructors,
                variables: { limit: 20 }
            }) as GraphQLResponse<ListInstructorsResponse>;

            console.log(t('admin.instructors.log.load_result'), result);

            // 응답에서 items 추출
            const items = result.data?.listInstructors?.items;
            if (items) {
                setInstructors(items);
            }
        } catch (err: any) {
            console.error(t('admin.instructors.error_loading'), err);
            setError(t('admin.instructors.error_loading'));
        } finally {
            setLoading(false);
        }
    };

    // Cognito 사용자 풀에서 사용자 가져오기
    const fetchCognitoUsers = async () => {
        setLoadingCognitoUsers(true);

        try {
            // 임시 더미 데이터
            const dummyUsers = [
                {
                    Username: 'user1',
                    Attributes: [
                        { Name: 'email', Value: 'instructor1@example.com' },
                        { Name: 'name', Value: t('admin.instructors.dummy_data.instructor1') }
                    ]
                },
                {
                    Username: 'user2',
                    Attributes: [
                        { Name: 'email', Value: 'instructor2@example.com' },
                        { Name: 'name', Value: t('admin.instructors.dummy_data.instructor2') }
                    ]
                },
                {
                    Username: 'user3',
                    Attributes: [
                        { Name: 'email', Value: 'instructor3@example.com' },
                        { Name: 'name', Value: t('admin.instructors.dummy_data.instructor3') }
                    ]
                }
            ];

            setCognitoUsers(dummyUsers);
        } catch (err) {
            console.error(t('admin.instructors.error_loading_cognito'), err);
            setError(t('admin.instructors.error_loading_cognito'));
        } finally {
            setLoadingCognitoUsers(false);
        }
    };

    // 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        fetchInstructors();
        fetchCognitoUsers();
    }, []);

    // 필터링된 아이템
    const filteredItems = instructors.filter(instructor =>
        !filterText ||
        instructor.name?.toLowerCase().includes(filterText.toLowerCase()) ||
        instructor.email?.toLowerCase().includes(filterText.toLowerCase()) ||
        instructor.specialization?.toLowerCase().includes(filterText.toLowerCase())
    );

    // 페이지당 아이템 수
    const PAGE_SIZE = 10;
    const paginatedItems = filteredItems.slice(
        (currentPageIndex - 1) * PAGE_SIZE,
        currentPageIndex * PAGE_SIZE
    );

    // 새 강사 만들기
    const handleCreateInstructor = () => {
        setCurrentInstructor({
            name: '',
            email: '',
            phone: '',
            specialization: '',
            bio: '',
            status: 'ACTIVE',
            joinDate: new Date().toISOString().split('T')[0]
        });
        setIsModalVisible(true);
    };

    // 강사 수정
    const handleEditInstructor = (instructor: Instructor) => {
        setCurrentInstructor({ ...instructor });
        setIsModalVisible(true);
    };

    // 강사 삭제 모달 표시
    const handleDeleteInstructorClick = (instructor: Instructor) => {
        setCurrentInstructor(instructor);
        setIsDeleteModalVisible(true);
    };

    // Cognito 사용자에서 속성 가져오기
    const getAttributeValue = (user: any, attributeName: string): string => {
        const attribute = user.Attributes.find((attr: any) => attr.Name === attributeName);
        return attribute ? attribute.Value : '';
    };

    // 강사 저장 (생성/수정)
    const handleSaveInstructor = async () => {
        if (!currentInstructor || !currentInstructor.name || !currentInstructor.email) return;

        setLoading(true);
        setError(null);

        try {
            if (currentInstructor.id) {
                // 기존 강사 수정 - 사용자 정의 타입 사용
                const updateInput = {
                    id: currentInstructor.id,
                    name: currentInstructor.name,
                    email: currentInstructor.email,
                    phone: currentInstructor.phone || '',
                    specialization: currentInstructor.specialization || '',
                    bio: currentInstructor.bio || '',
                    status: currentInstructor.status || 'ACTIVE',
                    joinDate: currentInstructor.joinDate || '',
                    cognitoId: currentInstructor.cognitoId || ''
                };
                
                const result = await client.graphql({
                    query: updateInstructor,
                    variables: { input: updateInput }
                }) as GraphQLResponse<UpdateInstructorResponse>;

                console.log(t('admin.instructors.log.update_result'), result);

                // 수정된 강사로 상태 업데이트
                const updatedInstructor = result.data?.updateInstructor;
                if (updatedInstructor) {
                    setInstructors(prevInstructors =>
                        prevInstructors.map(i => i.id === currentInstructor.id ? updatedInstructor : i)
                    );
                }
            } else {
                // 새 강사 생성 - 사용자 정의 타입 사용
                const createInput = {
                    name: currentInstructor.name,
                    email: currentInstructor.email,
                    phone: currentInstructor.phone || '',
                    specialization: currentInstructor.specialization || '',
                    bio: currentInstructor.bio || '',
                    status: currentInstructor.status || 'ACTIVE',
                    joinDate: currentInstructor.joinDate || '',
                    cognitoId: currentInstructor.cognitoId || ''
                };
                
                const result = await client.graphql({
                    query: createInstructor,
                    variables: { input: createInput }
                }) as GraphQLResponse<CreateInstructorResponse>;

                console.log(t('admin.instructors.log.create_result'), result);
                
                // 생성된 강사 추가
                const newInstructor = result.data?.createInstructor;
                if (newInstructor) {
                    setInstructors(prevInstructors => [...prevInstructors, newInstructor]);
                }
            }

            // 모달 닫기
            setIsModalVisible(false);
            setCurrentInstructor(null);
        } catch (err) {
            console.error(t('admin.instructors.error_saving'), err);
            setError(t('admin.instructors.error_saving'));
        } finally {
            setLoading(false);
        }
    };

    // 강사 삭제
    const handleDeleteInstructor = async () => {
        if (!currentInstructor?.id) return;

        setLoading(true);
        setError(null);

        try {
            // 사용자 정의 타입으로 삭제 응답 처리
            const result = await client.graphql({
                query: deleteInstructor,
                variables: { input: { id: currentInstructor.id } }
            }) as GraphQLResponse<DeleteInstructorResponse>;

            console.log(t('admin.instructors.log.delete_result'), result);

            // 삭제 확인 후 UI 업데이트
            const deletedId = result.data?.deleteInstructor?.id;
            if (deletedId) {
                setInstructors(prevInstructors =>
                    prevInstructors.filter(i => i.id !== deletedId)
                );
            }

            // 모달 닫기
            setIsDeleteModalVisible(false);
            setCurrentInstructor(null);
        } catch (err) {
            console.error(t('admin.instructors.error_deleting'), err);
            setError(t('admin.instructors.error_deleting'));
        } finally {
            setLoading(false);
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
                                    onClick={handleCreateInstructor}
                                    iconName="add-plus"
                                >
                                    {t('admin.instructors.add_instructor')}
                                </Button>
                            }
                        >
                            {t('admin.instructors.instructor_management')}
                        </Header>

                        <TextFilter
                            filteringText={filterText}
                            filteringPlaceholder={tString('admin.instructors.search_placeholder')}
                            filteringAriaLabel={tString('admin.instructors.search_aria_label')}
                            onChange={({ detail }) => setFilterText(detail.filteringText)}
                        />
                    </SpaceBetween>
                </Box>

                {/* 강사 테이블 */}
                <Table
                    loading={loading}
                    items={paginatedItems}
                    columnDefinitions={[
                        {
                            id: "name",
                            header: t('admin.instructors.column.name'),
                            cell: item => item.name,
                            sortingField: "name"
                        },
                        {
                            id: "email",
                            header: t('admin.instructors.column.email'),
                            cell: item => item.email || "-"
                        },
                        {
                            id: "phone",
                            header: t('admin.instructors.column.phone'),
                            cell: item => item.phone || "-"
                        },
                        {
                            id: "specialization",
                            header: t('admin.instructors.column.specialization'),
                            cell: item => item.specialization || "-"
                        },
                        {
                            id: "status",
                            header: t('admin.instructors.column.status'),
                            cell: item => item.status === 'ACTIVE' ? t('admin.common.active') : t('admin.common.inactive')
                        },
                        {
                            id: "joinDate",
                            header: t('admin.instructors.column.join_date'),
                            cell: item => item.joinDate || "-"
                        },
                        {
                            id: "actions",
                            header: t('admin.common.actions'),
                            cell: item => (
                                <SpaceBetween direction="horizontal" size="xs">
                                    <Button
                                        variant="normal"
                                        onClick={() => handleEditInstructor(item)}
                                    >
                                        {t('admin.common.edit')}
                                    </Button>
                                    <Button
                                        variant="link"
                                        onClick={() => handleDeleteInstructorClick(item)}
                                    >
                                        {t('admin.common.delete')}
                                    </Button>
                                </SpaceBetween>
                            )
                        }
                    ]}
                    empty={
                        <Box textAlign="center" color="inherit">
                            <b>{t('admin.instructors.no_instructors')}</b>
                            <Box padding={{ bottom: "s" }} variant="p" color="inherit">
                                {t('admin.instructors.add_new_instructor_desc')}
                            </Box>
                            <Button onClick={handleCreateInstructor}>
                                {t('admin.instructors.add_instructor')}
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

            {/* 강사 추가/수정 모달 */}
            <Modal
                visible={isModalVisible}
                onDismiss={() => setIsModalVisible(false)}
                header={currentInstructor?.id ? t('admin.instructors.edit_instructor') : t('admin.instructors.add_new_instructor')}
                footer={
                    <Box float="right">
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button variant="link" onClick={() => setIsModalVisible(false)}>
                                {t('admin.common.cancel')}
                            </Button>
                            <Button variant="primary" onClick={handleSaveInstructor}>
                                {t('admin.common.save')}
                            </Button>
                        </SpaceBetween>
                    </Box>
                }
            >
                {currentInstructor && (
                    <SpaceBetween size="l">
                        {!currentInstructor.id && (
                            <FormField label={t('admin.instructors.form.cognito_user')}>
                                <Select
                                    selectedOption={
                                        currentInstructor.cognitoId ?
                                            {
                                                value: currentInstructor.cognitoId,
                                                label: cognitoUsers.find(u => u.Username === currentInstructor.cognitoId)?.Attributes.find((a: any) => a.Name === 'email')?.Value || currentInstructor.cognitoId
                                            } : null
                                    }
                                    onChange={({ detail }) => {
                                        if (detail.selectedOption) {
                                            const selectedUser = cognitoUsers.find(u => u.Username === detail.selectedOption.value);
                                            if (selectedUser) {
                                                setCurrentInstructor({
                                                    ...currentInstructor,
                                                    cognitoId: selectedUser.Username,
                                                    name: getAttributeValue(selectedUser, 'name') || currentInstructor.name,
                                                    email: getAttributeValue(selectedUser, 'email') || ''
                                                });
                                            }
                                        }
                                    }}
                                    options={cognitoUsers.map(user => ({
                                        value: user.Username,
                                        label: `\${getAttributeValue(user, 'name')} (\${getAttributeValue(user, 'email')})`
                                    }))}
                                    placeholder={tString('admin.instructors.form.select_user')}
                                    loadingText={tString('admin.instructors.form.loading_users')}
                                    statusType={loadingCognitoUsers ? "loading" : "finished"}
                                    empty={t('admin.instructors.form.no_users')}
                                />
                            </FormField>
                        )}

                        <FormField label={t('admin.instructors.form.name')}>
                            <Input
                                value={currentInstructor.name}
                                onChange={({ detail }) =>
                                    setCurrentInstructor(prev => prev ? ({ ...prev, name: detail.value }) : null)
                                }
                            />
                        </FormField>

                        <FormField label={t('admin.instructors.form.email')}>
                            <Input
                                type="email"
                                value={currentInstructor.email}
                                onChange={({ detail }) =>
                                    setCurrentInstructor(prev => prev ? ({ ...prev, email: detail.value }) : null)
                                }
                            />
                        </FormField>

                        <FormField label={t('admin.instructors.form.phone')}>
                            <Input
                                type="text"
                                inputMode="tel"
                                value={currentInstructor.phone || ''}
                                onChange={({ detail }) =>
                                    setCurrentInstructor(prev => prev ? ({ ...prev, phone: detail.value }) : null)
                                }
                                placeholder={tString('admin.instructors.form.phone_placeholder')}
                            />
                        </FormField>

                        <FormField label={t('admin.instructors.form.specialization')}>
                            <Input
                                value={currentInstructor.specialization || ''}
                                onChange={({ detail }) =>
                                    setCurrentInstructor(prev => prev ? ({ ...prev, specialization: detail.value }) : null)
                                }
                            />
                        </FormField>

                        <FormField label={t('admin.instructors.form.bio')}>
                            <Textarea
                                value={currentInstructor.bio || ''}
                                onChange={({ detail }) =>
                                    setCurrentInstructor(prev => prev ? ({ ...prev, bio: detail.value }) : null)
                                }
                                rows={3}
                            />
                        </FormField>

                        <FormField label={t('admin.instructors.form.status')}>
                        <Select
                            selectedOption={
                                {
                                    label: currentInstructor.status === 'ACTIVE' ? tString('admin.common.active') : tString('admin.common.inactive'),
                                    value: currentInstructor.status || 'ACTIVE'
                                }
                            }
                            onChange={({ detail }) =>
                                setCurrentInstructor(prev => prev ? ({ ...prev, status: detail.selectedOption.value }) : null)
                            }
                            options={[
                                { label: tString('admin.common.active'), value: 'ACTIVE' },
                                { label: tString('admin.common.inactive'), value: 'INACTIVE' }
                            ]}
                        />
                        </FormField>

                        <FormField label={t('admin.instructors.form.join_date')}>
                            <DatePicker
                                value={currentInstructor.joinDate || ''} 
                                onChange={({ detail }) =>
                                    setCurrentInstructor(prev => prev ? ({ ...prev, joinDate: detail.value }) : null)
                                }
                            />
                        </FormField>
                    </SpaceBetween>
                )}
            </Modal>

            {/* 삭제 확인 모달 */}
            <Modal
                visible={isDeleteModalVisible}
                onDismiss={() => setIsDeleteModalVisible(false)}
                header={t('admin.instructors.delete_instructor')}
                footer={
                    <Box float="right">
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button variant="link" onClick={() => setIsDeleteModalVisible(false)}>
                                {t('admin.common.cancel')}
                            </Button>
                            <Button variant="primary" onClick={handleDeleteInstructor}>
                                {t('admin.common.delete')}
                            </Button>
                        </SpaceBetween>
                    </Box>
                }
            >
                <Box variant="p">
                    {t('admin.instructors.delete_confirm', { name: currentInstructor?.name })}
                </Box>
            </Modal>
        </Box>
    );
};

export default InstructorTab;