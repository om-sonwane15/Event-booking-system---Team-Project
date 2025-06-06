import React from 'react';
import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { FiCalendar, FiClock, FiMapPin, FiTag, FiUsers, FiFileText, FiImage, FiX, FiPlus } from 'react-icons/fi';

const EventCreationButton = ({ userRole = 'user' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    type: '',
    category: '',
    location: '',
    maxAttendees: '',
    description: '',
    image: '',
    isPublished: false,
    ticketTypes: [{ name: 'General Admission', price: 0, available: 0, maxPerUser: 1 }]
  });

  // Fetch categories and types when component mounts
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // In a real app, you would fetch these from your API
        setCategories(['Music', 'Sports', 'Arts', 'Food', 'Business', 'Technology']);
        setEventTypes(['Conference', 'Workshop', 'Concert', 'Exhibition', 'Meetup']);
      } catch (err) {
        console.error('Error fetching options:', err);
      }
    };
    
    fetchOptions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTicketTypeChange = (index, field, value) => {
    const updatedTicketTypes = [...formData.ticketTypes];
    updatedTicketTypes[index][field] = field === 'name' ? value : Number(value);
    setFormData(prev => ({ ...prev, ticketTypes: updatedTicketTypes }));
  };

  const addTicketType = () => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: [...prev.ticketTypes, { name: '', price: 0, available: 0, maxPerUser: 1 }]
    }));
  };

  const removeTicketType = (index) => {
    if (formData.ticketTypes.length <= 1) return;
    const updatedTicketTypes = formData.ticketTypes.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, ticketTypes: updatedTicketTypes }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      // Basic validation
      if (!formData.title || !formData.startTime || !formData.endTime || !formData.type || 
          !formData.category || !formData.location || !formData.maxAttendees || !formData.description) {
        throw new Error('Please fill all required fields');
      }

      if (new Date(formData.startTime) <= new Date()) {
        throw new Error('Event must start in the future');
      }

      if (new Date(formData.endTime) <= new Date(formData.startTime)) {
        throw new Error('End time must be after start time');
      }

      for (const ticketType of formData.ticketTypes) {
        if (!ticketType.name || ticketType.price < 0 || ticketType.available < 0) {
          throw new Error('All ticket types must have valid name, price and availability');
        }
      }

      // Determine the API endpoint based on user role
      const endpoint = userRole === 'admin' ? '/admin-events/create-event' : '/events/create-event';
      
      // Prepare the data to send
      const dataToSend = {
        title: formData.title,
        startTime: formData.startTime,
        endTime: formData.endTime,
        type: formData.type,
        category: formData.category,
        location: formData.location,
        maxAttendees: formData.maxAttendees,
        description: formData.description,
        ticketTypes: formData.ticketTypes,
        image: formData.image
      };

      // Add isPublished only for admin
      if (userRole === 'admin') {
        dataToSend.isPublished = formData.isPublished;
      }

      const response = await axiosInstance.post(endpoint, dataToSend);
      
      setSuccess('Event created successfully!');
      // Reset form after successful submission
      setFormData({
        title: '',
        startTime: '',
        endTime: '',
        type: '',
        category: '',
        location: '',
        maxAttendees: '',
        description: '',
        image: '',
        isPublished: false,
        ticketTypes: [{ name: 'General Admission', price: 0, available: 0, maxPerUser: 1 }]
      });
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setIsOpen(false);
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.msg || err.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
      >
        <FiPlus /> Create Event
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-semibold">Create New Event</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                <FiX size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Event Title */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Event Title *</label>
                  <div className="relative">
                    <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter event title"
                      required
                    />
                  </div>
                </div>

                {/* Event Type */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Event Type *</label>
                  <div className="relative">
                    <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select event type</option>
                      {eventTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Start Time */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Start Time *</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="datetime-local"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* End Time */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">End Time *</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="datetime-local"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Category *</label>
                  <div className="relative">
                    <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Location *</label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter event location"
                      required
                    />
                  </div>
                </div>

                {/* Max Attendees */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Max Attendees *</label>
                  <div className="relative">
                    <FiUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      name="maxAttendees"
                      value={formData.maxAttendees}
                      onChange={handleInputChange}
                      min="1"
                      className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter maximum attendees"
                      required
                    />
                  </div>
                </div>

                {/* Image URL */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Image URL</label>
                  <div className="relative">
                    <FiImage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter image URL (optional)"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Description *</label>
                <div className="relative">
                  <FiFileText className="absolute left-3 top-3 text-gray-400" />
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter event description"
                    required
                  />
                </div>
              </div>

              {/* Ticket Types */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">Ticket Types</label>
                  <button
                    type="button"
                    onClick={addTicketType}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add Ticket Type
                  </button>
                </div>
                
                {formData.ticketTypes.map((ticket, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end border p-2 rounded">
                    <div>
                      <label className="block text-xs text-gray-500">Name</label>
                      <input
                        type="text"
                        value={ticket.name}
                        onChange={(e) => handleTicketTypeChange(index, 'name', e.target.value)}
                        className="w-full border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Price ($)</label>
                      <input
                        type="number"
                        value={ticket.price}
                        onChange={(e) => handleTicketTypeChange(index, 'price', e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-full border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Available</label>
                      <input
                        type="number"
                        value={ticket.available}
                        onChange={(e) => handleTicketTypeChange(index, 'available', e.target.value)}
                        min="0"
                        className="w-full border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        required
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div>
                        <label className="block text-xs text-gray-500">Max per user</label>
                        <input
                          type="number"
                          value={ticket.maxPerUser}
                          onChange={(e) => handleTicketTypeChange(index, 'maxPerUser', e.target.value)}
                          min="1"
                          className="w-full border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                          required
                        />
                      </div>
                      {formData.ticketTypes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTicketType(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <FiX />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Publish checkbox (only for admin) */}
              {userRole === 'admin' && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublished"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700">
                    Publish immediately
                  </label>
                </div>
              )}

              {/* Form actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default EventCreationButton;