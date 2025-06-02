import React, { useState, useEffect } from "react";
import { FiEdit, FiTrash2, FiPlus, FiCalendar, FiMapPin, FiSave, FiX, FiFilter } from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import axiosInstance from "../utils/axiosInstance";

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    title: "",
    date: "",
    location: "",
    description: "",
    type: "Conference",
    price: 0,
    image: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeSection, setActiveSection] = useState("upcoming");
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get("/events");
        setEvents(response.data);
      } catch (err) {
        toast.error("Error fetching events: " + (err.response?.data?.msg || err.message));
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value
    }));
  };

  const resetForm = () => {
    setForm({
      title: "",
      date: "",
      location: "",
      description: "",
      type: "Conference",
      price: 0,
      image: ""
    });
    setIsEditing(false);
    setEditingId(null);
    setShowForm(false);
  };

  const handleCreateOrUpdate = async () => {
    if (!form.title || !form.date || !form.location || !form.type || !form.description) {
      toast.error("Please fill in all required fields!");
      return;
    }

    try {
      let response;
      if (isEditing) {
        response = await axiosInstance.put(`/events/${editingId}`, form);
        setEvents(events.map((event) => (event._id === editingId ? response.data.event : event)));
        toast.success("Event updated successfully!");
      } else {
        response = await axiosInstance.post("/events", form);
        setEvents([response.data.event, ...events]);
        toast.success("Event created successfully!");
      }
      resetForm();
    } catch (err) {
      toast.error("Error: " + (err.response?.data?.msg || err.message));
    }
  };

  const handleEdit = (event) => {
    setForm({
      title: event.title,
      date: new Date(event.date).toISOString().split("T")[0],
      location: event.location,
      description: event.description,
      type: event.type,
      price: event.price,
      image: event.image || ""
    });
    setIsEditing(true);
    setEditingId(event._id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
  const toastId = toast(
    ({ closeToast }) => (
      <div className="p-2">
        <p className="text-sm font-medium text-gray-800 mb-2">
          Are you sure you want to delete this event?
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={async () => {
              try {
                await axiosInstance.delete(`/events/${id}`);
                setEvents((prev) => prev.filter((event) => event._id !== id));
                toast.success("Event deleted successfully!");
                toast.dismiss(toastId);
              } catch (err) {
                toast.error("Error deleting event: " + (err.response?.data?.msg || err.message));
              }
            }}
            className="bg-[#005c78] hover:bg-[#005c78] text-white cursor-pointer px-3 py-1 rounded text-sm"> Yes
          </button>
          <button
            onClick={() => toast.dismiss(toastId)}
            className="bg-red-500 hover:bg-red-600 text-white cursor-pointer px-3 py-1 rounded text-sm">Cancel
          </button>
        </div>
      </div>
    ),
    {
      position: "top-center",
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      closeButton: false,
    }
  );
};

  const categorizeEvents = () => {
    const today = new Date().setHours(0, 0, 0, 0);
    const past = [];
    const live = [];
    const upcoming = [];

    events.forEach((event) => {
      const eventDate = new Date(event.date).setHours(0, 0, 0, 0);
      if (eventDate < today) {
        past.push(event);
      } else if (eventDate === today) {
        live.push(event);
      } else {
        upcoming.push(event);
      }
    });

    return {
      past: past.sort((a, b) => new Date(b.date) - new Date(a.date)),
      live: live.sort((a, b) => new Date(a.date) - new Date(b.date)),
      upcoming: upcoming.sort((a, b) => new Date(a.date) - new Date(b.date)),
    };
  };

  const { past, live, upcoming } = categorizeEvents();

  const filterEvents = (list) => {
    if (!searchTerm) return list;
    return list.filter(event => 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getActiveList = () => {
    switch (activeSection) {
      case "past": return filterEvents(past);
      case "live": return filterEvents(live);
      case "upcoming": return filterEvents(upcoming);
      default: return [];
    }
  };

  const getSectionCount = (section) => {
    switch (section) {
      case "past": return past.length;
      case "live": return live.length;
      case "upcoming": return upcoming.length;
      default: return 0;
    }
  };

  const renderCard = (event) => (
    <div
      key={event._id}
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden transform hover:-translate-y-1"
    >
      <div className="relative overflow-hidden">
        <img
          src={event.image || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=600&q=80'}
          alt={event.title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
              event.type === "Movie"
                ? "bg-purple-500/90 text-white"
                : "bg-emerald-500/90 text-white"
            }`}
          >
            {event.type}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="p-5">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {event.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-700">
            <FiCalendar className="w-4 h-4 mr-2 text-blue-500" />
            <span>{new Date(event.date).toLocaleDateString('en-US', { 
              weekday: 'short', 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}</span>
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <FiMapPin className="w-4 h-4 mr-2 text-red-500" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center text-sm font-semibold text-emerald-600">
            <FaRupeeSign className="w-4 h-4 mr-1" />
            <span>{Number(event.price).toLocaleString()}</span>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => handleEdit(event)}
            className="inline-flex items-center cursor-pointer justify-center w-9 h-9 rounded-full bg-[#005c78] text-white hover:bg-[#003D58] transition-colors duration-200"
            aria-label="Edit Event"
          >
            <FiEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(event._id)}
            className="inline-flex items-center cursor-pointer justify-center w-9 h-9 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors duration-200"
            aria-label="Delete Event"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderList = (list) => {
    if (isLoading) {
      return (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading events...</p>
        </div>
      );
    }
    if (list.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <FiCalendar className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg">No events found.</p>
          {searchTerm && (
            <p className="text-gray-400 text-sm mt-2">Try adjusting your search terms</p>
          )}
        </div>
      );
    }

    return (
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map(renderCard)}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between pr-5 font-bold bg-gradient-to-r from-white/95 via-[#00a0da] to-white/95 items-center py-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#005c78] via-[#004D68] to-[#003D58] bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Manage your events</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center cursor-pointer px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
              <FiPlus className="w-5 h-5 mr-2" />Add New Event
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
                <h2 className="text-xl font-bold text-gray-900">
                  {isEditing ? "Edit Event" : "Create New Event"}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 cursor-pointer rounded-full transition-colors">
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleInputChange}
                      placeholder="Enter title"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      required/>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type *
                    </label>
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required>
                      <option value="Conference">Conference</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Meetup">Meetup</option>
                      <option value="Seminar">Seminar</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={handleInputChange}
                      placeholder="Enter location"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image URL
                    </label>
                    <input
                      type="text"
                      name="image"
                      value={form.image}
                      onChange={handleInputChange}
                      placeholder="Enter image URL"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleInputChange}
                      placeholder="Enter description"
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      required/>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-8">
                  <button
                    onClick={handleCreateOrUpdate}
                    className="flex-1 inline-flex items-center cursor-pointer justify-center px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-semibold rounded-xl transition-all duration-200"
                  >
                    <FiSave className="w-5 h-5 mr-2" />
                    {isEditing ? "Update" : "Create"}
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-6 cursor-pointer py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all duration-200"
                  >Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Upcoming</p>
                <p className="text-3xl font-bold">{upcoming.length}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FiCalendar className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Live Today</p>
                <p className="text-3xl font-bold">{live.length}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Past Events</p>
                <p className="text-3xl font-bold">{past.length}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FiFilter className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
            
            <div className="flex gap-2">
              {["upcoming", "live", "past"].map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`relative px-6 py-3 cursor-pointer rounded-xl font-semibold transition-all duration-200 ${
                    activeSection === section
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                  <span className={`ml-2 inline-flex items-center justify-center w-5 h-5 text-xs rounded-full ${
                    activeSection === section 
                      ? "bg-white/20 text-white" 
                      : "bg-gray-300 text-gray-600"
                  }`}>
                    {getSectionCount(section)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              {activeSection === "upcoming" && "🚀 Upcoming Events"}
              {activeSection === "live" && "🔴 Live Today"}
              {activeSection === "past" && "📚 Past Events"}
              <span className="text-base font-normal text-gray-500">
                ({getActiveList().length} {getActiveList().length === 1 ? 'event' : 'events'})
              </span>
            </h2>
          </div>
          {renderList(getActiveList())}
        </div>
      </div>
      
      <ToastContainer position="top-center" autoClose={3000} limit={3} />
    </div>
  );
};

export default AdminDashboard;