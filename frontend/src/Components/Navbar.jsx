import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiMenu, FiX, FiUser, FiSettings, FiLogOut, FiHome, FiShield } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { BiChevronDown } from "react-icons/bi";
import { toast } from "react-toastify";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileRef = useRef();

  const user = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
  const isAdmin = user?.role === "admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    toast.success("Logged out successfully!", {
      position: "top-right",
      autoClose: 3000,
    });
    navigate("/login");
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigation = (path, message) => {
    navigate(path);
    if (message) {
      toast.info(message, {
        position: "top-right",
        autoClose: 2000,
      });
    }
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-purple-700 via-purple-800 to-purple-900 border-b border-purple-600 shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Left side heading */}
        <div
          onClick={() => navigate("/")}
          className="text-cyan-50 font-bold text-xl cursor-pointer select-none"
          aria-label="Go to home"
        >
          Grab The Show
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={() => handleNavigation(isAdmin ? "/admin" : "/user")}
            className="flex cursor-pointer items-center space-x-2 px-4 py-2 rounded-lg text-white hover:text-blue-300 font-semibold transition duration-200 hover:bg-purple-700"
          >
            {isAdmin ? <FiShield className="text-lg" /> : <FiHome className="text-lg" />}
            <span>{isAdmin ? "Admin Panel" : "Dashboard"}</span>
          </button>

          <button
            onClick={() => handleNavigation("/profile", "Navigating to profile...")}
            className="flex cursor-pointer items-center space-x-2 px-4 py-2 rounded-lg text-white hover:text-blue-300 font-semibold transition duration-200 hover:bg-purple-700"
          >
            <FiUser className="text-lg" />
            <span>Profile</span>
          </button>

          <div className="relative" ref={profileRef}>
            <button
              onClick={toggleProfileMenu}
              className="flex cursor-pointer items-center space-x-1 px-4 py-2 rounded-lg text-white hover:text-blue-300 transition duration-200 focus:outline-none hover:bg-purple-700"
              aria-label="User profile menu"
            >
              <FaUserCircle className="text-3xl" />
              <BiChevronDown className={`text-lg transition-transform duration-300 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-purple-300 z-50">
                <div className="px-4 py-3 border-b border-purple-200">
                  <p className="font-semibold text-gray-800">{user?.name || "User"}</p>
                  <p className="text-sm text-gray-600 capitalize">{user?.role || "Member"}</p>
                </div>
                <button
                  onClick={() => handleNavigation("/change-password", "Opening password change...")}
                  className="w-full cursor-pointer text-left px-4 py-2 text-gray-700 hover:bg-blue-100 transition"
                >
                  Change Password
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full cursor-pointer text-left px-4 py-2 text-red-600 hover:bg-red-100 font-semibold transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="text-white cursor-pointer p-2 rounded-lg focus:outline-none hover:bg-purple-700"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <FiX className="text-3xl" /> : <FiMenu className="text-3xl" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-purple-800 border-t border-purple-700 shadow-inner">
          <div className="flex flex-col space-y-1 px-4 py-4">
            <button
              onClick={() => handleNavigation(isAdmin ? "/admin" : "/dashboard")}
              className="flex cursor-pointer items-center space-x-2 px-3 py-2 rounded-md text-white hover:bg-purple-700 font-semibold"
            >
              {isAdmin ? <FiShield className="text-lg" /> : <FiHome className="text-lg" />}
              <span>{isAdmin ? "Admin Panel" : "Dashboard"}</span>
            </button>

            <button
              onClick={() => handleNavigation("/profile", "Navigating to profile...")}
              className="flex cursor-pointer items-center space-x-2 px-3 py-2 rounded-md text-white hover:bg-purple-700 font-semibold"
            >
              <FiUser className="text-lg" />
              <span>Profile</span>
            </button>

            <button
              onClick={() => handleNavigation("/change-password", "Opening password change...")}
              className="flex cursor-pointer items-center space-x-2 px-3 py-2 rounded-md text-white hover:bg-blue-700 font-semibold"
            >
              <FiSettings className="text-lg" />
              <span>Change Password</span>
            </button>

            <button
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
              className="flex cursor-pointer items-center space-x-2 px-3 py-2 rounded-md text-red-500 hover:bg-red-700 font-semibold"
            >
              <FiLogOut className="text-lg" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
