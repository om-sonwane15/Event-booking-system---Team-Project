import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
    ticketTypes: [
      { name: 'General Admission', price: 0, available: 100, maxPerUser: 5 }
    ],
    isPublished: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axiosInstance.get('/events/my-events');
        const event = response.data.find(e => e._id === id);
        
        if (!event) {
          throw new Error('Event not found');
        }

        if (event.cancelled) {
          navigate('/events/manage-events');
          return;
        }

        // Format dates for datetime-local input
        const formatDateForInput = (dateString) => {
          const date = new Date(dateString);
          return date.toISOString().slice(0, 16);
        };

        setFormData({
          title: event.title,
          startTime: formatDateForInput(event.startTime),
          endTime: formatDateForInput(event.endTime),
          type: event.type,
          category: event.category,
          location: event.location,
          maxAttendees: event.maxAttendees,
          description: event.description,
          image: event.image,
          ticketTypes: event.ticketTypes,
          isPublished: event.isPublished
        });
      } catch (err) {
        setError(err.response?.data?.msg || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, navigate]);

  const handleChange = (e) => {
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
      ticketTypes: [
        ...prev.ticketTypes,
        { name: '', price: 0, available: 0, maxPerUser: 1 }
      ]
    }));
  };

  const removeTicketType = (index) => {
    if (formData.ticketTypes.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      ticketTypes: prev.ticketTypes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await axiosInstance.put(`/events/edit-event/${id}`, formData);
      navigate('/events/manage-events');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading event details...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Event</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005D78] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005D78] focus:border-transparent"
            >
              <option value="">Select a category</option>
              <option value="music">Music</option>
              <option value="sports">Sports</option>
              <option value="art">Art</option>
              <option value="food">Food</option>
              <option value="business">Business</option>
            </select>
          </div>

          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
              Start Time *
            </label>
            <input
              type="datetime-local"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005D78] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
              End Time *
            </label>
            <input
              type="datetime-local"
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005D78] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005D78] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="maxAttendees" className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Attendees *
            </label>
            <input
              type="number"
              id="maxAttendees"
              name="maxAttendees"
              min="1"
              value={formData.maxAttendees}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005D78] focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005D78] focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
            Image URL
          </label>
          <input
            type="url"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005D78] focus:border-transparent"
          />
          {formData.image && (
            <div className="mt-2">
              <img 
                src={formData.image} 
                alt="Event preview" 
                className="h-32 object-cover rounded"
              />
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Ticket Types</h3>
            <button
              type="button"
              onClick={addTicketType}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
            >
              Add Ticket Type
            </button>
          </div>
          
          {formData.ticketTypes.map((ticketType, index) => (
            <div key={index} className="grid grid-cols-1 gap-4 sm:grid-cols-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={ticketType.name}
                  onChange={(e) => handleTicketTypeChange(index, 'name', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005D78] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={ticketType.price}
                  onChange={(e) => handleTicketTypeChange(index, 'price', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005D78] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Available *</label>
                <input
                  type="number"
                  min="0"
                  value={ticketType.available}
                  onChange={(e) => handleTicketTypeChange(index, 'available', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005D78] focus:border-transparent"
                />
              </div>
              <div className="flex items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max per user *</label>
                  <input
                    type="number"
                    min="1"
                    value={ticketType.maxPerUser}
                    onChange={(e) => handleTicketTypeChange(index, 'maxPerUser', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005D78] focus:border-transparent"
                  />
                </div>
                {formData.ticketTypes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTicketType(index)}
                    className="ml-2 p-2 text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublished"
              name="isPublished"
              checked={formData.isPublished}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
              className="h-4 w-4 text-[#005D78] focus:ring-[#005D78] border-gray-300 rounded"
            />
            <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700">
              Publish this event
            </label>
          </div>

          <div className="space-x-3">
            <button
              type="button"
              onClick={() => navigate('/manage-events')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-[#005D78] text-white rounded-md hover:bg-[#004D68] disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditEvent;