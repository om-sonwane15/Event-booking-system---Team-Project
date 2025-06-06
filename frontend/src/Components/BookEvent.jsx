// src/Components/BookEvent.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const BookEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicketType, setSelectedTicketType] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axiosInstance.get(`/events/published-events/${id}`);
        setEvent(response.data);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to fetch event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleBooking = async () => {
    if (!selectedTicketType) {
      setError('Please select a ticket type');
      return;
    }

    try {
      setBooking(true);
      setError(null);
      
      await axiosInstance.post(`/events/book-ticket/${id}`, {
        ticketTypeId: selectedTicketType,
        quantity
      });
      
      navigate('/my-tickets');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to book tickets');
    } finally {
      setBooking(false);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) return <div className="text-center py-8">Loading event details...</div>;
  if (error && !event) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!event) return <div className="text-center py-8">Event not found</div>;

  const startDateTime = formatDateTime(event.startTime);
  const endDateTime = formatDateTime(event.endTime);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            <img
              src={event.image || '/default-event.jpg'}
              alt={event.title}
              className="w-full h-64 md:h-full object-cover"
            />
          </div>
          <div className="p-6 md:w-1/2">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h2>
            <p className="text-gray-600 mb-4">{event.description}</p>
            
            {/* Event Details */}
            <div className="mb-6 space-y-2 text-sm text-gray-600">
              <div><strong>Category:</strong> {event.category}</div>
              <div><strong>Type:</strong> {event.type}</div>
              <div><strong>Location:</strong> {event.location}</div>
              <div><strong>Date:</strong> {startDateTime.date}</div>
              <div><strong>Time:</strong> {startDateTime.time} - {endDateTime.time}</div>
              <div><strong>Max Attendees:</strong> {event.maxAttendees}</div>
              <div><strong>Current Attendees:</strong> {event.attendees?.length || 0}</div>
            </div>

            {/* Ticket Types */}
            {event.ticketTypes && event.ticketTypes.length > 0 ? (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Select Ticket Type</h3>
                <div className="space-y-3">
                  {event.ticketTypes.map(ticketType => (
                    <div key={ticketType._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id={ticketType._id}
                          name="ticketType"
                          value={ticketType._id}
                          checked={selectedTicketType === ticketType._id}
                          onChange={() => setSelectedTicketType(ticketType._id)}
                          className="mr-3"
                          disabled={ticketType.available === 0}
                        />
                        <label htmlFor={ticketType._id} className={`font-medium ${ticketType.available === 0 ? 'text-gray-400' : ''}`}>
                          {ticketType.name} - ${ticketType.price}
                          {ticketType.available === 0 && ' (Sold Out)'}
                        </label>
                      </div>
                      <div className="text-sm text-gray-500">
                        <div>{ticketType.available} available</div>
                        <div>Max {ticketType.maxPerUser} per user</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">No ticket types available for this event.</p>
              </div>
            )}

            {/* Quantity Selection */}
            {selectedTicketType && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={selectedTicketType ? 
                    Math.min(
                      event.ticketTypes.find(t => t._id === selectedTicketType)?.available || 1,
                      event.ticketTypes.find(t => t._id === selectedTicketType)?.maxPerUser || 1
                    ) : 1
                  }
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Total Price */}
            {selectedTicketType && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total:</span>
                  <span className="text-xl font-bold text-green-600">
                    ${(event.ticketTypes.find(t => t._id === selectedTicketType)?.price || 0) * quantity}
                  </span>
                </div>
              </div>
            )}

            {/* Book Button */}
            <button
              onClick={handleBooking}
              disabled={!selectedTicketType || booking || (event.ticketTypes.length === 0)}
              className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                selectedTicketType && !booking && event.ticketTypes.length > 0
                  ? 'bg-[#005D78] hover:bg-[#004D68]' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {booking ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookEvent;