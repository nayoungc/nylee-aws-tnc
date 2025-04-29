// src/components/layout/TopNavigationHeader.tsx
import React, { useState } from 'react';
import { TopNavigation, Modal, Button, SpaceBetween } from '@cloudscape-design/components';
import { useAuth } from '@hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useAppTranslation } from '@/hooks/useAppTranslation';

const TopNavigationHeader: React.FC = () => {
  const { t, i18n } = useAppTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  
  // 로그아웃 모달 상태 관리
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const currentLanguageText = i18n.language === 'ko' 
    ? t('language_korean') 
    : t('language_english');
    
  // 로그아웃 처리 함수
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // 로그아웃 전 현재 상태 로깅 (디버깅용)
      console.log('로그아웃 시작', { isAuthenticated, user });
      
      // 로그아웃 실행
      const result = await logout();
      
      console.log('로그아웃 결과:', result);
      
      // 결과에 상관없이 로그인 페이지로 이동
      // 가끔 로그아웃에 실패해도 세션이 이미 무효화된 경우가 있음
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
      // 오류가 발생해도 로그인 페이지로 이동
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  return (
    <>
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
          // 언어 선택 드롭다운
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
          
          // 도움말 버튼
          {
            type: "button",
            text: t('help'),
            href: "/help",
            external: false
          },
          
          // 로그인/사용자 메뉴 (조건부 렌더링)
          isAuthenticated ? {
            type: "menu-dropdown",
            text: user?.attributes?.name || user?.username || t('account'),
            description: user?.attributes?.email || "",
            iconName: "user-profile",
            items: [
              { id: "profile", text: t('profile') },
              { id: "preferences", text: t('preferences') },
              { id: "security", text: t('security') },
              { 
                id: "signout", 
                text: t('sign_out'),
                // 강조 표시 (옵션)
                // variant: "primary"
              }
            ],
            onItemClick: ({ detail }) => {
              if (detail.id === "signout") {
                // 로그아웃 모달 표시
                setShowLogoutModal(true);
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
        i18nStrings={{
          searchIconAriaLabel: t('search'),
          searchDismissIconAriaLabel: t('close_search'),
          overflowMenuTriggerText: t('more'),
          overflowMenuTitleText: t('all'),
          overflowMenuBackIconAriaLabel: t('back'),
          overflowMenuDismissIconAriaLabel: t('close')
        }}
      />

      {/* 로그아웃 확인 모달 */}
      <Modal
        visible={showLogoutModal}
        onDismiss={() => !isLoggingOut && setShowLogoutModal(false)}
        header={t('logout_title')}
        closeAriaLabel={t('close')}
        footer={
          <SpaceBetween direction="horizontal" size="xs">
            <Button
              variant="link"
              onClick={() => setShowLogoutModal(false)}
              disabled={isLoggingOut}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={handleLogout}
              loading={isLoggingOut}
            >
              {t('confirm_logout')}
            </Button>
          </SpaceBetween>
        }
      >
        {t('logout_confirm_message')}
      </Modal>
    </>
  );
};

export default TopNavigationHeader;