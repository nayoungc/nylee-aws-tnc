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
    Alert,
} from '@cloudscape-design/components';
import { useTypedTranslation } from '@utils/i18n-utils';
import { v4 as uuidv4 } from 'uuid';
import { 
    CognitoIdentityProviderClient, 
    ListUsersCommand,
    AdminGetUserCommand 
} from "@aws-sdk/client-cognito-identity-provider";

// Define interfaces
interface Instructor {
    instructorId: string;
    name: string;
    email: string;
    status?: string;
    cognitoId?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface CognitoUser {
    Username: string;
    Attributes: { Name: string, Value: string }[];
    UserStatus?: string;
    Enabled?: boolean;
    UserCreateDate?: Date;
}

// API functions for instructors
const listInstructors = async (options?: any) => {
    try {
        // Replace this with your actual API call
        const response = await fetch('/api/instructors', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const data = await response.json();
        return { data };
    } catch (error) {
        console.error('Error listing instructors:', error);
        throw error;
    }
};

const createInstructor = async (instructor: Partial<Instructor>) => {
    try {
        // Generate ID if not provided
        const instructorWithId = {
            ...instructor,
            instructorId: instructor.instructorId || uuidv4(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Replace this with your actual API call
        const response = await fetch('/api/instructors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(instructorWithId)
        });
        
        const data = await response.json();
        return { data };
    } catch (error) {
        console.error('Error creating instructor:', error);
        throw error;
    }
};

const updateInstructor = async (instructor: Partial<Instructor>) => {
    try {
        const updateData = {
            ...instructor,
            updatedAt: new Date().toISOString()
        };
        
        // Replace this with your actual API call
        const response = await fetch(`/api/instructors/\${instructor.instructorId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        });
        
        const data = await response.json();
        return { data };
    } catch (error) {
        console.error('Error updating instructor:', error);
        throw error;
    }
};

const deleteInstructor = async (instructorId: string) => {
    try {
        // Replace this with your actual API call
        const response = await fetch(`/api/instructors/\${instructorId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        return { data };
    } catch (error) {
        console.error('Error deleting instructor:', error);
        throw error;
    }
};

// AWS SDK v3 Cognito client
const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.REACT_APP_AWS_REGION || 'us-east-1' });
const USER_POOL_ID = process.env.REACT_APP_COGNITO_USER_POOL_ID || '';

// Fetch Cognito users with AWS SDK v3
const listCognitoUsers = async () => {
    try {
        const command = new ListUsersCommand({
            UserPoolId: USER_POOL_ID,
            Limit: 60,
            // Optional filter to get only certain users
            // Filter: "cognito:user_status = \"CONFIRMED\""
        });
        
        const response = await cognitoClient.send(command);
        return response.Users || [];
    } catch (error) {
        console.error('Error fetching Cognito users:', error);
        throw error;
    }
};

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
    const [cognitoUsers, setCognitoUsers] = useState<CognitoUser[]>([]);
    const [loadingCognitoUsers, setLoadingCognitoUsers] = useState<boolean>(false);

    // 강사 목록 불러오기
    const fetchInstructors = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await listInstructors({ limit: 20 });

            console.log(t('admin.instructors.log.load_result'), response);

            // 응답에서 data 추출
            if (response.data) {
                setInstructors(response.data as Instructor[]);
            }
        } catch (err: any) {
            console.error(t('admin.instructors.error_loading'), err);
            setError(t('admin.instructors.error_loading'));
        } finally {
            setLoading(false);
        }
    };

