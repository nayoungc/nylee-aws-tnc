// src/components/theme/ThemeToggle.tsx
import Toggle from '@cloudscape-design/components/toggle';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { t } = useTranslation();
  
  return (
    <Toggle
      onChange={toggleTheme}
      checked={isDarkMode}
    >
      {t('header.theme.darkMode')}
    </Toggle>
  );
}