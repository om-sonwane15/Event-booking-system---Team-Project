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
      const response = await axiosInstance.post("/auth/login",
        {
          email: formData.email,
          password: formData.password,
        }
      );

      // Store user data based on remember me preference
      if (formData.rememberMe) {
        localStorage.setItem("user", JSON.stringify(response.data));
        localStorage.setItem("token", response.data.token);
      } else {
        sessionStorage.setItem("user", JSON.stringify(response.data));
        sessionStorage.setItem("token", response.data.token);
      }

      // Set default authorization header for future requests
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;

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
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('/spotlight.jpg')`,
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full mx-4 flex">
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Login</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
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
                    className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-cyan-400 outline-none bg-transparent text-gray-700 placeholder-gray-400"
                    placeholder="Enter your email"
                  />
                  {formData.email && (
                    <AiOutlineCheck className="absolute right-3 top-3 text-cyan-400 text-xl" />
                  )}
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
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
                    className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-cyan-400 outline-none bg-transparent text-gray-700 placeholder-gray-400"
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
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded border-2 ${
                        formData.rememberMe
                          ? "bg-cyan-400 border-cyan-400"
                          : "border-gray-300"
                      } flex items-center justify-center`}
                    >
                      {formData.rememberMe && (
                        <AiOutlineCheck className="text-white text-sm" />
                      )}
                    </div>
                  </div>
                  <span className="ml-3 text-sm text-gray-600">
                    Remember me
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => navigate("/forgot")}
                  className="text-sm text-gray-600 hover:text-cyan-400 underline"
                >
                  Forgot Password
                </button>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="text-sm text-red-500">{errorMsg}</div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-cyan-400 hover:bg-cyan-500 disabled:bg-cyan-300 text-white font-semibold py-3 px-6 rounded-full transition duration-200 shadow-lg hover:shadow-xl"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="flex-1 border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-50 font-semibold py-3 px-6 rounded-full transition duration-200"
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
            className="h-full bg-cover bg-center rounded-r-3xl"
            style={{
              backgroundImage: `url('../public/downloaded-image.jpg')`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
