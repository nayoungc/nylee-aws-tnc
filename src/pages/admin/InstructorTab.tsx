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
import { useTypedTranslation } from '../../utils/i18n-utils';
import {
    Instructor,
    listInstructors,
    createInstructor,
    updateInstructor,
    deleteInstructor
} from '../../graphql/client';
import { listCognitoUsers } from '../../services/cognitoService';

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
            const response = await listInstructors({ limit: 20 });

            console.log(t('admin.instructors.log.load_result'), response);

            // 응답에서 items 추출
            if (response.data) {
                setInstructors(response.data);
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
          const users = await listCognitoUsers();
          setCognitoUsers(users);
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
                // 기존 강사 수정
                const updateInput = {
                    id: currentInstructor.id,
                    name: currentInstructor.name,
                    email: currentInstructor.email,
                    status: currentInstructor.status || 'ACTIVE',
                };
                
                const response = await updateInstructor(updateInput);

                console.log(t('admin.instructors.log.update_result'), response);

                // 수정된 강사로 상태 업데이트
                if (response.data) {
                    setInstructors(prevInstructors =>
                        prevInstructors.map(i => i.id === currentInstructor.id ? response.data : i)
                    );
                }
            } else {
                // 새 강사 생성
                const createInput = {
                    name: currentInstructor.name,
                    email: currentInstructor.email,
                    status: currentInstructor.status || 'ACTIVE',
                    cognitoId: currentInstructor.cognitoId
                };
                
                const response = await createInstructor(createInput);

                console.log(t('admin.instructors.log.create_result'), response);
                
                // 생성된 강사 추가
                if (response.data) {
                    setInstructors(prevInstructors => [...prevInstructors, response.data]);
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
            const response = await deleteInstructor(currentInstructor.id);

            console.log(t('admin.instructors.log.delete_result'), response);

            // 삭제 확인 후 UI 업데이트
            if (response.data) {
                setInstructors(prevInstructors =>
                    prevInstructors.filter(i => i.id !== currentInstructor.id)
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

    // JSX 부분은 그대로 유지
    return (
        // 기존의 JSX 반환 (변경 없음)
        <Box padding="m">
            {/* 기존 코드와 동일 */}
        </Box>
    );
};

export default InstructorTab;