// src/contexts/NotificationContext.tsx
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Flashbar, FlashbarProps } from '@cloudscape-design/components';

// 알림 항목 타입
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  content: React.ReactNode;
  dismissible?: boolean;
  dismissLabel?: string;
  onDismiss?: () => void;
  loading?: boolean;
  buttonText?: string;
  onButtonClick?: () => void;
  autoDismiss?: boolean;
  autoDismissTimeout?: number;
}

// NotificationContext 타입 정의
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  // 유형별 헬퍼 함수
  success: (content: React.ReactNode, options?: Partial<Omit<Notification, 'id' | 'type' | 'content'>>) => string;
  error: (content: React.ReactNode, options?: Partial<Omit<Notification, 'id' | 'type' | 'content'>>) => string;
  warning: (content: React.ReactNode, options?: Partial<Omit<Notification, 'id' | 'type' | 'content'>>) => string;
  info: (content: React.ReactNode, options?: Partial<Omit<Notification, 'id' | 'type' | 'content'>>) => string;
}

// Context 생성
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider 컴포넌트
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // 고유 ID 생성
  const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // 알림 추가
  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = generateUniqueId();
    const newNotification: Notification = {
      ...notification,
      id,
      dismissible: notification.dismissible !== false,
    };

    setNotifications(prevNotifications => [...prevNotifications, newNotification]);

    // 자동 제거 설정
    if (notification.autoDismiss !== false) {
      const timeout = notification.autoDismissTimeout || 5000; // 기본 5초
      setTimeout(() => {
        removeNotification(id);
      }, timeout);
    }

    return id;
  }, []);

  // 알림 제거
  const removeNotification = useCallback((id: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== id)
    );
  }, []);

  // 모든 알림 제거
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // 유형별 헬퍼 함수
  const success = useCallback((content: React.ReactNode, options?: Partial<Omit<Notification, 'id' | 'type' | 'content'>>) => {
    return addNotification({ type: 'success', content, ...options });
  }, [addNotification]);

  const error = useCallback((content: React.ReactNode, options?: Partial<Omit<Notification, 'id' | 'type' | 'content'>>) => {
    return addNotification({ type: 'error', content, autoDismiss: false, ...options });
  }, [addNotification]);

  const warning = useCallback((content: React.ReactNode, options?: Partial<Omit<Notification, 'id' | 'type' | 'content'>>) => {
    return addNotification({ type: 'warning', content, ...options });
  }, [addNotification]);

  const info = useCallback((content: React.ReactNode, options?: Partial<Omit<Notification, 'id' | 'type' | 'content'>>) => {
    return addNotification({ type: 'info', content, ...options });
  }, [addNotification]);

  // Flashbar 항목으로 변환
  const flashbarItems: FlashbarProps.MessageDefinition[] = notifications.map(notification => ({
    id: notification.id,
    type: notification.type,
    content: notification.content,
    dismissible: notification.dismissible,
    dismissLabel: notification.dismissLabel || '닫기',
    onDismiss: () => {
      if (notification.onDismiss) {
        notification.onDismiss();
      }
      removeNotification(notification.id);
    },
    loading: notification.loading,
    buttonText: notification.buttonText,
    onButtonClick: notification.onButtonClick
  }));

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
        success,
        error,
        warning,
        info
      }}
    >
      {notifications.length > 0 && (
        <div style={{ position: 'fixed', top: '50px', left: '0', right: '0', zIndex: 1000, padding: '0 20px' }}>
          <Flashbar items={flashbarItems} />
        </div>
      )}
      {children}
    </NotificationContext.Provider>
  );
};