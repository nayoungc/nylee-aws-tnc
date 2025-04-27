// src/components/layout/BreadcrumbGroup.tsx
import React from 'react';
import { BreadcrumbGroup as CloudscapeBreadcrumbGroup } from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';
import { useAppTranslation } from '@/hooks/useAppTranslation';

interface BreadcrumbItem {
  text?: string; // text를 선택적으로 변경
  href: string;
  translationKey?: string;
}

interface BreadcrumbGroupProps {
  items: BreadcrumbItem[];
  ariaLabelKey?: string;
}

const BreadcrumbGroup: React.FC<BreadcrumbGroupProps> = ({ 
  items, 
  ariaLabelKey = 'navigation_breadcrumb_label'
}) => {
  const navigate = useNavigate();
  const { t } = useAppTranslation();

  // translationKey가 있으면 번역된 텍스트를 사용, 아니면 text 속성 그대로 사용
  const translatedItems = items.map(item => ({
    text: item.translationKey ? t(item.translationKey) : (item.text || ''),
    href: item.href
  }));

  return (
    <CloudscapeBreadcrumbGroup
      items={translatedItems}
      ariaLabel={t(ariaLabelKey)}
      onFollow={e => {
        e.preventDefault();
        navigate(e.detail.href);
      }}
    />
  );
};

export default BreadcrumbGroup;