    // Cognito 사용자 풀에서 사용자 가져오기 (AWS SDK v3 사용)
    const fetchCognitoUsers = async () => {
        setLoadingCognitoUsers(true);
      
        try {
            const users = await listCognitoUsers();
            setCognitoUsers(users as CognitoUser[]);
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
        instructor.email?.toLowerCase().includes(filterText.toLowerCase())
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
            instructorId: uuidv4(), // Generate a unique ID
            name: '',
            email: '',
            status: 'ACTIVE',
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
    const getAttributeValue = (user: CognitoUser, attributeName: string): string => {
        if (!user.Attributes) return '';
        const attribute = user.Attributes.find((attr) => attr.Name === attributeName);
        return attribute ? attribute.Value : '';
    };

    // 강사 저장 (생성/수정)
    const handleSaveInstructor = async () => {
        if (!currentInstructor || !currentInstructor.name || !currentInstructor.email) return;

        const instructor = currentInstructor; // Create local reference to avoid null checks
        setLoading(true);
        setError(null);

        try {
            if (instructor.instructorId) {
                // 기존 강사 수정
                const updateInput = {
                    instructorId: instructor.instructorId,
                    name: instructor.name,
                    email: instructor.email,
                    status: instructor.status || 'ACTIVE',
                };
                
                const response = await updateInstructor(updateInput);

                console.log(t('admin.instructors.log.update_result'), response);

                // 수정된 강사로 상태 업데이트
                if (response.data) {
                    setInstructors(prevInstructors =>
                        prevInstructors.map(i => i.instructorId === instructor.instructorId ? response.data as Instructor : i)
                    );
                }
            } else {
                // 새 강사 생성
                const createInput = {
                    instructorId: uuidv4(),
                    name: instructor.name,
                    email: instructor.email,
                    status: instructor.status || 'ACTIVE',
                    cognitoId: instructor.cognitoId
                };
                
                const response = await createInstructor(createInput);

                console.log(t('admin.instructors.log.create_result'), response);
                
                // 생성된 강사 추가
                if (response.data) {
                    setInstructors(prevInstructors => [...prevInstructors, response.data as Instructor]);
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
        if (!currentInstructor?.instructorId) return;

        const instructor = currentInstructor; // Create local reference to avoid null checks
        setLoading(true);
        setError(null);

        try {
            const response = await deleteInstructor(instructor.instructorId);

            console.log(t('admin.instructors.log.delete_result'), response);

            // 삭제 확인 후 UI 업데이트
            if (response.data) {
                setInstructors(prevInstructors =>
                    prevInstructors.filter(i => i.instructorId !== instructor.instructorId)
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
            {error && <Alert type="error">{error}</Alert>}
            
            <Header
                actions={
                    <Button variant="primary" onClick={handleCreateInstructor}>
                        {t('admin.instructors.add_new')}
                    </Button>
                }
            >
                {t('admin.instructors.title')}
            </Header>
            
            <TextFilter
                filteringText={filterText}
                filteringPlaceholder={tString('admin.instructors.search_placeholder')}
                filteringAriaLabel={tString('admin.instructors.search_aria_label')}
                onChange={({ detail }) => setFilterText(detail.filteringText)}
            />
            
            <Table
                items={paginatedItems}
                loading={loading}
                columnDefinitions={[
                    {
                        id: 'name',
                        header: t('admin.instructors.name'),
                        cell: item => item.name || '-',
                        sortingField: 'name',
                    },
                    {
                        id: 'email',
                        header: t('admin.instructors.email'),
                        cell: item => item.email || '-',
                        sortingField: 'email',
                    },
                    {
                        id: 'status',
                        header: t('admin.instructors.status'),
                        cell: item => item.status || '-',
                        sortingField: 'status',
                    },
                    {
                        id: 'actions',
                        header: t('admin.common.actions'),
                        cell: item => (
                            <SpaceBetween direction="horizontal" size="xs">
                                <Button onClick={() => handleEditInstructor(item)}>
                                    {t('admin.common.edit')}
                                </Button>
                                <Button variant="primary" formAction="none" iconName="remove" onClick={() => handleDeleteInstructorClick(item)}>
                                    {t('admin.common.delete')}
                                </Button>
                            </SpaceBetween>
                        ),
                    },
                ]}
                empty={
                    <Box textAlign="center" color="inherit">
                        <b>{t('admin.instructors.no_resources')}</b>
                        <Box padding={{ bottom: 's' }} variant="p" color="inherit">
                            {t('admin.instructors.no_resources_to_display')}
                        </Box>
                    </Box>
                }
            />
            
            <Pagination
                currentPageIndex={currentPageIndex}
                pagesCount={Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE))}
                onChange={({ detail }) => setCurrentPageIndex(detail.currentPageIndex)}
            />
            
            {/* 강사 생성/수정 모달 */}
            <Modal
                visible={isModalVisible}
                onDismiss={() => setIsModalVisible(false)}
                header={currentInstructor?.instructorId ? t('admin.instructors.edit') : t('admin.instructors.create')}
                footer={
                    <Box float="right">
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button variant="link" onClick={() => setIsModalVisible(false)}>
                                {t('admin.common.cancel')}
                            </Button>
                            <Button 
                                variant="primary" 
                                onClick={handleSaveInstructor} 
                                disabled={!currentInstructor?.name || !currentInstructor?.email}
                            >
                                {t('admin.common.save')}
                            </Button>
                        </SpaceBetween>
                    </Box>
                }
            >
                <SpaceBetween size="l">
                    <FormField label={t('admin.instructors.name')}>
                        <Input
                            value={currentInstructor?.name || ''}
                            onChange={({ detail }) => 
                                setCurrentInstructor(curr => curr ? {...curr, name: detail.value} : null)
                            }
                        />
                    </FormField>
                    
                    <FormField label={t('admin.instructors.email')}>
                        <Input
                            type="email"
                            value={currentInstructor?.email || ''}
                            onChange={({ detail }) => 
                                setCurrentInstructor(curr => curr ? {...curr, email: detail.value} : null)
                            }
                        />
                    </FormField>
                    
                    <FormField label={t('admin.instructors.status')}>
                        <Select
                            selectedOption={{
                                value: currentInstructor?.status || 'ACTIVE',
                                label: currentInstructor?.status || 'ACTIVE'
                            }}
                            onChange={({ detail }) => 
                                setCurrentInstructor(curr => curr ? 
                                    {...curr, status: detail.selectedOption.value} : null)
                            }
                            options={[
                                { value: 'ACTIVE', label: 'Active' },
                                { value: 'INACTIVE', label: 'Inactive' }
                            ]}
                        />
                    </FormField>
                    
                    <FormField label={t('admin.instructors.cognito_user')}>
                        <Select
                            selectedOption={
                                currentInstructor?.cognitoId ? 
                                {
                                    value: currentInstructor.cognitoId,
                                    label: cognitoUsers.find(u => u.Username === currentInstructor.cognitoId) ? 
                                        getAttributeValue(
                                            cognitoUsers.find(u => u.Username === currentInstructor.cognitoId) as CognitoUser, 
                                            'email'
                                        ) : 
                                        currentInstructor.cognitoId
                                } : 
                                null
                            }
                            onChange={({ detail }) => 
                                setCurrentInstructor(curr => curr ? 
                                    {...curr, cognitoId: detail.selectedOption.value} : null)
                            }
                            options={cognitoUsers.map(user => ({
                                value: user.Username,
                                label: getAttributeValue(user, 'email') || user.Username
                            }))}
                            loadingText={tString('admin.instructors.loading_cognito')}
                            statusType={loadingCognitoUsers ? 'loading' : 'finished'}
                            placeholder={tString('admin.instructors.select_cognito_user')}
                            empty={t('admin.instructors.no_cognito_users')}
                        />
                    </FormField>
                </SpaceBetween>
            </Modal>
            
            {/* 강사 삭제 모달 */}
            <Modal
                visible={isDeleteModalVisible}
                onDismiss={() => setIsDeleteModalVisible(false)}
                header={t('admin.instructors.delete')}
                footer={
                    <Box float="right">
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button variant="link" onClick={() => setIsDeleteModalVisible(false)}>
                                {t('admin.common.cancel')}
                            </Button>
                            <Button variant="primary" formAction="none" iconName="remove" onClick={handleDeleteInstructor}>
                                {t('admin.common.delete')}
                            </Button>
                        </SpaceBetween>
                    </Box>
                }
            >
                <p>
                    {t('admin.instructors.delete_confirmation', {
                        name: currentInstructor?.name
                    })}
                </p>
            </Modal>
        </Box>
    );
};

export default InstructorTab;