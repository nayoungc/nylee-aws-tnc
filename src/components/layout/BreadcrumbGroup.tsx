// src/components/layout/BreadcrumbGroup.tsx
import React from 'react';
import { BreadcrumbGroup as CloudscapeBreadcrumbGroup } from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';

interface BreadcrumbItem {
  text: string;
  href: string;
}

interface BreadcrumbGroupProps {
  items: BreadcrumbItem[];
}

const BreadcrumbGroup: React.FC<BreadcrumbGroupProps> = ({ items }) => {
  const navigate = useNavigate();

  return (
    <CloudscapeBreadcrumbGroup
      items={items}
      ariaLabel="탐색"
      onFollow={e => {
        e.preventDefault();
        navigate(e.detail.href);
      }}
    />
  );
};

export default BreadcrumbGroup;