// src/pages/errors/NotFoundPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">페이지를 찾을 수 없습니다</h2>
        <p className="text-gray-600 mb-6">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <Link
          to="/"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;