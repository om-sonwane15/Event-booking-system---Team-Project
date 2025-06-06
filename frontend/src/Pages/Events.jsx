// src/pages/Events.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EventList from '../Components/EventList';
import CreateEventButton from '../Components/CreateEventButton';
import axiosInstance from '../utils/axiosInstance';
import { FiSearch, FiFilter } from 'react-icons/fi';

const Events = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch published events
        const eventsResponse = await axiosInstance.get('/events/published-events');
        const eventsData = eventsResponse.data.events || [];
        setEvents(eventsData);
        
        // Extract unique categories from events
        const uniqueCategories = [...new Set(eventsData.map(event => event.category).filter(Boolean))];
        setCategories(uniqueCategories);
        
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBook = (eventId) => {
    navigate(`/book-event/${eventId}`);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#005D78]"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#005D78] to-[#004D68] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Discover Amazing Events
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
            Find and book tickets for the best events in your area. From concerts to conferences, 
            workshops to exhibitions - discover experiences that matter to you.
          </p>
          <div className="flex justify-center">
            <CreateEventButton />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Browse through our collection of exciting events and book your tickets today
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search events by title or description..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005D78] focus:border-transparent transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Category Filter */}
            <div className="relative min-w-[200px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiFilter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005D78] focus:border-transparent appearance-none bg-white transition-colors"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Clear Filters Button */}
            {(searchQuery || categoryFilter) && (
              <button
                onClick={handleClearFilters}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium whitespace-nowrap"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Active Filters Display */}
          {(searchQuery || categoryFilter) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-gray-600 font-medium">Active filters:</span>
                {searchQuery && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#005D78] text-white">
                    Search: "{searchQuery}"
                  </span>
                )}
                {categoryFilter && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Category: {categoryFilter}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Event List */}
        <EventList 
          events={events}
          onBook={handleBook}
          searchQuery={searchQuery}
          categoryFilter={categoryFilter}
        />
      </div>
    </div>
  );
};

export default Events;