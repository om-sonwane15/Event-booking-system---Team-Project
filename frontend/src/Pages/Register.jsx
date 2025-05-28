import React, { useState } from "react";
import axios from "axios";
import backgroundImg from "../assets/register.jpeg";
import { FaEye, FaEyeSlash } from "react-icons/fa";

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
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
    if (!formData.email) errs.email = "Email is required";
    if (!formData.name) errs.name = "Full name is required";
    if (!formData.password) {
      errs.password = "Password is required";
    } else if (!validatePassword(formData.password)) {
      errs.password =
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character.";
    }
    if (!formData.terms) errs.terms = "You must accept terms";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setSubmitError("");

    if (!validate()) return;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/register`,
        {
          name: formData.name,
          email: formData.email,
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
    } catch (error) {
      setSubmitError(
        error.response?.data?.msg || "An error occurred during registration."
      );
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
                  <p className="text-red-500 text-sm">{errors.email}</p>
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
                  placeholder="Enter your name"
                  className="w-full border-b-2 border-gray-300 focus:outline-none focus:border-blue-400 py-2 placeholder-gray-400 rounded-md"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name}</p>
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
                  className="absolute right-2 top-8 text-gray-500 cursor-pointer"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-black font-semibold mb-1/2">
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
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                  className="accent-blue-500 mr-2"
                />
                <label className="text-gray-600 text-sm">
                  I agree to the{" "}
                  <a href="#" className="text-blue-500 underline">
                    Terms & Conditions
                  </a>
                </label>
              </div>
              {errors.terms && (
                <p className="text-red-500 text-sm">{errors.terms}</p>
              )}

              {/* Feedback */}
              {successMsg && (
                <p className="text-green-600 text-sm">{successMsg}</p>
              )}
              {submitError && (
                <p className="text-red-500 text-sm">{submitError}</p>
              )}

              {/* Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-semibold transition"
                >
                  Sign Up
                </button>
                <button
                  type="button"
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
