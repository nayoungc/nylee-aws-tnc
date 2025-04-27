import React from 'react';
import ReactDOM from 'react-dom/client';

document.body.style.backgroundColor = 'pink';
console.log('React 초기화 시도 중');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <div style={{padding: '20px'}}>
    <h1>최소 테스트 앱</h1>
    <p>이 텍스트가 보이나요?</p>
  </div>
);

console.log('렌더링 완료');