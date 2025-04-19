// src/components/ProtectedCourseRoute.tsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { generateClient, GraphQLQuery } from 'aws-amplify/api';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { checkCourseEnrollment } from '../graphql/queries';

const client = generateClient();

interface ProtectedCourseRouteProps {
  children: React.ReactNode;
  courseId: string;
}

const ProtectedCourseRoute: React.FC<ProtectedCourseRouteProps> = ({ children, courseId }) => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const userAttributes = await fetchUserAttributes();
        const userEmail = userAttributes.email;
        
        // 결과 타입 정의
        interface CheckEnrollmentResult {
          checkCourseEnrollment: {
            hasAccess: boolean;
            enrollmentStatus?: string;
            courseTitle?: string;
          }
        }
        
        // Gen 2 방식으로 구조 분해 할당 사용
        const { data } = await client.graphql<GraphQLQuery<CheckEnrollmentResult>>({
          query: checkCourseEnrollment,
          variables: { 
            courseId: courseId,
            email: userEmail 
          }
        });
        
        // data가 존재하는지 확인
        if (data?.checkCourseEnrollment) {
          setHasAccess(data.checkCourseEnrollment.hasAccess);
        } else {
          setHasAccess(false);
        }
      } catch (err) {
        console.error('Error checking course access:', err);
        setHasAccess(false);
      }
    };
    
    checkAccess();
  }, [courseId]);
  
  if (hasAccess === null) {
    return <div>Loading...</div>;
  }
  
  return hasAccess ? <>{children}</> : <Navigate to="/access-denied" />;
};