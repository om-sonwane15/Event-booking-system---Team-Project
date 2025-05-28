import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import backgroundImg from "../assets/register.jpeg";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axiosInstance from "../utils/axiosInstance";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    role: "user",
    terms: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(password);
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const validate = () => {
    const errs = {};
    
    // Email validation
    if (!formData.email) {
      errs.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = "Email is invalid";
    }
    
    // Name validation
    if (!formData.name) {
      errs.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      errs.name = "Name must be at least 2 characters";
    }
    
    // Password validation
    if (!formData.password) {
      errs.password = "Password is required";
    } else if (!validatePassword(formData.password)) {
      errs.password =
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character.";
    }
    
    // Terms validation
    if (!formData.terms) {
      errs.terms = "You must accept terms and conditions";
    }
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setSubmitError("");

    if (!validate()) return;

    setLoading(true);

    try {
      const response = await axiosInstance.post("/auth/register",
        {
          name: formData.name.trim(),
          email: formData.email.toLowerCase(),
          password: formData.password,
          role: formData.role,
        }
      );

      setSuccessMsg(response.data.msg);
      setFormData({
        email: "",
        name: "",
        password: "",
        role: "user",
        terms: false,
      });

      // Redirect to login after successful registration
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      setSubmitError(
        error.response?.data?.msg || "An error occurred during registration."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed top-0 left-0 w-full h-full"
        style={{
          backgroundImage: `url(${backgroundImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(6px)",
          zIndex: -1,
        }}
      ></div>

      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="relative flex bg-white rounded-3xl shadow-lg overflow-hidden max-w-4xl w-full mx-auto z-10">
          <div className="w-full md:w-1/2 p-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Sign Up</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-black font-semibold mb-0.5">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full border-b-2 border-gray-300 focus:outline-none focus:border-blue-400 py-2 placeholder-gray-400 rounded-md"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="block text-black font-semibold mb-0.5">
                  FULL NAME
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full border-b-2 border-gray-300 focus:outline-none focus:border-blue-400 py-2 placeholder-gray-400 rounded-md"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Password */}
              <div className="relative">
                <label className="block text-black font-semibold mb-0.5">
                  PASSWORD
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full border-b-2 border-gray-300 focus:outline-none focus:border-blue-400 py-1.5 pr-10 placeholder-gray-400 rounded-md"
                />
                <span
                  onClick={togglePassword}
                  className="absolute right-2 top-8 text-gray-500 cursor-pointer hover:text-gray-700"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-black font-semibold mb-0.5">
                  REGISTER AS
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full border-b-2 border-gray-300 py-2 focus:outline-none focus:border-blue-400 rounded-md"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Terms */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                  className="accent-blue-500 mr-2 mt-0.5"
                />
                <label className="text-gray-600 text-sm">
                  I agree to the{" "}
                  <a 
                    href="#" 
                    className="text-blue-500 underline hover:text-blue-700"
                    onClick={(e) => e.preventDefault()}
                  >
                    Terms & Conditions
                  </a>
                </label>
              </div>
              {errors.terms && (
                <p className="text-red-500 text-sm">{errors.terms}</p>
              )}

              {/* Feedback Messages */}
              {successMsg && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                  {successMsg}
                </div>
              )}
              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {submitError}
                </div>
              )}

              {/* Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-2 rounded-full font-semibold transition"
                >
                  {loading ? "Signing Up..." : "Sign Up"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="border border-blue-500 text-blue-500 hover:bg-blue-50 px-6 py-2 rounded-full font-semibold transition"
                >
                  Login
                </button>
              </div>
            </form>
          </div>

          {/* Right-side image */}
          <div
            className="hidden md:block md:w-1/2 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImg})` }}
          />
        </div>
      </div>
    </>
  );
};

export default Register;