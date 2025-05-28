import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleChangePassword = () => {
    navigate('/change-password');
  };
 const handleLogout = () => {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("user");
  navigate("/login");
};
  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-1 ml-64 p-10">
        <h2 className="text-3xl font-bold text-gray-700 mb-6">
          Home Page Uploading soon...
        </h2>
        <div className="space-x-4">
          <button
            onClick={handleChangePassword}
            className="px-6 py-3 bg-cyan-600 text-white rounded-lg shadow hover:bg-cyan-700 transition"
          >
            Change Password
          </button>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;