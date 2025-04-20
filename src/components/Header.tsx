import { useState, useEffect } from 'react';
import { fetchUserAttributes, signOut, getCurrentUser, UserAttributeKey } from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';
import { useTypedTranslation } from '@utils/i18n-utils';
import {
  TopNavigation,
  Button,
  SpaceBetween
} from '@cloudscape-design/components';

// UserAttributes interface
interface UserAttributes extends Partial<Record<UserAttributeKey, string>> { }

const Header = () => {
  const navigate = useNavigate();
  const { t, tString, i18n } = useTypedTranslation();
  const [username, setUsername] = useState<string>('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userAttributes, setUserAttributes] = useState<UserAttributes | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Load user attributes with caching
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
        // Ignore cache parsing errors
      }
    }

    async function loadUserAttributes() {
      try {
        setLoading(true);
        const attributes = await fetchUserAttributes();
        setUserAttributes(attributes as UserAttributes);
        setUserRole(attributes.profile || null);
        sessionStorage.setItem('userAttributes', JSON.stringify(attributes));
        setLoading(false);
      } catch (error) {
        console.error('Error loading user attributes:', error);
        setError(error instanceof Error ? error : new Error(String(error)));
        setLoading(false);
      }
    }

    loadUserAttributes();
  }, []);

  // Load user info
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
        console.error('Error loading user info:', error);
        setUsername('User');
      }
    }

    loadUserInfo();
  }, []);

  const handleSignOut = async () => {
    try {
      // Clear cache
      sessionStorage.removeItem('userAttributes');
      sessionStorage.removeItem('username');

      await signOut();
      navigate('/signin');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Language change handler
  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  // User role display text
  const getRoleDisplay = () => {
    if (!userRole) return '';

    switch (userRole) {
      case 'admin': return t('role.admin') || 'Administrator';
      case 'instructor': return t('role.instructor') || 'Instructor';
      default: return t('role.student') || 'Student';
    }
  };

  return (
    <TopNavigation
      identity={{
        href: '/',
        title: tString('app.title'),
        logo: {
          src: '/images/aws.png',
          alt: tString('app.title')
        }
      }}
      utilities={[
        // More visible language selector
        {
          type: 'button',
          text: i18n.language === 'ko' ? '🇰🇷 한국어' : '🇺🇸 English',
          onClick: () => changeLanguage(i18n.language === 'ko' ? 'en' : 'ko')
        },

        // Prominent user info section
        // Use badge styling in the menu items instead
        {
          type: 'menu-dropdown',
          text: username,
          iconName: 'user-profile',
          items: [
            // Show role as first item in the dropdown
            {
              id: 'role-display',
              text: getRoleDisplay(),
              disabled: true,
              disabledReason: 'User role information',
            },
            { id: 'divider-1', text: '-' },
            ...(userRole === 'admin' ? [{ id: 'admin', text: t('nav.admin') || 'Administration' }] : []),
            { id: 'profile', text: t('nav.profile') || 'My Profile' },
            { id: 'settings', text: t('nav.settings') || 'Settings' },
            { id: 'divider-2', text: '-' },
            { id: 'signout', text: String(t('auth.sign_out')) }
          ],
          onItemClick: ({ detail }) => {
            if (detail.id === 'signout') handleSignOut();
            if (detail.id === 'admin') navigate('/admin');
            if (detail.id === 'profile') navigate('/profile');
            if (detail.id === 'settings') navigate('/settings');
          }
        },

        // Sign out button for quick access
        {
          type: 'button',
          variant: 'link',
          ariaLabel: tString('auth.sign_out'),
          onClick: handleSignOut
        }
      ]}
    />
  );
};

export default Header;