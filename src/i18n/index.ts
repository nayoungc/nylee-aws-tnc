// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 언어 파일
const resources = {
  en: {
    translation: {
      header: {
        title: 'AWS T&C Education',
        logo: {
          alt: 'AWS T&C Logo'
        },
        search: {
          ariaLabel: 'Search',
          dismissAriaLabel: 'Dismiss search'
        },
        overflow: {
          triggerText: 'More',
          titleText: 'All',
          backAriaLabel: 'Back',
          dismissAriaLabel: 'Dismiss menu'
        },
        theme: {
          label: 'Change theme',
          enableDark: 'Dark mode',
          enableLight: 'Light mode'
        },
        language: {
          label: 'Change language'
        },
        user: {
          login: 'Log in',
          account: 'Account',
          profile: 'Profile',
          settings: 'Settings',
          signOut: 'Sign out'
        }
      },
      nav: {
        header: 'Navigation',
        home: 'Home',
        courses: {
          title: 'Courses',
          catalog: 'Course catalog',
          myLearning: 'My learning'
        },
        quizzes: 'Quizzes',
        surveys: 'Surveys'
      }
    }
  },
  ko: {
    translation: {
      header: {
        title: 'AWS T&C 교육',
        logo: {
          alt: 'AWS T&C 로고'
        },
        search: {
          ariaLabel: '검색',
          dismissAriaLabel: '검색 닫기'
        },
        overflow: {
          triggerText: '더 보기',
          titleText: '전체',
          backAriaLabel: '뒤로',
          dismissAriaLabel: '메뉴 닫기'
        },
        theme: {
          label: '테마 변경',
          enableDark: '다크 모드',
          enableLight: '라이트 모드'
        },
        language: {
          label: '언어 변경'
        },
        user: {
          login: '로그인',
          account: '계정',
          profile: '프로필',
          settings: '설정',
          signOut: '로그아웃'
        }
      },
      nav: {
        header: '탐색',
        home: '홈',
        courses: {
          title: '교육 과정',
          catalog: '과정 카탈로그',
          myLearning: '내 학습'
        },
        quizzes: '퀴즈',
        surveys: '설문조사'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;