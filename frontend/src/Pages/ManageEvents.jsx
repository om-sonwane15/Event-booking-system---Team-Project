import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { Link, useNavigate } from 'react-router-dom';

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axiosInstance.get('/events/my-events');
        setEvents(response.data);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to fetch your events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handlePublish = async (eventId, currentStatus) => {
    try {
      await axiosInstance.put(`/events/edit-event/${eventId}`, {
        isPublished: !currentStatus
      });
      setEvents(events.map(event => 
        event._id === eventId 
          ? { ...event, isPublished: !currentStatus } 
          : event
      ));
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update event status');
    }
  };

  const handleCancel = async (eventId) => {
    try {
      await axiosInstance.delete(`/events/remove-event/${eventId}`);
      setEvents(events.filter(event => event._id !== eventId));
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to cancel event');
    }
  };

  if (loading) return <div className="text-center py-8">Loading your events...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Your Events</h1>
        <Link
          to="/create-event"
          className="px-4 py-2 bg-[#005D78] text-white rounded-lg hover:bg-[#004D68]"
        >
          Create New Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">You haven't created any events yet.</p>
          <Link
            to="/create-event"
            className="px-4 py-2 bg-[#005D78] text-white rounded-lg hover:bg-[#004D68]"
          >
            Create Your First Event
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Event</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Attendees</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {events.map(event => (
                <tr key={event._id}>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <img
                        src={event.image || '/default-event.jpg'}
                        alt={event.title}
                        className="w-16 h-16 object-cover rounded mr-4"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{event.title}</h3>
                        <p className="text-sm text-gray-500">{event.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {new Date(event.startTime).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      event.cancelled 
                        ? 'bg-red-100 text-red-800' 
                        : event.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {event.cancelled ? 'Cancelled' : event.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {event.attendees.length} / {event.maxAttendees}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => navigate(`/edit-event/${event._id}`)}
                        className="p-2 text-gray-600 hover:text-[#005D78]"
                        disabled={event.cancelled}
                      >
                        Edit
                      </button>
                      {!event.cancelled && (
                        <button
                          onClick={() => handlePublish(event._id, event.isPublished)}
                          className="p-2 text-gray-600 hover:text-[#005D78]"
                        >
                          {event.isPublished ? 'Unpublish' : 'Publish'}
                        </button>
                      )}
                      <button
                        onClick={() => handleCancel(event._id)}
                        className="p-2 text-gray-600 hover:text-red-600"
                        disabled={event.cancelled}
                      >
                        {event.attendees.length > 0 ? 'Cancel' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageEvents;