import { useState, useEffect } from 'react';
import { fetchUserAttributes, signOut, getCurrentUser, UserAttributeKey } from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';
import { useTypedTranslation } from '../utils/i18n-utils';
import { TopNavigation } from '@cloudscape-design/components';

// UserAttributes 인터페이스를 AWS Amplify의 타입과 호환되게 정의
interface UserAttributes extends Partial<Record<UserAttributeKey, string>> {}

const Header = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTypedTranslation();
  const [username, setUsername] = useState<string>('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userAttributes, setUserAttributes] = useState<UserAttributes | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // 사용자 속성 로드 - 캐시 사용
  useEffect(() => {
    const cachedData = sessionStorage.getItem('userAttributes');
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        setUserAttributes(parsedData);
        setUserRole(parsedData.profile || null);
        setLoading(false);
        return;
      } catch (e) {
        // 캐시 데이터 파싱 오류는 무시하고 계속 진행
      }
    }

    async function loadUserAttributes() {
      try {
        setLoading(true);
        const attributes = await fetchUserAttributes();
        // 타입 캐스팅 추가
        setUserAttributes(attributes as UserAttributes);
        setUserRole(attributes.profile || null);
        // 데이터 캐싱 (세션 동안 유효)
        sessionStorage.setItem('userAttributes', JSON.stringify(attributes));
        setLoading(false);
      } catch (error) {
        console.error('사용자 속성 로드 오류:', error);
        setError(error instanceof Error ? error : new Error(String(error)));
        setLoading(false);
      }
    }

    loadUserAttributes();
  }, []);

  // 사용자 정보 로드
  useEffect(() => {
    async function loadUserInfo() {
      try {
        const cachedUsername = sessionStorage.getItem('username');
        if (cachedUsername) {
          setUsername(cachedUsername);
          return;
        }

        const currentUser = await getCurrentUser();
        const attributes = await fetchUserAttributes();
        const email = attributes.email || currentUser.username;
        setUsername(email);
        sessionStorage.setItem('username', email);
      } catch (error) {
        console.error('사용자 정보 로드 오류:', error);
        setUsername('User');
      }
    }
    
    loadUserInfo();
  }, []);

  const handleSignOut = async () => {
    try {
      // 캐시 데이터 삭제
      sessionStorage.removeItem('userAttributes');
      sessionStorage.removeItem('username');
      
      await signOut();
      navigate('/signin');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  // 언어 변경 핸들러
  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  return (
    <TopNavigation
      identity={{
        href: '/',
        title: String(t('app.title')),
        logo: {
          src: '/images/aws.png', 
          alt: String(t('app.title'))
        }
      }}
      utilities={[
        {
          type: 'menu-dropdown',
          text: i18n.language === 'ko' ? '한국어' : 'English',
          iconName: 'settings',
          items: [
            { id: 'en', text: 'English' },
            { id: 'ko', text: '한국어' }
          ],
          onItemClick: ({ detail }) => changeLanguage(detail.id)
        },
        {
          type: 'menu-dropdown',
          text: username,
          iconName: 'user-profile',
          items: [
            ...(userRole === 'admin' ? [{ id: 'admin', text: t('nav.admin') || 'Administration' }] : []),
            { id: 'signout', text: String(t('auth.sign_out')) }
          ],
          onItemClick: ({ detail }) => {
            if (detail.id === 'signout') handleSignOut();
            if (detail.id === 'admin') navigate('/admin');
          }
        }
      ]}
    />
  );
};

export default Header;