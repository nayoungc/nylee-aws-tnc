// // src/services/cognitoService.ts
// export interface CognitoUser {
//     Username: string;
//     Attributes: {
//       Name: string;
//       Value: string;
//     }[];
//   }
  
//   export const listCognitoUsers = async (): Promise<CognitoUser[]> => {
//     try {
//       // 실제 환경에서는 AppSync 또는 백엔드 API를 호출
//       // 개발 환경에서는 더미 데이터 반환
//       return [
//         {
//           Username: 'user1',
//           Attributes: [
//             { Name: 'email', Value: 'instructor1@example.com' },
//             { Name: 'name', Value: '김강사' }
//           ]
//         },
//         {
//           Username: 'user2',
//           Attributes: [
//             { Name: 'email', Value: 'instructor2@example.com' },
//             { Name: 'name', Value: '이강사' }
//           ]
//         },
//         {
//           Username: 'user3',
//           Attributes: [
//             { Name: 'email', Value: 'instructor3@example.com' },
//             { Name: 'name', Value: '박강사' }
//           ]
//         }
//       ];
//     } catch (error) {
//       console.error('Error fetching Cognito users:', error);
//       return [];
//     }
//   };

export interface CognitoUser {
    Username: string;
    Attributes: {
      Name: string;
      Value: string;
    }[];
  }
  
  export const listCognitoUsers = async (): Promise<CognitoUser[]> => {
    // 실제 API 구현 전까지 더미 데이터 사용
    return [
      {
        Username: 'user1',
        Attributes: [
          { Name: 'email', Value: 'instructor1@example.com' },
          { Name: 'name', Value: '김강사' }
        ]
      },
      {
        Username: 'user2',
        Attributes: [
          { Name: 'email', Value: 'instructor2@example.com' },
          { Name: 'name', Value: '이강사' }
        ]
      },
      {
        Username: 'user3',
        Attributes: [
          { Name: 'email', Value: 'instructor3@example.com' },
          { Name: 'name', Value: '박강사' }
        ]
      }
    ];
  };