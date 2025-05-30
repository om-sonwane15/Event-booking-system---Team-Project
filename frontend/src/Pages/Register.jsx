
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axiosInstance from "../utils/axiosInstance";


const Register = ({ rolePreset = "user" }) => {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    role: rolePreset,
    terms: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const isAdmin = rolePreset === "admin";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

//   const validatePassword = (password) => {
//     const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
//     return regex.test(password);
//   };

function validatePassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(password);
}


  const togglePassword = () => setShowPassword((prev) => !prev);

  const validate = () => {
    const errs = {};

    if (!formData.email) {
      errs.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = "Email is invalid";
    }

    if (!formData.name) {
      errs.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      errs.name = "Name must be at least 2 characters";
    }

    if (!formData.password) {
      errs.password = "Password is required";
    } 
    else if (!validatePassword(formData.password)) {
      errs.password =
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character.";
    }

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
      const response = await axiosInstance.post("/auth/register", {
        name: formData.name.trim(),
        email: formData.email.toLowerCase(),
        password: formData.password,
        role: formData.role,
      });

      setSuccessMsg(
        formData.role === "admin"
          ? "Admin registered successfully! Please login to continue."
          : "User registered successfully! Please login to continue."
      );

      setFormData({
        email: "",
        name: "",
        password: "",
        role: rolePreset,
        terms: false,
      });

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
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('/rb.avif')` ,
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full mx-4 flex">
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">
                {isAdmin ? "SignUp as Admin" : "SignUp as User "}
              </h2>
              <button
                onClick={() =>
                  navigate(isAdmin ? "/register-user" : "/register-admin")
                }
                className="border border-cyan-400 text-cyan-400 hover:bg-cyan-50 px-3 py-1 rounded-full text-sm transition"
                type="button"
              >
                {isAdmin ? "SignUp as User" : "SignUp as Admin"}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-cyan-400 outline-none bg-transparent text-gray-700 placeholder-gray-400 rounded"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  FULL NAME
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-cyan-400 outline-none bg-transparent text-gray-700 placeholder-gray-400 rounded"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
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
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-cyan-400 outline-none bg-transparent text-gray-700 placeholder-gray-400 rounded"
                  />
                  <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="text-xl" />
                    ) : (
                      <FaEye className="text-xl" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                  className="accent-cyan-400 mr-2 mt-0.5"
                />
                <label
                  htmlFor="terms"
                  className="text-gray-600 text-sm cursor-pointer"
                >
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-cyan-500 underline hover:text-cyan-700"
                    onClick={(e) => e.preventDefault()}
                  >
                    Terms & Conditions
                  </a>
                </label>
              </div>
              {errors.terms && (
                <p className="text-red-500 text-sm">{errors.terms}</p>
              )}

              {/* Feedback */}
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
              {/* Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className=" bg-[#007595] hover:bg-[#005d78] disabled:bg-opacity-50 text-white px-6 py-3 rounded-full font-semibold transition"
                >
                  {loading ? "Signing Up..." : "Sign Up"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="border-2 border-[#007595] text-[#007595] hover:bg-[#e0f5f9] font-semibold px-6 py-3 rounded-full transition duration-200"
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side - Image */}
        <div
          className="hidden md:block md:w-1/2"
          style={{
            backgroundImage: `url('/cp.jpg')` ,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
      </div>
    </div>
  );
};

export default Register;
