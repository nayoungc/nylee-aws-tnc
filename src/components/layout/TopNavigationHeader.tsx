// src/components/layout/TopNavigationHeader.tsx
import React from 'react';
import { TopNavigation } from '@cloudscape-design/components';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const TopNavigationHeader: React.FC = () => {
  const { t, i18n } = useTranslation(['navigation']);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  // 현재 언어에 따라 표시 텍스트 결정
  const currentLanguageText = i18n.language === 'ko' 
    ? t('navigation:language_korean') 
    : t('navigation:language_english');

  return (
    <TopNavigation
      identity={{
        href: "/",
        title: t('navigation:app_title'),
        logo: {
          src: "/assets/logo.svg",
          alt: t('navigation:app_logo_alt')
        }
      }}
      utilities={[
        // 언어 선택 드롭다운 메뉴
        {
          type: "menu-dropdown",
          text: currentLanguageText,
          iconName: "globe",
          title: t('navigation:language_label'),
          items: [
            { 
              id: "ko", 
              text: t('navigation:language_korean'),
              checked: i18n.language === 'ko'
            },
            { 
              id: "en", 
              text: t('navigation:language_english'),
              checked: i18n.language === 'en'
            }
          ],
          onItemClick: ({ detail }) => {
            i18n.changeLanguage(detail.id);
          }
        },
        
        // 도움말 버튼
        {
          type: "button",
          text: t('navigation:help'),
          href: "/help",
          external: false
        },
        
        // 인증 관련 메뉴
        isAuthenticated ? {
          type: "menu-dropdown",
          text: user?.name || t('navigation:account'),
          description: user?.email || "",
          iconName: "user-profile",
          items: [
            { id: "profile", text: t('navigation:profile') },
            { id: "preferences", text: t('navigation:preferences') },
            { id: "security", text: t('navigation:security') },
            { id: "signout", text: t('navigation:sign_out') }
          ],
          onItemClick: ({ detail }) => {
            if (detail.id === "signout") {
              logout();
              navigate("/login");
            } else {
              navigate(`/\${detail.id}`);
            }
          }
        } : {
          type: "button",
          text: t('navigation:sign_in'),
          onClick: () => navigate("/login")
        }
      ]}
    />
  );
};

export default TopNavigationHeader;