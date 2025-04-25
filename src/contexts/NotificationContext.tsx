// app/contexts/NotificationContext.tsx
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Flashbar, FlashbarProps } from '@cloudscape-design/components';
import { v4 as uuidv4 } from 'uuid'; // uuid 패키지 설치 필요: npm install uuid @types/uuid

// 알림 인터페이스 정의
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  content: string;
  header?: string;
  dismissible: boolean;
  dismissed?: boolean;
  autoDismiss?: boolean;
  dismissTimeout?: number;
  onDismiss?: () => void;
}

// Context에서 제공할 값의 인터페이스
interface NotificationContextValue {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  dismissNotification: (id: string) => void;
  dismissAllNotifications: () => void;
}

// Context 생성
const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

// Context Hook
export const useNotification = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Provider 컴포넌트
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // 알림 추가
  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = uuidv4();
    const newNotification = { ...notification, id };

    setNotifications(prev => [...prev, newNotification]);

    // 자동 제거 설정된 알림 처리
    if (notification.autoDismiss !== false) {
      const timeout = notification.dismissTimeout || 5000; // 기본 5초
      setTimeout(() => {
        dismissNotification(id);
      }, timeout);
    }

    return id;
  }, []);

  // 알림 제거
  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      
      // onDismiss 콜백 실행 (있는 경우)
      if (notification?.onDismiss) {
        notification.onDismiss();
      }
      
      return prev.filter(notification => notification.id !== id);
    });
  }, []);

  // 모든 알림 제거
  const dismissAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        dismissNotification,
        dismissAllNotifications
      }}
    >
      {children}
      <NotificationDisplay />
    </NotificationContext.Provider>
  );
};

// 알림 표시 컴포넌트
const NotificationDisplay: React.FC = () => {
  const { notifications, dismissNotification } = useNotification();

  // CloudScape Flashbar 아이템으로 변환
  const flashbarItems: FlashbarProps.MessageDefinition[] = notifications.map(
    notification => ({
      id: notification.id,
      type: notification.type,
      content: notification.content,
      header: notification.header,
      dismissible: notification.dismissible,
      onDismiss: () => dismissNotification(notification.id)
    })
  );

  // 알림이 없으면 아무것도 렌더링하지 않음
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: '60px', 
      right: '20px', 
      width: '400px', 
      zIndex: 1000 
    }}>
      <Flashbar items={flashbarItems} />
    </div>
  );
};

// 알림 유틸리티 함수를 사용하기 쉽게 제공
export const notifySuccess = (content: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'content'>>) => {
  const { addNotification } = useNotification();
  return addNotification({
    type: 'success',
    content,
    dismissible: true,
    header: '성공',
    autoDismiss: true,
    ...options
  });
};

export const notifyError = (content: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'content'>>) => {
  const { addNotification } = useNotification();
  return addNotification({
    type: 'error',
    content,
    dismissible: true,
    header: '오류',
    autoDismiss: false, // 오류는 자동 제거하지 않음
    ...options
  });
};

export const notifyWarning = (content: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'content'>>) => {
  const { addNotification } = useNotification();
  return addNotification({
    type: 'warning',
    content,
    dismissible: true,
    header: '주의',
    autoDismiss: true,
    ...options
  });
};

export const notifyInfo = (content: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'content'>>) => {
  const { addNotification } = useNotification();
  return addNotification({
    type: 'info',
    content,
    dismissible: true,
    header: '정보',
    autoDismiss: true,
    ...options
  });
};

export default NotificationContext;