import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { FiArrowRight, FiLogIn, FiMail } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      toast.error("Email is required");
      setLoading(false);
      return;
    }
    if (!emailRegex.test(trimmedEmail)) {
      toast.error("Please enter a valid email address");
      setLoading(false);
      return;
    }
    try {
      const response = await axiosInstance.post("/auth/forgot-password", {
        email: trimmedEmail,
      });
      toast.success(response.data.msg || "Reset link sent to your email!");
      setEmail("");
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.msg || "Something went wrong. Try again later.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4 sm:px-6"
      style={{ backgroundImage: "url('/pic1.avif')" }}
    >
      <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden">
        <div className="mt-6 md:mt-12 w-full md:w-1/2 p-6 sm:p-8 md:p-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 text-left">
            Forgot Password
          </h2>
          <p className="text-left text-sm text-gray-500 mb-6">
            Enter your email to receive a reset link
          </p>
          <form onSubmit={handleForgot} className="mt-4 space-y-5">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FiMail />
              </div>
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value.trimStart())}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center justify-center cursor-pointer gap-2 py-3 rounded-full text-white font-semibold text-sm sm:text-base transition-all duration-200
                ${
                  loading
                  ? "bg-cyan-400 cursor-not-allowed"
                  : "bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800"
                  }
              w-full`}
              >
              {loading ? "Sending..." : "Send Reset Link"}
              <FiArrowRight />
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-600">
            Remembered your password?
            <button
              type="button"
              onClick={() => navigate("/")}
              className="ml-1 text-cyan-600 font-semibold cursor-pointer inline-flex items-center gap-1 hover:underline"
            >
              <FiLogIn /> Login here
            </button>
          </div>
        </div>
        <div className="hidden md:block w-full md:w-1/2">
          <img
            src="/fp.jpg"
            alt="Scenic Background"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} limit={3} />
    </div>
  );
};
export default ForgotPassword;
