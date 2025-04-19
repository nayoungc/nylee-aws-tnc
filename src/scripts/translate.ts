// src/scripts/translate.ts
import AWS from 'aws-sdk';
import fs from 'fs-extra';
import path from 'path';

// AWS 설정
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
});

// Translate 서비스 인스턴스 생성
const translate = new AWS.Translate();

// 설정
const sourceLanguage = 'en';
const targetLanguages = ['ko']; // 필요한 다른 언어 추가 가능
const localesDir = path.join(process.cwd(), 'public/locales');

// 객체의 모든 문자열 값을 번역하는 재귀 함수
async function translateObject(
  obj: Record<string, any>,
  targetLang: string
): Promise<Record<string, any>> {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      // 중첩된 객체 재귀적으로 번역
      result[key] = await translateObject(value, targetLang);
    } else if (typeof value === 'string' && value.trim().length > 0) {
      // 비어있지 않은 문자열만 번역
      try {
        const params = {
          Text: value,
          SourceLanguageCode: sourceLanguage,
          TargetLanguageCode: targetLang
        };
        
        const data = await translate.translateText(params).promise();
        result[key] = data.TranslatedText;
        
        // API 속도 제한 방지를 위한 지연
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log(`번역: "\${value}" -> "\${data.TranslatedText}"`);
      } catch (error) {
        console.error(`"\${value}" 번역 중 오류:`, error);
        result[key] = value; // 오류 시 원본 유지
      }
    } else {
      // 문자열이 아닌 값은 그대로 유지
      result[key] = value;
    }
  }
  
  return result;
}

// 메인 함수
async function main(): Promise<void> {
  try {
    console.log('번역 시작...');

    // 소스 언어 파일 경로
    const sourcePath = path.join(localesDir, sourceLanguage, 'translation.json');
    
    // 소스 파일 존재 확인
    if (!await fs.pathExists(sourcePath)) {
      console.error(`소스 파일이 없습니다: \${sourcePath}`);
      console.log('먼저 "npm run extract" 명령어로 번역 키를 추출해주세요.');
      process.exit(1);
    }
    
    // 소스 파일 읽기
    const sourceData = await fs.readJson(sourcePath);
    console.log(`소스 파일 로드 완료: \${sourcePath}`);
    
    // 각 타겟 언어에 대해 처리
    for (const targetLang of targetLanguages) {
      console.log(`\n\${targetLang} 언어 번역 시작...`);
      
      // 타겟 언어 디렉토리 및 파일 경로
      const targetDir = path.join(localesDir, targetLang);
      const targetPath = path.join(targetDir, 'translation.json');
      
      // 기존 번역 파일 확인
      let existingTranslations: Record<string, any> = {};
      let newKeysCount = 0;
      
      if (await fs.pathExists(targetPath)) {
        existingTranslations = await fs.readJson(targetPath);
        console.log(`기존 \${targetLang} 번역 파일을 로드했습니다.`);
      } else {
        console.log(`\${targetLang}에 대한 기존 번역 파일이 없습니다. 새로 생성합니다.`);
        await fs.ensureDir(targetDir);
      }
      
      // 새로운 키만 추출
      const newTranslationKeys: Record<string, any> = {};
      
      function findNewKeys(sourceObj: Record<string, any>, targetObj: Record<string, any>, currentPath: string = ''): void {
        for (const [key, value] of Object.entries(sourceObj)) {
          const newPath = currentPath ? `\${currentPath}.\${key}` : key;
          
          if (typeof value === 'object' && value !== null) {
            // 중첩 객체 처리
            if (!targetObj[key] || typeof targetObj[key] !== 'object') {
              // 타겟에 해당 키가 없거나 객체가 아니면 전체 추가
              newTranslationKeys[key] = value;
              newKeysCount++;
            } else {
              // 재귀적으로 내부 키 검사
              findNewKeys(value, targetObj[key], newPath);
            }
          } else if (!(key in targetObj)) {
            // 단순 값이고 타겟에 키가 없는 경우
            newTranslationKeys[key] = value;
            newKeysCount++;
          }
        }
      }
      
      findNewKeys(sourceData, existingTranslations);
      
      // 새로운 키가 있으면 번역 수행
      if (newKeysCount > 0) {
        console.log(`\${newKeysCount}개의 새로운 키를 번역합니다...`);
        const translatedNewKeys = await translateObject(newTranslationKeys, targetLang);
        
        // 깊은 병합 함수
        function deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
          const output = { ...target };
          
          for (const [key, value] of Object.entries(source)) {
            if (typeof value === 'object' && value !== null && key in target && typeof target[key] === 'object') {
              output[key] = deepMerge(target[key], value);
            } else {
              output[key] = value;
            }
          }
          
          return output;
        }
        
        // 기존 번역과 새 번역 병합
        const mergedTranslations = deepMerge(existingTranslations, translatedNewKeys);
        
        // 결과 저장
        await fs.writeJson(targetPath, mergedTranslations, { spaces: 2 });
        console.log(`\${targetLang} 번역 완료. 저장 위치: \${targetPath}`);
      } else {
        console.log(`\${targetLang}에 번역이 필요한 새 키가 없습니다.`);
      }
    }
    
    console.log('\n모든 번역 작업이 완료되었습니다! 📚✨');
  } catch (error) {
    console.error('번역 과정에서 오류가 발생했습니다:', error);
    process.exit(1);
  }
}

// 스크립트 실행
main().catch(err => {
  console.error('치명적인 오류:', err);
  process.exit(1);
});
