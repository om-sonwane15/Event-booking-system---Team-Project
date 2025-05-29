import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import axiosInstance from "../utils/axiosInstance";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineCheck,
} from "react-icons/ai";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const response = await axiosInstance.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      const storage = formData.rememberMe ? localStorage : sessionStorage;
      storage.setItem("user", JSON.stringify(response.data));
      storage.setItem("token", response.data.token);

      axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;

      navigate("/home");
    } catch (error) {
      setErrorMsg(
        error.response?.data?.msg || "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4 sm:px-6"
      style={{ backgroundImage: `url('/mountains.jpg')` }}
    >
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-5xl flex flex-col md:flex-row">
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-10 lg:p-12">
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Login</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  EMAIL
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-[#007595] outline-none bg-transparent text-gray-700 placeholder-gray-400"
                    placeholder="Enter your email"
                  />
                  {formData.email && (
                    <AiOutlineCheck className="absolute right-3 top-3 text-[#007595] text-xl" />
                  )}
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  PASSWORD
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-[#007595] outline-none bg-transparent text-gray-700 placeholder-gray-400"
                    placeholder="••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <AiOutlineEyeInvisible className="text-xl" />
                    ) : (
                      <AiOutlineEye className="text-xl" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-3 cursor-pointer text-sm text-gray-600">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-[#007595] border-gray-300 rounded"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot")}
                  className="text-sm text-gray-600 hover:text-[#007595] underline"
                >
                  Forgot Password
                </button>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="text-sm text-red-500">{errorMsg}</div>
              )}

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#007595] hover:bg-[#005d78] disabled:bg-opacity-50 text-white font-semibold py-3 px-6 rounded-full transition duration-200 shadow-lg"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="flex-1 border-2 border-[#007595] text-[#007595] hover:bg-[#e0f5f9] font-semibold py-3 px-6 rounded-full transition duration-200"
                >
                  Sign Up
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="hidden md:block md:w-1/2">
          <div
            className="h-full bg-cover bg-center rounded-b-3xl md:rounded-r-3xl md:rounded-bl-none"
            style={{ backgroundImage: `url('../login-vector.jpg')` }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
