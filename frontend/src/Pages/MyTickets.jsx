import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axiosInstance.get('/events/my-tickets');
        setTickets(response.data);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to fetch your tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const handleCancel = async (bookingId) => {
    try {
      await axiosInstance.post(`/events/cancel-booking/${bookingId}`);
      setTickets(tickets.filter(ticket => ticket.bookingId !== bookingId));
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to cancel booking');
    }
  };

  if (loading) return <div className="text-center py-8">Loading your tickets...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Tickets</h1>
      
      {tickets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">You don't have any tickets yet.</p>
          <button
            onClick={() => navigate('/events')}
            className="px-4 py-2 bg-[#005D78] text-white rounded-lg hover:bg-[#004D68]"
          >
            Browse Events
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {tickets.map(ticket => (
            <div key={ticket.bookingId} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3">
                  <img
                    src={ticket.eventImage || '/default-event.jpg'}
                    alt={ticket.eventTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 md:w-2/3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-1">{ticket.eventTitle}</h2>
                      <p className="text-gray-600 mb-2">
                        {new Date(ticket.startTime).toLocaleDateString()} •{' '}
                        {new Date(ticket.startTime).toLocaleTimeString()} -{' '}
                        {new Date(ticket.endTime).toLocaleTimeString()}
                      </p>
                      <p className="text-gray-600 mb-4">{ticket.location}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      ticket.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{ticket.ticketType?.name}</p>
                        <p className="text-gray-600">
                          {ticket.tickets} ticket{ticket.tickets > 1 ? 's' : ''} • ${ticket.ticketType?.price * ticket.tickets}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          Booked on {new Date(ticket.bookedAt).toLocaleDateString()}
                        </p>
                      </div>
                      {new Date(ticket.startTime) > new Date() && ticket.status === 'confirmed' && (
                        <button
                          onClick={() => handleCancel(ticket.bookingId)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTickets;