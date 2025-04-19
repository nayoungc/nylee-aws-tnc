// src/pages/admin/CustomerTab.tsx
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
    Alert
} from '@cloudscape-design/components';
import { generateClient } from 'aws-amplify/api';
import { listCustomers } from '../../graphql/queries';
import { createCustomer, updateCustomer, deleteCustomer } from '../../graphql/mutations';
import { Customer } from '../../models/Customer';

// GraphQL 응답 타입 인터페이스
interface GraphQLResponse<T> {
    data?: T;
    errors?: any[];
}

// 쿼리 응답 인터페이스
interface ListCustomersResponse {
    listCustomers: {
        items: Customer[];
        nextToken?: string;
    };
}

// 뮤테이션 응답 인터페이스
interface CreateCustomerResponse {
    createCustomer: Customer;
}

interface UpdateCustomerResponse {
    updateCustomer: Customer;
}

interface DeleteCustomerResponse {
    deleteCustomer: Customer;
}

const CustomerTab: React.FC = () => {
    // 상태 관리
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false);
    const [filterText, setFilterText] = useState<string>('');
    const [currentPageIndex, setCurrentPageIndex] = useState<number>(1);
    const [error, setError] = useState<string | null>(null);

    // API 클라이언트 생성
    const client = generateClient();

    // 고객사 목록 불러오기
    const fetchCustomers = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await client.graphql({
                query: listCustomers,
                variables: {
                    limit: 20
                }
            }) as GraphQLResponse<ListCustomersResponse>;

            if (result.data?.listCustomers?.items) {
                setCustomers(result.data.listCustomers.items);
            }
        } catch (err) {
            console.error('고객사 목록 불러오기 오류:', err);
            setError('고객사 목록을 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        fetchCustomers();
    }, []);

    // 필터링된 아이템
    const filteredItems = customers.filter(customer =>
        !filterText ||
        customer.name?.toLowerCase().includes(filterText.toLowerCase()) ||
        customer.contactPerson?.toLowerCase().includes(filterText.toLowerCase()) ||
        customer.email?.toLowerCase().includes(filterText.toLowerCase())
    );

    // 페이지당 아이템 수
    const PAGE_SIZE = 10;
    const paginatedItems = filteredItems.slice(
        (currentPageIndex - 1) * PAGE_SIZE,
        currentPageIndex * PAGE_SIZE
    );

    // 새 고객사 만들기
    const handleCreateCustomer = () => {
        setCurrentCustomer({
            name: '',
            contactPerson: '',
            email: '',
            phone: '',
            address: '',
            status: 'ACTIVE',
            joinDate: new Date().toISOString().split('T')[0]
        });
        setIsModalVisible(true);
    };

    // 고객사 수정
    const handleEditCustomer = (customer: Customer) => {
        setCurrentCustomer({ ...customer });
        setIsModalVisible(true);
    };

    // 고객사 삭제 모달 표시
    const handleDeleteCustomerClick = (customer: Customer) => {
        setCurrentCustomer(customer);
        setIsDeleteModalVisible(true);
    };

    // 고객사 저장 (생성/수정)
    const handleSaveCustomer = async () => {
        if (!currentCustomer || !currentCustomer.name) return;

        setLoading(true);
        setError(null);

        try {
            if (currentCustomer.id) {
                // 기존 고객사 수정
                const customerInput = {
                    id: currentCustomer.id,
                    name: currentCustomer.name,
                    contactPerson: currentCustomer.contactPerson,
                    email: currentCustomer.email,
                    phone: currentCustomer.phone,
                    address: currentCustomer.address,
                    status: currentCustomer.status,
                    joinDate: currentCustomer.joinDate
                };

                const result = await client.graphql({
                    query: updateCustomer,
                    variables: {
                        input: customerInput
                    }
                }) as GraphQLResponse<UpdateCustomerResponse>;

                // 수정된 고객사로 상태 업데이트
                if (result.data?.updateCustomer) {
                    setCustomers(prevCustomers =>
                        prevCustomers.map(c => c.id === currentCustomer.id ? result.data!.updateCustomer : c)
                    );
                }
            } else {
                // 새 고객사 생성
                const customerInput = {
                    name: currentCustomer.name,
                    contactPerson: currentCustomer.contactPerson,
                    email: currentCustomer.email,
                    phone: currentCustomer.phone,
                    address: currentCustomer.address,
                    status: currentCustomer.status,
                    joinDate: currentCustomer.joinDate
                };

                const result = await client.graphql({
                    query: createCustomer,
                    variables: {
                        input: customerInput
                    }
                }) as GraphQLResponse<CreateCustomerResponse>;

                // 생성된 고객사 추가
                if (result.data?.createCustomer) {
                    setCustomers(prevCustomers => [...prevCustomers, result.data!.createCustomer]);
                }
            }

            // 모달 닫기
            setIsModalVisible(false);
            setCurrentCustomer(null);
        } catch (err) {
            console.error('고객사 저장 오류:', err);
            setError('고객사 저장 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 고객사 삭제
    const handleDeleteCustomer = async () => {
        if (!currentCustomer?.id) return;

        setLoading(true);
        setError(null);

        try {
            const result = await client.graphql({
                query: deleteCustomer,
                variables: {
                    input: { id: currentCustomer.id }
                }
            }) as GraphQLResponse<DeleteCustomerResponse>;

            if (result.data?.deleteCustomer) {
                // 삭제된 고객사 제거
                setCustomers(prevCustomers =>
                    prevCustomers.filter(c => c.id !== currentCustomer.id)
                );
            }

            // 모달 닫기
            setIsDeleteModalVisible(false);
            setCurrentCustomer(null);
        } catch (err) {
            console.error('고객사 삭제 오류:', err);
            setError('고객사 삭제 중 오류가 발생했습니다.');
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
                                    onClick={handleCreateCustomer}
                                    iconName="add-plus"
                                >
                                    고객사 추가
                                </Button>
                            }
                        >
                            고객사 관리
                        </Header>

                        <TextFilter
                            filteringText={filterText}
                            filteringPlaceholder="고객사 검색..."
                            filteringAriaLabel="고객사 검색"
                            onChange={({ detail }) => setFilterText(detail.filteringText)}
                        />
                    </SpaceBetween>
                </Box>

                {/* 고객사 테이블 */}
                <Table
                    loading={loading}
                    items={paginatedItems}
                    columnDefinitions={[
                        {
                            id: "name",
                            header: "회사명",
                            cell: item => item.name,
                            sortingField: "name"
                        },
                        {
                            id: "contactPerson",
                            header: "담당자",
                            cell: item => item.contactPerson || "-",
                            sortingField: "contactPerson"
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
                                        onClick={() => handleEditCustomer(item)}
                                    >
                                        수정
                                    </Button>
                                    <Button
                                        variant="link"
                                        onClick={() => handleDeleteCustomerClick(item)}
                                    >
                                        삭제
                                    </Button>
                                </SpaceBetween>
                            )
                        }
                    ]}
                    empty={
                        <Box textAlign="center" color="inherit">
                            <b>고객사가 없습니다</b>
                            <Box padding={{ bottom: "s" }} variant="p" color="inherit">
                                새 고객사를 추가해주세요.
                            </Box>
                            <Button onClick={handleCreateCustomer}>
                                고객사 추가
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

            {/* 고객사 추가/수정 모달 */}
            <Modal
                visible={isModalVisible}
                onDismiss={() => setIsModalVisible(false)}
                header={currentCustomer?.id ? "고객사 수정" : "새 고객사 추가"}
                footer={
                    <Box float="right">
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button variant="link" onClick={() => setIsModalVisible(false)}>
                                취소
                            </Button>
                            <Button variant="primary" onClick={handleSaveCustomer}>
                                저장
                            </Button>
                        </SpaceBetween>
                    </Box>
                }
            >
                {currentCustomer && (
                    <SpaceBetween size="l">
                        <FormField label="회사명">
                            <Input
                                value={currentCustomer.name}
                                onChange={({ detail }) =>
                                    setCurrentCustomer(prev => prev ? ({ ...prev, name: detail.value }) : null)
                                }
                            />
                        </FormField>

                        <FormField label="담당자">
                            <Input
                                value={currentCustomer.contactPerson || ''}
                                onChange={({ detail }) =>
                                    setCurrentCustomer(prev => prev ? ({ ...prev, contactPerson: detail.value }) : null)
                                }
                            />
                        </FormField>

                        <FormField label="이메일">
                            <Input
                                type="email"
                                value={currentCustomer.email || ''}
                                onChange={({ detail }) =>
                                    setCurrentCustomer(prev => prev ? ({ ...prev, email: detail.value }) : null)
                                }
                            />
                        </FormField>

                        <FormField label="전화번호">
                            <Input
                                type="text"
                                value={currentCustomer.phone || ''}
                                onChange={({ detail }) =>
                                    setCurrentCustomer(prev => prev ? ({ ...prev, phone: detail.value }) : null)
                                }
                            />
                        </FormField>

                        <FormField label="주소">
                            <Input
                                value={currentCustomer.address || ''}
                                onChange={({ detail }) =>
                                    setCurrentCustomer(prev => prev ? ({ ...prev, address: detail.value }) : null)
                                }
                            />
                        </FormField>

                        <FormField label="상태">
                            <Select
                                selectedOption={
                                    {
                                        label: currentCustomer.status === 'ACTIVE' ? '활성' : '비활성',
                                        value: currentCustomer.status || 'ACTIVE'
                                    }
                                }
                                onChange={({ detail }) =>
                                    setCurrentCustomer(prev => prev ? ({ ...prev, status: detail.selectedOption.value }) : null)
                                }
                                options={[
                                    { label: '활성', value: 'ACTIVE' },
                                    { label: '비활성', value: 'INACTIVE' }
                                ]}
                            />
                        </FormField>

                        <FormField label="가입일">
                            <DatePicker
                                value={currentCustomer?.joinDate || ""}
                                onChange={({ detail }) =>
                                    setCurrentCustomer(prev => prev ? ({ ...prev, joinDate: detail.value }) : null)
                                }
                                placeholder="YYYY/MM/DD"
                                openCalendarAriaLabel={selectedDate =>
                                    "출시일 선택" +
                                    (selectedDate ? `, 선택된 날짜: \${selectedDate}` : "")
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
                header="고객사 삭제"
                footer={
                    <Box float="right">
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button variant="link" onClick={() => setIsDeleteModalVisible(false)}>
                                취소
                            </Button>
                            <Button variant="primary" onClick={handleDeleteCustomer}>
                                삭제
                            </Button>
                        </SpaceBetween>
                    </Box>
                }
            >
                <Box variant="p">
                    정말 "{currentCustomer?.name}" 고객사를 삭제하시겠습니까?
                    이 작업은 되돌릴 수 없습니다.
                </Box>
            </Modal>
        </Box>
    );
};

export default CustomerTab;