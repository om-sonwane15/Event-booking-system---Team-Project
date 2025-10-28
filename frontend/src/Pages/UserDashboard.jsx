import React, { useState, useEffect } from 'react';
import { FiSearch, FiCalendar, FiLoader } from 'react-icons/fi';
import Events from "../Pages/Events";

const UserDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [likedEvents, setLikedEvents] = useState(new Set());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = ['All', 'Conference', 'Workshop', 'Meetup', 'Seminar', 'Other'];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        // Construct proper API URL
        const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'https://event-testing-team.up.railway.app')
          .replace(/\/$/, ''); // Remove trailing slash
        
        const response = await fetch(`${baseUrl}/events`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Handle non-200 responses
        if (!response.ok) {
          // Clone response for error handling
          const errorResponse = response.clone();
          let errorMessage = `Request failed with status ${response.status}`;
          
          try {
            const errorData = await errorResponse.json();
            errorMessage = errorData.message || errorData.msg || errorMessage;
          } catch (e) {
            const text = await errorResponse.text();
            if (text) errorMessage = text;
          }
          
          throw new Error(errorMessage);
        }

        // Process successful response
        const backendEvents = await response.json();
        const transformed = backendEvents.map(event => ({
          id: event._id,
          title: event.title,
          category: event.type,
          image: event.image ? `${baseUrl}/${event.image}` : '',
          genre: event.type,
          date: new Date(event.date).toLocaleDateString('en-CA'),
          time: new Date(event.date).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          }),
          venue: event.location,
          location: event.location,
          price: event.price === 0 ? 'Free' : `₹${event.price}`,
          description: event.description
        }));

        setEvents(transformed);
      } catch (err) {
        console.error('Event fetch error:', err);
        setError(err.message || 'Failed to load events. Please try again later.');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleLike = (id) => {
    const updated = new Set(likedEvents);
    updated.has(id) ? updated.delete(id) : updated.add(id);
    setLikedEvents(updated);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#005c78] via-[#004D68] to-[#003D58] text-white py-12 text-center">
        <h2 className="text-4xl font-bold mb-4">Discover Amazing Events</h2>
        <p className="text-xl opacity-90">Book tickets for conferences, workshops, meetups & more</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search & Filter */}
        <div className="mb-6 flex flex-col gap-4">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005D78] focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-[#005D78] text-white shadow-md'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <FiLoader className="animate-spin mr-2 text-[#005D78]" size={24} />
            <span className="text-lg text-gray-600">Loading events...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-semibold">Error loading events</h3>
            </div>
            <p className="mt-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Events List */}
        {!loading && !error && filteredEvents.length > 0 && (
          <Events
            events={filteredEvents}
            likedEvents={likedEvents}
            handleLike={handleLike}
          />
        )}

        {/* Empty State */}
        {!loading && filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <FiCalendar size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-500 text-lg mb-4">Try changing your search or category filter.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="px-4 py-2 bg-[#005D78] text-white rounded-md hover:bg-[#004D68] transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
