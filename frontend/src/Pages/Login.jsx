import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineCheck,
} from "react-icons/ai";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
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
      const response = await axios.post("/api/login", formData);

      // Simulate storing token or session
      if (formData.rememberMe) {
        localStorage.setItem("user", JSON.stringify(response.data));
      } else {
        sessionStorage.setItem("user", JSON.stringify(response.data));
      }

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      setErrorMsg("Invalid credentials. Please try again.");
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
              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  USERNAME
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-cyan-400 outline-none bg-transparent text-gray-700 placeholder-gray-400"
                    placeholder="Enter your username"
                  />
                  {formData.username && (
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

                <a
                  href="/forgot-password"
                  className="text-sm text-gray-600 hover:text-cyan-400 underline"
                >
                  Forgot Password
                </a>
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
                  className="flex-1 bg-cyan-400 hover:bg-cyan-500 text-white font-semibold py-3 px-6 rounded-full transition duration-200 shadow-lg hover:shadow-xl"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
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
              backgroundImage: `url('../public/downloaded-image.jpg`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
