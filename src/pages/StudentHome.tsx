// pages/StudentHome.tsx
import React from 'react';
import {
  SpaceBetween,
  Grid,
} from '@cloudscape-design/components';
import TextFilter from '@cloudscape-design/components/text-filter';
import Select from '@cloudscape-design/components/select';
import { NonCancelableCustomEvent } from '@cloudscape-design/components/internal/events';
import { useNavigate } from 'react-router-dom';
import { useTypedTranslation } from '@utils/i18n-utils'; // Using absolute path

// Define types compatible with Cloudscape Select component
type SelectOption = { label: string; value: string };

// Sample course data
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
    price: '\\$699',
    featured: true,
    category: 'Cloud Fundamentals'
  },
  // ... rest of course data ...
];

const StudentHome = () => {
  const navigate = useNavigate();
  const { t, i18n, tString } = useTypedTranslation(); // Add translation hook
  const [filterText, setFilterText] = React.useState('');
  
  // Select component state management with clear types
  const [selectedCategory, setSelectedCategory] = React.useState<SelectOption>({ 
    label: t('admin.courses.form.category') || 'All categories', 
    value: 'all' 
  });
  
  const [selectedLevel, setSelectedLevel] = React.useState<SelectOption>({ 
    label: t('user.level') || 'All levels', 
    value: 'all' 
  });
  
  const [viewType, setViewType] = React.useState('grid');

  // Category change handler with safe type handling
  const handleCategoryChange = (event: NonCancelableCustomEvent<any>) => {
    const option = event.detail.selectedOption;
    // Verify required properties exist and provide defaults
    setSelectedCategory({
      label: option.label || t('admin.courses.form.category') || 'All categories',
      value: option.value || 'all'
    });
  };

  // Level change handler with safe type handling
  const handleLevelChange = (event: NonCancelableCustomEvent<any>) => {
    const option = event.detail.selectedOption;
    // Verify required properties exist and provide defaults
    setSelectedLevel({
      label: option.label || t('user.level') || 'All levels',
      value: option.value || 'all'
    });
  };

  // Filter and sort logic
  const filteredCourses = COURSES.filter(course => {
    const matchesText = course.title.toLowerCase().includes(filterText.toLowerCase()) ||
                        course.description.toLowerCase().includes(filterText.toLowerCase());
    const matchesCategory = selectedCategory.value === 'all' || course.category === selectedCategory.value;
    const matchesLevel = selectedLevel.value === 'all' || course.level === selectedLevel.value;
    
    return matchesText && matchesCategory && matchesLevel;
  });

  // Generate category and level options with translations
  const categoryOptions = React.useMemo(() => [
    { label: t('admin.courses.form.category') || 'All categories', value: 'all' },
    ...Array.from(new Set(COURSES.map(c => c.category))).map(cat => ({ 
      label: cat, 
      value: cat 
    }))
  ], [t, i18n.language]); // Re-compute when language changes
  
  const levelOptions = React.useMemo(() => [
    { label: t('user.level') || 'All levels', value: 'all' },
    ...Array.from(new Set(COURSES.map(c => c.level))).map(level => ({ 
      label: level, 
      value: level 
    }))
  ], [t, i18n.language]); // Re-compute when language changes
  
  return (
    <SpaceBetween size="l">
      {/* Filtering options */}
      <Grid gridDefinition={[{ colspan: 8 }, { colspan: 2 }, { colspan: 2 }]}>
        <TextFilter
          filteringText={filterText}
          filteringPlaceholder={t('admin.courses.search_placeholder') || "Find courses"}
          filteringAriaLabel={t('admin.courses.search_aria_label') || "Filter courses"}
          onChange={({ detail }) => setFilterText(detail.filteringText)}
        />
        <Select
          selectedOption={selectedCategory}
          onChange={handleCategoryChange}
          options={categoryOptions}
          placeholder={tString('survey.course_placeholder')}
        />
        <Select
          selectedOption={selectedLevel}
          onChange={handleLevelChange}
          options={levelOptions}
          placeholder={tString('user.level')}
        />
      </Grid>

      {/* Rest of code stays the same */}
    </SpaceBetween>
  );
};

export default StudentHome;