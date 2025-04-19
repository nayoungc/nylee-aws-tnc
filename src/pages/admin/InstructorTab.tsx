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

            console.log('강사 목록 결과:', result);

            // 응답에서 items 추출
            const items = result.data?.listInstructors?.items;
            if (items) {
                setInstructors(items);
            }
        } catch (err: any) {
            console.error('강사 목록 불러오기 오류:', err);
            setError('강사 목록을 불러오는 중 오류가 발생했습니다.');
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
                        { Name: 'name', Value: '강사1' }
                    ]
                },
                {
                    Username: 'user2',
                    Attributes: [
                        { Name: 'email', Value: 'instructor2@example.com' },
                        { Name: 'name', Value: '강사2' }
                    ]
                },
                {
                    Username: 'user3',
                    Attributes: [
                        { Name: 'email', Value: 'instructor3@example.com' },
                        { Name: 'name', Value: '강사3' }
                    ]
                }
            ];

            setCognitoUsers(dummyUsers);
        } catch (err) {
            console.error('Cognito 사용자 불러오기 오류:', err);
            setError('Cognito 사용자를 불러오는 중 오류가 발생했습니다.');
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

                console.log('강사 수정 결과:', result);

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

                console.log('강사 생성 결과:', result);
                
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
            console.error('강사 저장 오류:', err);
            setError('강사 정보 저장 중 오류가 발생했습니다.');
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

            console.log('강사 삭제 결과:', result);

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
            console.error('강사 삭제 오류:', err);
            setError('강사 삭제 중 오류가 발생했습니다.');
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
                                    강사 추가
                                </Button>
                            }
                        >
                            강사 관리
                        </Header>

                        <TextFilter
                            filteringText={filterText}
                            filteringPlaceholder="강사 검색..."
                            filteringAriaLabel="강사 검색"
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
                            header: "이름",
                            cell: item => item.name,
                            sortingField: "name"
                        },
                        {
                            id: "email",
                            header: "이메일",
                            cell: item => item.email || "-"
                        },
                        {
                            id: "phone",
                            header: "전화번호",
                            cell: item => item.phone || "-"
                        },
                        {
                            id: "specialization",
                            header: "전문 분야",
                            cell: item => item.specialization || "-"
                        },
                        {
                            id: "status",
                            header: "상태",
                            cell: item => item.status === 'ACTIVE' ? "활성" : "비활성"
                        },
                        {
                            id: "joinDate",
                            header: "가입일",
                            cell: item => item.joinDate || "-"
                        },
                        {
                            id: "actions",
                            header: "작업",
                            cell: item => (
                                <SpaceBetween direction="horizontal" size="xs">
                                    <Button
                                        variant="normal"
                                        onClick={() => handleEditInstructor(item)}
                                    >
                                        수정
                                    </Button>
                                    <Button
                                        variant="link"
                                        onClick={() => handleDeleteInstructorClick(item)}
                                    >
                                        삭제
                                    </Button>
                                </SpaceBetween>
                            )
                        }
                    ]}
                    empty={
                        <Box textAlign="center" color="inherit">
                            <b>강사가 없습니다</b>
                            <Box padding={{ bottom: "s" }} variant="p" color="inherit">
                                새 강사를 추가해주세요.
                            </Box>
                            <Button onClick={handleCreateInstructor}>
                                강사 추가
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
                                nextPageLabel: '다음 페이지',
                                previousPageLabel: '이전 페이지',
                                pageLabel: pageNumber =>
                                    `\${pageNumber} 페이지로 이동`
                            }}
                        />
                    }
                />
            </SpaceBetween>

            {/* 강사 추가/수정 모달 */}
            <Modal
                visible={isModalVisible}
                onDismiss={() => setIsModalVisible(false)}
                header={currentInstructor?.id ? "강사 수정" : "새 강사 추가"}
                footer={
                    <Box float="right">
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button variant="link" onClick={() => setIsModalVisible(false)}>
                                취소
                            </Button>
                            <Button variant="primary" onClick={handleSaveInstructor}>
                                저장
                            </Button>
                        </SpaceBetween>
                    </Box>
                }
            >
                {currentInstructor && (
                    <SpaceBetween size="l">
                        {/* 모달 내용은 동일하게 유지 */}
                        {!currentInstructor.id && (
                            <FormField label="Cognito 사용자">
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
                                    placeholder="Cognito 사용자 선택"
                                    loadingText="사용자 로딩 중..."
                                    statusType={loadingCognitoUsers ? "loading" : "finished"}
                                    empty="사용 가능한 Cognito 사용자가 없습니다"
                                />
                            </FormField>
                        )}

                        <FormField label="이름">
                            <Input
                                value={currentInstructor.name}
                                onChange={({ detail }) =>
                                    setCurrentInstructor(prev => prev ? ({ ...prev, name: detail.value }) : null)
                                }
                            />
                        </FormField>

                        <FormField label="이메일">
                            <Input
                                type="email"
                                value={currentInstructor.email}
                                onChange={({ detail }) =>
                                    setCurrentInstructor(prev => prev ? ({ ...prev, email: detail.value }) : null)
                                }
                            />
                        </FormField>

                        <FormField label="전화번호">
                            <Input
                                type="text"
                                inputMode="tel"
                                value={currentInstructor.phone || ''}
                                onChange={({ detail }) =>
                                    setCurrentInstructor(prev => prev ? ({ ...prev, phone: detail.value }) : null)
                                }
                                placeholder="+82-10-1234-5678"
                            />
                        </FormField>

                        <FormField label="전문 분야">
                            <Input
                                value={currentInstructor.specialization || ''}
                                onChange={({ detail }) =>
                                    setCurrentInstructor(prev => prev ? ({ ...prev, specialization: detail.value }) : null)
                                }
                            />
                        </FormField>

                        <FormField label="자기소개">
                            <Textarea
                                value={currentInstructor.bio || ''}
                                onChange={({ detail }) =>
                                    setCurrentInstructor(prev => prev ? ({ ...prev, bio: detail.value }) : null)
                                }
                                rows={3}
                            />
                        </FormField>

                        <FormField label="상태">
                            <Select
                                selectedOption={
                                    {
                                        label: currentInstructor.status === 'ACTIVE' ? '활성' : '비활성',
                                        value: currentInstructor.status || 'ACTIVE'
                                    }
                                }
                                onChange={({ detail }) =>
                                    setCurrentInstructor(prev => prev ? ({ ...prev, status: detail.selectedOption.value }) : null)
                                }
                                options={[
                                    { label: '활성', value: 'ACTIVE' },
                                    { label: '비활성', value: 'INACTIVE' }
                                ]}
                            />
                        </FormField>

                        <FormField label="가입일">
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
                header="강사 삭제"
                footer={
                    <Box float="right">
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button variant="link" onClick={() => setIsDeleteModalVisible(false)}>
                                취소
                            </Button>
                            <Button variant="primary" onClick={handleDeleteInstructor}>
                                삭제
                            </Button>
                        </SpaceBetween>
                    </Box>
                }
            >
                <Box variant="p">
                    정말 "{currentInstructor?.name}" 강사를 삭제하시겠습니까?
                    이 작업은 되돌릴 수 없습니다.
                </Box>
            </Modal>
        </Box>
    );
};

export default InstructorTab;