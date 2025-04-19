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
      console.error('과정 목록 불러오기 오류:', err);
      setError('과정 목록을 불러오는 중 오류가 발생했습니다.');
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
    setCurrentCourse({...course});
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
      console.error('과정 저장 오류:', err);
      setError('과정 저장 중 오류가 발생했습니다.');
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
      console.error('과정 삭제 오류:', err);
      setError('과정 삭제 중 오류가 발생했습니다.');
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
                  onClick={handleCreateCourse}
                  iconName="add-plus"
                >
                  과정 추가
                </Button>
              }
            >
              과정 관리
            </Header>
            
            <TextFilter
              filteringText={filterText}
              filteringPlaceholder="과정 검색..."
              filteringAriaLabel="과정 검색"
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
              header: "과정명",
              cell: item => item.title,
              sortingField: "title"
            },
            {
              id: "category",
              header: "카테고리",
              cell: item => item.category || "-",
              sortingField: "category"
            },
            {
              id: "duration",
              header: "기간(시간)",
              cell: item => item.duration || "-",
              sortingField: "duration"
            },
            {
              id: "level",
              header: "수준",
              cell: item => item.level || "-"
            },
            {
              id: "price",
              header: "가격",
              cell: item => item.price ? `\${item.price.toLocaleString()}원` : "-"
            },
            {
              id: "status",
              header: "상태",
              cell: item => item.isActive ? "활성" : "비활성"
            },
            {
              id: "actions",
              header: "작업",
              cell: item => (
                <SpaceBetween direction="horizontal" size="xs">
                  <Button 
                    variant="normal" 
                    onClick={() => handleEditCourse(item)}
                  >
                    수정
                  </Button>
                  <Button 
                    variant="link"
                    onClick={() => handleDeleteCourseClick(item)}
                  >
                    삭제
                  </Button>
                </SpaceBetween>
              )
            }
          ]}
          empty={
            <Box textAlign="center" color="inherit">
              <b>과정이 없습니다</b>
              <Box padding={{ bottom: "s" }} variant="p" color="inherit">
                새 과정을 추가해주세요.
              </Box>
              <Button onClick={handleCreateCourse}>
                과정 추가
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
      
      {/* 과정 추가/수정 모달 */}
      <Modal
        visible={isModalVisible}
        onDismiss={() => setIsModalVisible(false)}
        header={currentCourse?.id ? "과정 수정" : "새 과정 추가"}
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setIsModalVisible(false)}>
                취소
              </Button>
              <Button variant="primary" onClick={handleSaveCourse}>
                저장
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        {currentCourse && (
          <SpaceBetween size="l">
            <FormField label="과정명">
              <Input
                value={currentCourse.title}
                onChange={({ detail }) =>
                  setCurrentCourse(prev => prev ? ({...prev, title: detail.value}) : null)
                }
              />
            </FormField>
            
            <FormField label="카테고리">
              <Input
                value={currentCourse.category || ''}
                onChange={({ detail }) =>
                  setCurrentCourse(prev => prev ? ({...prev, category: detail.value}) : null)
                }
              />
            </FormField>
            
            <FormField label="설명">
              <Textarea
                value={currentCourse.description || ''}
                onChange={({ detail }) =>
                  setCurrentCourse(prev => prev ? ({...prev, description: detail.value}) : null)
                }
                rows={4}
              />
            </FormField>
            
            <FormField label="기간 (시간)">
              <Input
                type="number"
                value={currentCourse.duration?.toString() || '0'}
                onChange={({ detail }) =>
                  setCurrentCourse(prev => prev ? ({...prev, duration: parseInt(detail.value, 10) || 0}) : null)
                }
              />
            </FormField>
            
            <FormField label="수준">
              <Select
                selectedOption={
                  { 
                    label: currentCourse.level === 'ADVANCED' ? '고급' : 
                            currentCourse.level === 'INTERMEDIATE' ? '중급' : '초급',
                    value: currentCourse.level || 'BEGINNER'
                  }
                }
                onChange={({ detail }) =>
                  setCurrentCourse(prev => prev ? ({...prev, level: detail.selectedOption.value}) : null)
                }
                options={[
                  { label: '초급', value: 'BEGINNER' },
                  { label: '중급', value: 'INTERMEDIATE' },
                  { label: '고급', value: 'ADVANCED' }
                ]}
              />
            </FormField>
            
            <FormField label="가격">
              <Input
                type="number"
                value={currentCourse.price?.toString() || '0'}
                onChange={({ detail }) =>
                  setCurrentCourse(prev => prev ? ({...prev, price: parseFloat(detail.value) || 0}) : null)
                }
              />
            </FormField>
            
            <FormField label="출시일">
                <DatePicker
                    value={currentCourse?.publishedDate || ""}
                    onChange={({ detail }) =>
                    setCurrentCourse(prev => prev ? ({...prev, publishedDate: detail.value}) : null)
                    }
                    placeholder="YYYY/MM/DD"
                    openCalendarAriaLabel={selectedDate =>
                    "출시일 선택" +
                    (selectedDate ? `, 선택된 날짜: \${selectedDate}` : "")
                    }
                />
                </FormField>
            
            <Checkbox
              checked={currentCourse.isActive || false}
              onChange={({ detail }) =>
                setCurrentCourse(prev => prev ? ({...prev, isActive: detail.checked}) : null)
              }
            >
              활성화
            </Checkbox>
          </SpaceBetween>
        )}
      </Modal>
      
      {/* 삭제 확인 모달 */}
      <Modal
        visible={isDeleteModalVisible}
        onDismiss={() => setIsDeleteModalVisible(false)}
        header="과정 삭제"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setIsDeleteModalVisible(false)}>
                취소
              </Button>
              <Button variant="primary" onClick={handleDeleteCourse}>
                삭제
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Box variant="p">
          정말 "{currentCourse?.title}" 과정을 삭제하시겠습니까?
          이 작업은 되돌릴 수 없습니다.
        </Box>
      </Modal>
    </Box>
  );
};

export default CourseCatalogTab;