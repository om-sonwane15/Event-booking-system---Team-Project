import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import axiosInstance from "../utils/axiosInstance";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      setIsLoading(false);
      return;
    }

    try{
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while changing the password.");
    } finally {
      setIsLoading(false);
    }
  };
  const renderPasswordField = (label, value, setValue, show, setShow, id, placeholder) => (
    <div className="mb-4">
      <label htmlFor={id} className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <FaLock />
        </div>
        <input  type={show ? "text" : "password"} id={id}
          className="w-full p-3 pl-10 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white text-sm"
          value={value}onChange={(e) => setValue(e.target.value)} placeholder={placeholder}required/>
        <button type="button" onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
          {show ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
    </div>
  );
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center p-4 sm:p-6"
      style={{ backgroundImage: "url('/pic1.avif')" }}>
      <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-5xl flex flex-col lg:flex-row overflow-hidden">
        <div className="w-full lg:w-1/2 p-6 sm:p-8 md:p-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 text-center">Change Password</h2>
          <p className="text-center text-sm text-gray-500 mb-6">Secure your account with a new password</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {renderPasswordField("Current Password", oldPassword, setOldPassword, showOld, setShowOld, "oldPassword", "Enter your current password")}
            {renderPasswordField("New Password", newPassword, setNewPassword, showNew, setShowNew, "newPassword", "Enter new password")}
            {renderPasswordField("Confirm Password", confirmPassword, setConfirmPassword, showConfirm, setShowConfirm, "confirmPassword", "Confirm new password")}
            <button type="submit" disabled={isLoading}
              className={`w-full py-3 rounded-full text-white font-semibold text-sm sm:text-base transition-all duration-200 ${
                isLoading ? "bg-cyan-400 cursor-not-allowed" : "bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800"
              }`} >
              {isLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
        <div className="hidden lg:block w-full lg:w-1/2">
          <img src="/cp.jpg" alt="Scenic Background"className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
};
export default ChangePassword;