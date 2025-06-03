import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import {
  FiEdit,
  FiMail,
  FiPhone,
  FiUser,
  FiUserCheck,
  FiCamera,
  FiX,
  FiLoader,
} from "react-icons/fi";
import { MdOutlineWorkOutline } from "react-icons/md";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [preview, setPreview] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    phone: "",
    profilePic: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Get base URL for images
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) return imagePath;
    
    // Construct URL with your backend base URL
    const baseUrl = ('https://event-testing-team.up.railway.app')
      .replace(/\/$/, '');
    
    // Ensure path starts with /
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    
    return `${baseUrl}${cleanPath}`;
  };

  const defaultAvatar = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6Q-GayaGn6nptJrP8wXnzcgQemuBGqLL8mQ&s";

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axiosInstance.get("/user/view-profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = res.data.user;
      setProfile(user);
      setFormData({
        name: user.name || "",
        bio: user.bio || "",
        phone: user.phone?.replace('+91', '') || "",
        profilePic: user.profilePic || "",
      });
      
      // Set preview with proper URL construction
      const imageUrl = getImageUrl(user.profilePic);
      console.log(imageUrl)
      setPreview(imageUrl);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setMessage({ type: "error", text: "Failed to load profile" });
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => setIsModalOpen(true);

  const closeModal = () => {
    setIsModalOpen(false);
    setMessage({ type: "", text: "" });

    if (profile) {
      setFormData({
        name: profile.name || "",
        bio: profile.bio || "",
        phone: profile.phone?.replace('+91', '') || "",
        profilePic: profile.profilePic || "",
      });
      const imageUrl = getImageUrl(profile.profilePic);
      setPreview(imageUrl);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "profilePic" && files[0]) {
      setFormData({ ...formData, profilePic: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "");
      setFormData({ ...formData, phone: digitsOnly });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const digitsOnly = formData.phone.replace(/\D/g, "");
    if (digitsOnly.length !== 10) {
      setMessage({
        type: "error",
        text: "Phone number must be exactly 10 digits.",
      });
      return;
    }

    const submissionData = new FormData();
    submissionData.append("name", formData.name);
    submissionData.append("bio", formData.bio);
    submissionData.append("phone", digitsOnly);
    if (formData.profilePic instanceof File) {
      submissionData.append("profilePic", formData.profilePic);
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.put("/user/update-profile", submissionData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setProfile(res.data.user);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      
      // Update preview with new image URL
      const imageUrl = getImageUrl(res.data.user.profilePic);
      setPreview(imageUrl);

      setTimeout(() => {
        setMessage({ type: "", text: "" });
        setIsModalOpen(false);
      }, 1500);
    } catch (error) {
      console.error("Update failed:", error.response?.data || error);
      setMessage({ 
        type: "error", 
        text: error.response?.data?.msg || "Failed to update profile." 
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <FiLoader className="animate-spin text-[#005D78]" size={24} />
          <span className="text-lg text-gray-600">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Failed to load profile</p>
          <button 
            onClick={fetchProfile}
            className="px-4 py-2 bg-[#005D78] text-white rounded-md hover:bg-[#004D68] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#005c78] via-[#004D68] to-[#003D58] text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">My Profile</h1>
          <p className="text-xl opacity-90">Manage your account information</p>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-[#005c78] to-[#004D68] px-8 py-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src={preview}
                  alt="Profile"
                  className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-lg"
                  onError={(e) => {
                    if (e.target.src !== defaultAvatar) {
                      e.target.src = defaultAvatar;
                    }
                  }}
                />
                <button
                  onClick={openModal}
                  className="absolute -bottom-2 -right-2 bg-white hover:bg-gray-100 text-[#005D78] p-2 rounded-full shadow-lg transition duration-300 hover:scale-110"
                  title="Edit Profile"
                >
                  <FiEdit size={16} />
                </button>
              </div>
              
              <div className="text-white">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <FiUserCheck />
                  {profile.name}
                </h2>
                <p className="mt-1 inline-block text-sm font-medium bg-opacity-20 px-3 py-1 rounded-full">
                  {profile.role === "admin" ? "Admin" : "User"}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="bg-[#005D78] p-3 rounded-full">
                  <FiMail className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Email</p>
                  <p className="text-gray-900 break-all">{profile.email}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="bg-[#005D78] p-3 rounded-full">
                  <FiPhone className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Phone</p>
                  <p className="text-gray-900">{profile.phone || "Not provided"}</p>
                </div>
              </div>

              {/* Bio */}
              <div className="md:col-span-2 flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="bg-[#005D78] p-3 rounded-full">
                  <MdOutlineWorkOutline className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">Bio</p>
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {profile.bio || "No bio provided"}
                  </p>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <div className="mt-8 text-center">
              <button
                onClick={openModal}
                className="px-8 py-3 bg-[#005D78] hover:bg-[#004D68] text-white rounded-lg font-medium flex items-center justify-center gap-2 mx-auto transition-colors"
              >
                <FiEdit size={20} />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#005c78] to-[#004D68] text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <FiEdit /> Edit Profile
                </h3>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Picture Upload */}
                <div className="text-center">
                  <div className="relative inline-block">
                    <img
                      src={preview || defaultAvatar}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-full border-4 border-gray-200 mx-auto"
                      onError={(e) => {
                        if (e.target.src !== defaultAvatar) {
                          e.target.src = defaultAvatar;
                        }
                      }}
                    />
                    <label className="absolute bottom-0 right-0 bg-[#005D78] hover:bg-[#004D68] text-white p-2 rounded-full cursor-pointer transition-colors">
                      <FiCamera size={16} />
                      <input
                        type="file"
                        name="profilePic"
                        accept="image/*"
                        onChange={handleChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Click the camera icon to change photo</p>
                </div>

                {/* Name Field */}
                <InputField
                  label="Name"
                  icon={<FiUser />}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

                {/* Phone Field */}
                <InputField
                  label="Phone"
                  icon={<FiPhone />}
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={10}
                  placeholder="10-digit number"
                />

                {/* Bio Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 text-gray-400">
                      <MdOutlineWorkOutline size={20} />
                    </div>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows="4"
                      maxLength={500}
                      placeholder="Tell us about yourself..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005D78] focus:border-transparent resize-none"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.bio.length}/500 characters
                  </p>
                </div>

                {/* Message */}
                {message.text && (
                  <div className={`p-4 rounded-lg text-center font-medium ${
                    message.type === "success" 
                      ? "bg-green-50 text-green-800 border border-green-200" 
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}>
                    {message.text}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-[#005D78] hover:bg-[#004D68] text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <FiEdit size={20} />
                  Update Profile
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Input Field Component
const InputField = ({ label, icon, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        {icon}
      </div>
      <input
        {...props}
        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005D78] focus:border-transparent"
      />
    </div>
  </div>
);

export default Profile;