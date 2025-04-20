export interface Instructor {
  id?: string;
  name: string;
  email: string;
  status?: string;
  profile?: string;
  // 아래 필드 추가
  cognitoId?: string;
  createdAt?: string;
  updatedAt?: string;
}