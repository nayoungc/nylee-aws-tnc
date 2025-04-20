import React from 'react';
import {
  SpaceBetween,
  Grid,
} from '@cloudscape-design/components';
import TextFilter from '@cloudscape-design/components/text-filter';
import Select from '@cloudscape-design/components/select';
import { NonCancelableCustomEvent } from '@cloudscape-design/components/internal/events';
import { useNavigate } from 'react-router-dom';

// 타입 정의 - Cloudscape Select 컴포넌트와 호환되는 옵션 타입
type SelectOption = { label: string; value: string };

// 예시 과정 데이터
const COURSES = [
  {
    id: 'cloud-practitioner',
    title: 'AWS Cloud Practitioner Essentials',
    description: 'This introductory course provides an overview of AWS Cloud concepts, services and security.',
    level: 'Foundational',
    duration: '2 days',
    startDate: '2025-04-20',
    instructor: 'Jane Smith',
    location: 'Online',
    price: '\$699',
    featured: true,
    category: 'Cloud Fundamentals'
  },
  // ... 나머지 과정 데이터 ...
];

const StudentHome = () => {
  const navigate = useNavigate();
  const [filterText, setFilterText] = React.useState('');
  
  // Select 컴포넌트 상태 관리 - 명확한 타입으로 정의
  const [selectedCategory, setSelectedCategory] = React.useState<SelectOption>({ 
    label: 'All categories', 
    value: 'all' 
  });
  
  const [selectedLevel, setSelectedLevel] = React.useState<SelectOption>({ 
    label: 'All levels', 
    value: 'all' 
  });
  
  const [viewType, setViewType] = React.useState('grid');

  // 카테고리 변경 핸들러 - 안전한 타입 처리
  const handleCategoryChange = (event: NonCancelableCustomEvent<any>) => {
    const option = event.detail.selectedOption;
    // 필요한 속성이 존재하는지 확인하고 기본값 제공
    setSelectedCategory({
      label: option.label || 'All categories',
      value: option.value || 'all'
    });
  };

  // 레벨 변경 핸들러 - 안전한 타입 처리
  const handleLevelChange = (event: NonCancelableCustomEvent<any>) => {
    const option = event.detail.selectedOption;
    // 필요한 속성이 존재하는지 확인하고 기본값 제공
    setSelectedLevel({
      label: option.label || 'All levels',
      value: option.value || 'all'
    });
  };

  // 필터 및 정렬 로직
  const filteredCourses = COURSES.filter(course => {
    const matchesText = course.title.toLowerCase().includes(filterText.toLowerCase()) ||
                        course.description.toLowerCase().includes(filterText.toLowerCase());
    const matchesCategory = selectedCategory.value === 'all' || course.category === selectedCategory.value;
    const matchesLevel = selectedLevel.value === 'all' || course.level === selectedLevel.value;
    
    return matchesText && matchesCategory && matchesLevel;
  });

  // 카테고리 및 레벨 옵션 생성
  const categoryOptions = [
    { label: 'All categories', value: 'all' },
    ...Array.from(new Set(COURSES.map(c => c.category))).map(cat => ({ 
      label: cat, 
      value: cat 
    }))
  ];
  
  const levelOptions = [
    { label: 'All levels', value: 'all' },
    ...Array.from(new Set(COURSES.map(c => c.level))).map(level => ({ 
      label: level, 
      value: level 
    }))
  ];
  
  return (
    <SpaceBetween size="l">
      {/* 내용은 동일하게 유지, Select 컴포넌트 부분만 변경 */}
      
      {/* 필터링 옵션 */}
      <Grid gridDefinition={[{ colspan: 8 }, { colspan: 2 }, { colspan: 2 }]}>
        <TextFilter
          filteringText={filterText}
          filteringPlaceholder="Find courses"
          filteringAriaLabel="Filter courses"
          onChange={({ detail }) => setFilterText(detail.filteringText)}
        />
        <Select
          selectedOption={selectedCategory}
          onChange={handleCategoryChange}
          options={categoryOptions}
        />
        <Select
          selectedOption={selectedLevel}
          onChange={handleLevelChange}
          options={levelOptions}
        />
      </Grid>

      {/* 나머지 코드는 동일하게 유지 */}
    </SpaceBetween>
  );
};

export default StudentHome;