// src/Components/CreateEventButton.jsx
import React,{ useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { 
  FiPlus, 
  FiX, 
  FiCalendar, 
  FiClock, 
  FiMapPin, 
  FiTag, 
  FiUsers, 
  FiFileText, 
  FiImage,
  FiDollarSign,
  FiUser
} from 'react-icons/fi';

const CreateEventButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    startTime: new Date(),
    endTime: new Date(Date.now() + 3600000), // 1 hour later
    type: '',
    category: '',
    location: '',
    maxAttendees: 50,
    description: '',
    isPublished: false,
    ticketTypes: [],
    image: ''
  });

  const [newTicketType, setNewTicketType] = useState({
    name: '',
    price: 0,
    available: 10,
    maxPerUser: 1
  });

  // Event types and categories
  const eventTypes = ['Concert', 'Conference', 'Workshop', 'Exhibition', 'Sports', 'Other'];
  const eventCategories = ['Music', 'Business', 'Technology', 'Art', 'Food', 'Health', 'Education', 'Other'];

  useEffect(() => {
    // Check if user is admin
    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
    setIsAdmin(user?.role === 'admin');
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset form on close
    setFormData({
      title: '',
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000),
      type: '',
      category: '',
      location: '',
      maxAttendees: 50,
      description: '',
      isPublished: false,
      ticketTypes: [],
      image: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };

  const handleAddTicketType = () => {
    if (!newTicketType.name || newTicketType.available <= 0) {
      setError('Ticket type must have a name and positive available quantity');
      return;
    }

    setFormData(prev => ({
      ...prev,
      ticketTypes: [...prev.ticketTypes, newTicketType]
    }));

    setNewTicketType({
      name: '',
      price: 0,
      available: 10,
      maxPerUser: 1
    });
    setError('');
  };

  const handleRemoveTicketType = (index) => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: prev.ticketTypes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Basic validation
      if (!formData.title || !formData.startTime || !formData.endTime || 
          !formData.type || !formData.category || !formData.location || 
          !formData.maxAttendees || !formData.description) {
        throw new Error('Please fill all required fields');
      }

      if (new Date(formData.startTime) <= new Date()) {
        throw new Error('Event must start in the future');
      }

      if (new Date(formData.endTime) <= new Date(formData.startTime)) {
        throw new Error('End time must be after start time');
      }

      if (formData.ticketTypes.length === 0) {
        throw new Error('At least one ticket type is required');
      }

      const endpoint = isAdmin ? '/admin-events/create-event' : '/events/create-event';
      
      const response = await axiosInstance.post(endpoint, {
        ...formData,
        startTime: formData.startTime.toISOString(),
        endTime: formData.endTime.toISOString()
      });

      setSuccess('Event created successfully!');
      // Close modal after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      console.error('Error creating event:', err);
      setError(err.response?.data?.msg || err.message || 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Create Event Button */}
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
      >
        <FiPlus /> Create Event
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-semibold">Create New Event</h2>
              <button 
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>
            
            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                <p>{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
                <p>{success}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Event Title */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Event Title *</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter event title"
                      required
                    />
                    <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Event Type */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Event Type *</label>
                  <div className="relative">
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select event type</option>
                      {eventTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Start Time */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Start Time *</label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      name="startTime"
                      value={formData.startTime.toISOString().slice(0, 16)}
                      onChange={(e) => handleDateChange('startTime', new Date(e.target.value))}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min={new Date().toISOString().slice(0, 16)}
                    />
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* End Time */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">End Time *</label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      name="endTime"
                      value={formData.endTime.toISOString().slice(0, 16)}
                      onChange={(e) => handleDateChange('endTime', new Date(e.target.value))}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min={formData.startTime.toISOString().slice(0, 16)}
                    />
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Category *</label>
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select category</option>
                      {eventCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Location *</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter event location"
                      required
                    />
                    <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Max Attendees */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Maximum Attendees *</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="maxAttendees"
                      min="1"
                      value={formData.maxAttendees}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <FiUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Publish Status (Admin only) */}
                {isAdmin && (
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Publish Status</label>
                    <div className="relative">
                      <select
                        name="isPublished"
                        value={formData.isPublished}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.value === 'true' }))}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="false">Draft</option>
                        <option value="true">Published</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Description *</label>
                <div className="relative">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full border border-gray-300 rounded-md py-2 px-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter event description"
                    required
                  />
                  <FiFileText className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Image URL (optional)</label>
                <div className="relative">
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter image URL"
                  />
                  <FiImage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Ticket Types */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">Ticket Types *</label>
                </div>
                
                {/* Current Ticket Types */}
                <div className="flex flex-wrap gap-2">
                  {formData.ticketTypes.map((ticket, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full"
                    >
                      <span>{ticket.name} - ${ticket.price} ({ticket.available} available)</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTicketType(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Ticket Type */}
                <div className="border border-dashed border-gray-300 rounded-lg p-4 mt-2">
                  <h3 className="text-sm font-medium mb-2">Add New Ticket Type</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {/* Ticket Name */}
                    <div className="space-y-1">
                      <label className="block text-xs text-gray-500">Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={newTicketType.name}
                          onChange={(e) => setNewTicketType(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Ticket name"
                        />
                      </div>
                    </div>

                    {/* Price */}
                    <div className="space-y-1">
                      <label className="block text-xs text-gray-500">Price ($)</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={newTicketType.price}
                          onChange={(e) => setNewTicketType(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                          className="w-full border border-gray-300 rounded-md py-1 px-2 pl-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <FiDollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                      </div>
                    </div>

                    {/* Available */}
                    <div className="space-y-1">
                      <label className="block text-xs text-gray-500">Available</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          value={newTicketType.available}
                          onChange={(e) => setNewTicketType(prev => ({ ...prev, available: parseInt(e.target.value) || 0 }))}
                          className="w-full border border-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Max per User */}
                    <div className="space-y-1">
                      <label className="block text-xs text-gray-500">Max per User</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          value={newTicketType.maxPerUser}
                          onChange={(e) => setNewTicketType(prev => ({ ...prev, maxPerUser: parseInt(e.target.value) || 1 }))}
                          className="w-full border border-gray-300 rounded-md py-1 px-2 pl-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <FiUser className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddTicketType}
                    className="mt-3 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <FiPlus size={14} /> Add Ticket Type
                  </button>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateEventButton;