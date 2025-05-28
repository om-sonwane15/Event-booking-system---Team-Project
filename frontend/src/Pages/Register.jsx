import React, { useState } from "react";
import backgroundImg from "../assets/register.jpeg";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    password: "",
    role: "user",
    terms: false,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validate = () => {
    const errs = {};
    if (!formData.email) errs.email = "Email is required";
    if (!formData.fullName) errs.fullName = "Full name is required";
    if (!formData.password) errs.password = "Password is required";
    if (!formData.terms) errs.terms = "You must accept terms";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    alert(`Registered as ${formData.role.toUpperCase()}`);
    console.log(formData);
  };

  return (
    <div className="flex min-h-screen bg-white">
    
      <div className="flex flex-col justify-center flex-1 px-8 sm:px-16 lg:px-24">
        <div className="max-w-md mx-auto w-full">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Sign Up</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
           
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full border-b-2 border-gray-300 focus:outline-none focus:border-blue-400 py-2 placeholder-gray-400"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

           
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                FULL NAME
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full border-b-2 border-gray-300 focus:outline-none focus:border-blue-400 py-2 placeholder-gray-400"
              />
              {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
            </div>

           
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                PASSWORD
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full border-b-2 border-gray-300 focus:outline-none focus:border-blue-400 py-2 placeholder-gray-400"
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>

           
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                REGISTER AS
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full border-b-2 border-gray-300 py-2 focus:outline-none focus:border-blue-400"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            
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
            {errors.terms && <p className="text-red-500 text-sm">{errors.terms}</p>}

            
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
      </div>

     
      <div
        className="hidden md:block md:w-1/2 bg-cover bg-center rounded-l-3xl"
        style={{ backgroundImage: `url(${backgroundImg})` }}
      ></div>
    </div>
  );
};

export default Register;
