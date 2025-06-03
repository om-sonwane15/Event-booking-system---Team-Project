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

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.get("/user/view-profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data.user);
      console.log(res.data.user);
      setFormData({
        name: res.data.user.name || "",
        bio: res.data.user.bio || "",
        phone: res.data.user.phone || "",
        profilePic: res.data.user.profilePic,
      });
      setPreview(`http://localhost:8080${res.data.user.profilePic}`);
      console.log(res.data.user.profilePic);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setMessage({ type: "", text: "" });

    setFormData({
      name: profile.name || "",
      bio: profile.bio || "",
      phone: profile.phone || "",
      profilePic: profile.profilePic || "",
    });

    setPreview(`http://localhost:8080${profile.profilePic}`);
  };

  const handleChange = (e) => {
    if (e.target.name === "profilePic") {
      const file = e.target.files[0];
      setFormData({ ...formData, profilePic: file });
      if (file) setPreview(URL.createObjectURL(file));
    } else if (e.target.name === "phone") {
      const digitsOnly = e.target.value.replace(/\D/g, "");
      setFormData({ ...formData, phone: digitsOnly });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
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
    if (formData.profilePic) {
      submissionData.append("profilePic", formData.profilePic);
    }
    console.log(formData.profilePic);

    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.put(
        "/user/update-profile",
        submissionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setProfile(res.data.user);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setPreview(`http://localhost:8080${res.data.user.profilePic}`);

      setTimeout(() => {
        setMessage({ type: "", text: "" });
        setIsModalOpen(false);
      }, 1500);
    } catch (error) {
      console.error("Update failed:", error.response?.data || error);
      setMessage({ type: "error", text: "Failed to update profile." });
    }
  };

  if (!profile)
    return <div className="text-center mt-10">Loading profile...</div>;

  return (
    <>
      {/* <div
        className="max-w-md mx-auto p-8 rounded-2xl mt-10 
             bg-gradient-to-br from-[#3399b3] via-[#2f7d9a] to-[#256d8a] 
             text-white shadow-2xl border border-[#003d58] transition-transform duration-500 hover:scale-95"
    
      
      > */}
      <div
        className="max-w-md mx-auto p-8 rounded-2xl mt-10
             dark:text-black shadow-2xl border border-[#003d58]
             transition-transform duration-500 hover:scale-95
             bg-cover bg-center bg-blend-overlay"
        style={{
        backgroundImage: `url('/bg.jpg')` ,
      }}
      >
        <div className="relative w-32 h-32 mx-auto mb-6 group">
          <img
            src={preview || profile.profilePic}
            alt="Preview"
            className="w-full h-full object-cover rounded-full border-[#003d58]  shadow-2xl transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              if (!e.target.dataset.fallback) {
                e.target.src =
                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6Q-GayaGn6nptJrP8wXnzcgQemuBGqLL8mQ&s e.target.dataset.fallback = true";
              }
            }}
          />
          <button
            onClick={openModal}
            className="absolute bottom-2 right-2 bg-[#003d58] hover:bg-[#005d78] text-black p-2 rounded-full shadow-md transition duration-300 hover:scale-110"
            title="Edit Profile"
          >
            <FiEdit size={18} />
          </button>
        </div>

        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-black flex items-center justify-center gap-2">
            <FiUserCheck className="text-black" />
            {profile.name}
          </h2>

          <p className="mt-2 inline-block text-sm font-medium text-black bg-[#003d58] px-4 py-1 rounded-full shadow">
            {profile.role === "admin" ? "Admin" : "User"}
          </p>
        </div>

        <div className="mt-8 space-y-4 text-black-800 dark:text-black-200">
          <div className="flex items-center gap-3">
            <FiMail className="text-black text-xl" />
            <span className="break-all">{profile.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <FiPhone className="text-black text-xl" />
            <span>{profile.phone || "-"}</span>
          </div>
          <div className="flex items-start gap-3">
            <MdOutlineWorkOutline className="text-black text-xl " />
            <span className="whitespace-pre-wrap max-w-xs">
              {profile.bio || "-"}
            </span>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 px-4"
          
          onClick={closeModal}
        >
          <div
            className="bg-gradient-to-br from-[#004D68] via-[#003F5E] to-[#002F4B] text-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative"
            
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-200 hover:text-white"
            >
              <FiX size={22} />
            </button>

            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <FiEdit /> Edit Profile
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <div className="flex items-center bg-gray-200 text-black px-3 py-2 rounded-md shadow-inner">
                  <FiUser className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <div className="flex items-center bg-gray-200 text-black px-3 py-2 rounded-md shadow-inner">
                  <FiPhone className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength={10}
                    className="w-full bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <div className="flex items-start bg-gray-200 text-black px-3 py-2 rounded-md shadow-inner">
                  <MdOutlineWorkOutline className="text-gray-400 mt-2 mr-2" />
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="3"
                    maxLength={500}
                    className="w-full bg-transparent focus:outline-none resize-none"
                  ></textarea>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  <img
                    src={preview || profile.profilePic}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-full border border-white"
                    onError={(e) =>
                      (e.target.src =
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6Q-GayaGn6nptJrP8wXnzcgQemuBGqLL8mQ&s")
                    }
                  />
                  <input
                    type="file"
                    name="profilePic"
                    accept="image/*"
                    onChange={handleChange}
                    className="text-sm cursor-pointer text-white"
                  />
                </div>
              </div>

              {message.text && (
                <p
                  className={`text-sm text-center font-medium ${
                    message.type === "success"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {message.text}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-[#00A1C9] hover:bg-[#007595] text-white rounded-md font-medium flex items-center justify-center gap-2 transition"
              >
                <FiEdit /> Update Profile
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
