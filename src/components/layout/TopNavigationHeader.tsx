// src/components/layout/TopNavigationHeader.tsx
import React from 'react';
import { TopNavigation } from '@cloudscape-design/components';
import { useAuth } from '@hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useAppTranslation } from '@/hooks/useAppTranslation';

const TopNavigationHeader: React.FC = () => {
  const { t, i18n } = useAppTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const currentLanguageText = i18n.language === 'ko' 
    ? t('language_korean') 
    : t('language_english');

  return (
    <TopNavigation
      identity={{
        href: "/",
        title: t('app_title'),
        logo: {
          src: "/assets/aws.png",
          alt: t('app_logo_alt')
        }
      }}
      utilities={[
        {
          type: "menu-dropdown",
          text: currentLanguageText,
          iconName: "globe",
          title: t('language_label'),
          items: [
            { 
              id: "ko", 
              text: t('language_korean'),
              checked: i18n.language === 'ko'
            },
            { 
              id: "en", 
              text: t('language_english'),
              checked: i18n.language === 'en'
            }
          ],
          onItemClick: ({ detail }) => {
            i18n.changeLanguage(detail.id);
          }
        },
        {
          type: "button",
          text: t('help'),
          href: "/help",
          external: false
        },
        isAuthenticated ? {
          type: "menu-dropdown",
          text: user?.name || t('account'),
          description: user?.email || "",
          iconName: "user-profile",
          items: [
            { id: "profile", text: t('profile') },
            { id: "preferences", text: t('preferences') },
            { id: "security", text: t('security') },
            { id: "signout", text: t('sign_out') }
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
          text: t('sign_in'),
          onClick: () => navigate("/login")
        }
      ]}
    />
  );
};

export default TopNavigationHeader;