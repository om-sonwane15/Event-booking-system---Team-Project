import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResetPassword = () => {
  const { token } = useParams();
  const [tokenValid, setTokenValid] = useState(true);
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or expired reset link");
      setTokenValid(false);
      setTimeout(() => navigate("/"), 3000);
    }
  }, [token, navigate]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in both password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      toast.error(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
      );
      return;
    }
    setIsLoading(true);
    try {
      const res = await axiosInstance.post("/auth/reset-password", {
        token,
        newPassword,
      });

      toast.success(res.data.msg || "Password reset successful!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "";
      if (
        errorMsg.toLowerCase().includes("token expired") ||
        errorMsg.toLowerCase().includes("invalid token")
      ) {
        toast.error("Reset link expired or invalid. Please request a new one.");
        setTimeout(() => navigate("/forgot-password"), 4000);
      } else {
        toast.error(errorMsg || "Failed to reset password");
      }
    } finally {
      setIsLoading(false);
    }
  };
  const renderPasswordField = (
    label,
    value,
    setValue,
    show,
    setShow,
    id,
    placeholder
  ) => (
    <div className="mb-4">
      <label htmlFor={id} className="block text-gray-700 font-medium mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <FaLock />
        </div>
        <input
          type={show ? "text" : "password"}
          id={id}
          className="w-full p-3 pl-10 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white text-sm"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          required
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {show ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
    </div>
  );
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: "url('/pic1.avif')" }}
    >
      <div className="bg-white bg-opacity-80 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden w-full max-w-5xl flex flex-col md:flex-row">
        <div className="mt-6 w-full md:w-1/2 p-8 sm:p-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-1 text-left">
            Reset Password
          </h2>
          <p className="text-left text-sm text-gray-500 mb-6">
            Set a new password for your account
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {renderPasswordField(
              "New Password",
              newPassword,
              setNewPassword,
              showNew,
              setShowNew,
              "newPassword",
              "Enter new password"
            )}
            {renderPasswordField(
              "Confirm Password",
              confirmPassword,
              setConfirmPassword,
              showConfirm,
              setShowConfirm,
              "confirmPassword",
              "Confirm new password"
            )}
            <button
              type="submit"
              disabled={isLoading || !tokenValid}
              className={`w-full py-3 rounded-full text-white cursor-pointer font-semibold transition-all duration-200 ${
                isLoading || !tokenValid
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800"
              }`}
            >
              {isLoading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        </div>
        <div className="hidden md:block w-full md:w-1/2 relative">
          <img
            src="/rp.jpg"
            alt="Reset Background"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} limit={3} />
    </div>
  );
};
export default ResetPassword;
