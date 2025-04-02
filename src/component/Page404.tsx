import React from 'react';
import { useNavigate } from 'react-router-dom';

const Page404: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    navigate('/become/seller');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-200">
      <div className="text-center p-10 bg-white rounded-xl shadow-lg max-w-md w-full mx-4 border border-gray-100">
        <div className="mb-6">
          <h1 className="text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-600 mb-2">404</h1>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Trang không tồn tại</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-red-500 to-purple-600 mx-auto mb-6"></div>
        </div>
        <p className="text-gray-600 mb-8 text-lg">Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
        <div className="flex flex-col items-center">
          <button
            onClick={handleBackToLogin}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full hover:from-blue-600 hover:to-blue-800 transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1"
          >
            Quay lại trang đăng nhập
          </button>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-blue-600 hover:text-blue-800 transition-colors duration-300 font-medium"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page404;
