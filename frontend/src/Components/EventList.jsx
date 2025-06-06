// src/Components/EventList.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import EventCard from './EventCard';

const EventList = ({ events: initialEvents = [], onBook, searchQuery = '', categoryFilter = '' }) => {
  const [events, setEvents] = useState(initialEvents);
  const [loading, setLoading] = useState(!initialEvents.length);
  const [error, setError] = useState(null);
  const [likedEvents, setLikedEvents] = useState([]);

  useEffect(() => {
    if (initialEvents.length > 0) {
      setEvents(initialEvents);
      setLoading(false);
    } else {
      fetchEvents();
    }
  }, [initialEvents]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/events/published-events');
      setEvents(response.data.events || []);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (eventId) => {
    setLikedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId) 
        : [...prev, eventId]
    );
  };

  // Filter events with proper null checks
  const filteredEvents = events.filter(event => {
    if (!event) return false;
    
    const matchesSearch = searchQuery 
      ? (event.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
         event.description?.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
      
    const matchesCategory = categoryFilter 
      ? event.category?.toLowerCase() === categoryFilter.toLowerCase()
      : true;
      
    return matchesSearch && matchesCategory;
  });

  if (loading) return (
    <div className="text-center py-12">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#005D78]"></div>
      <p className="mt-2 text-gray-600">Loading events...</p>
    </div>
  );

  if (error) return (
    <div className="text-center py-8">
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 max-w-md mx-auto rounded">
        <p className="font-medium">Error loading events</p>
        <p className="text-sm mt-1">{error}</p>
        <button 
          onClick={fetchEvents}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm p-8">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || categoryFilter 
                ? "No events match your current search criteria. Try adjusting your filters."
                : "There are no events available at the moment. Check back later!"
              }
            </p>
            {(searchQuery || categoryFilter) && (
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-[#005D78] text-white rounded-lg hover:bg-[#004D68] transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Showing {filteredEvents.length} of {events.length} events
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredEvents.map(event => (
              <EventCard
                key={event._id}
                event={event}
                likedEvents={likedEvents}
                onLike={handleLike}
                onBook={onBook}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default EventList;