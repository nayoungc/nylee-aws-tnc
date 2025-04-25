// src/services/storage-service.ts
import { uploadData, getUrl, remove } from 'aws-amplify/storage';

// 파일 업로드
export async function uploadFile(key: string, file: File) {
  try {
    const result = await uploadData({
      key,
      data: file
    });
    return result;
  } catch (error) {
    console.error('파일 업로드 오류:', error);
    throw error;
  }
}

// 파일 URL 가져오기
export async function getFileUrl(key: string) {
  try {
    const { url } = await getUrl({ key });
    return url;
  } catch (error) {
    console.error('URL 가져오기 오류:', error);
    throw error;
  }
}