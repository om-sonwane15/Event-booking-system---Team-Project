import React, { useState, useEffect } from 'react';
import { FiSearch, FiCalendar, FiLoader, FiBarChart2, FiTrendingUp } from 'react-icons/fi';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Events from '../pages/Events';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const UserDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [likedEvents, setLikedEvents] = useState(new Set());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Chart-related states
  const [showCharts, setShowCharts] = useState(false);
  const [chartFilter, setChartFilter] = useState('total-users');
  const [users, setUsers] = useState([]);
  const [chartData, setChartData] = useState({});

  const categories = ['All', 'Conference', 'Workshop', 'Meetup', 'Seminar', 'Other'];
  const chartFilters = [
    { value: 'total-users', label: 'Total Users (Excluding Admin)' },
    { value: 'events-timeline', label: 'Events in Time Period' },
    { value: 'event-status', label: 'Past vs Live Events' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'https://event-testing-team.up.railway.app')
          .replace(/\/$/, '');
        
        // Fetch events
        const eventsResponse = await fetch(`${baseUrl}/events`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!eventsResponse.ok) {
          throw new Error(`Events request failed with status ${eventsResponse.status}`);
        }

        const backendEvents = await eventsResponse.json();
        
        // Transform events data
        const transformed = backendEvents.map(event => ({
          id: event._id,
          title: event.title,
          category: event.type,
          image: event.image,
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
          description: event.description,
          rawDate: new Date(event.date)
        }));

        setEvents(transformed);

        // Fetch users data (you may need to adjust the endpoint)
        try {
          const usersResponse = await fetch(`${baseUrl}/users`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            setUsers(usersData.filter(user => user.role !== 'admin'));
          }
        } catch (userError) {
          console.warn('Could not fetch users data:', userError);
        }

      } catch (err) {
        console.error('Data fetch error:', err);
        setError(err.message || 'Failed to load data. Please try again later.');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Generate chart data based on selected filter
  useEffect(() => {
    if (!events.length && chartFilter !== 'total-users') return;

    const generateChartData = () => {
      const now = new Date();
      
      switch (chartFilter) {
        case 'total-users':
          // Generate mock user growth data (replace with real data)
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
          const userCounts = [12, 19, 25, 32, 45, users.length || 52];
          
          return {
            line: {
              labels: months,
              datasets: [{
                label: 'User Growth',
                data: userCounts,
                borderColor: '#005D78',
                backgroundColor: 'rgba(0, 93, 120, 0.1)',
                tension: 0.4,
                fill: true
              }]
            },
            bar: {
              labels: months,
              datasets: [{
                label: 'New Users',
                data: [12, 7, 6, 7, 13, 7],
                backgroundColor: '#005D78',
                borderRadius: 4
              }]
            }
          };

        case 'events-timeline':
          // Group events by month
          const eventsByMonth = {};
          events.forEach(event => {
            const month = event.rawDate.toLocaleDateString('en-US', { month: 'short' });
            eventsByMonth[month] = (eventsByMonth[month] || 0) + 1;
          });

          const timelineLabels = Object.keys(eventsByMonth);
          const timelineData = Object.values(eventsByMonth);

          return {
            line: {
              labels: timelineLabels,
              datasets: [{
                label: 'Events Timeline',
                data: timelineData,
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true
              }]
            },
            bar: {
              labels: timelineLabels,
              datasets: [{
                label: 'Events Count',
                data: timelineData,
                backgroundColor: '#10B981',
                borderRadius: 4
              }]
            }
          };

        case 'event-status':
          const pastEvents = events.filter(event => event.rawDate < now).length;
          const liveEvents = events.filter(event => event.rawDate >= now).length;

          return {
            line: {
              labels: ['Past Events', 'Upcoming Events'],
              datasets: [{
                label: 'Event Status',
                data: [pastEvents, liveEvents],
                borderColor: '#F59E0B',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                tension: 0.4,
                fill: true
              }]
            },
            bar: {
              labels: ['Past Events', 'Upcoming Events'],
              datasets: [{
                label: 'Event Count',
                data: [pastEvents, liveEvents],
                backgroundColor: ['#EF4444', '#10B981'],
                borderRadius: 4
              }]
            }
          };

        default:
          return {};
      }
    };

    setChartData(generateChartData());
  }, [events, users, chartFilter]);

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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: chartFilters.find(f => f.value === chartFilter)?.label || 'Chart'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#005c78] via-[#004D68] to-[#003D58] text-white py-12 text-center">
        <h2 className="text-4xl font-bold mb-4">Discover Amazing Events</h2>
        <p className="text-xl opacity-90">Book tickets for conferences, workshops, meetups & more</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Charts Toggle */}
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => setShowCharts(!showCharts)}
            className="flex items-center px-4 py-2 bg-[#005D78] text-white rounded-md hover:bg-[#004D68] transition-colors"
          >
            {showCharts ? <FiBarChart2 className="mr-2" /> : <FiTrendingUp className="mr-2" />}
            {showCharts ? 'Hide Analytics' : 'Show Analytics'}
          </button>
        </div>

        {/* Charts Section */}
        {showCharts && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Analytics Filter
              </label>
              <select
                value={chartFilter}
                onChange={(e) => setChartFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005D78] focus:border-transparent"
              >
                {chartFilters.map(filter => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Line Chart */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <FiTrendingUp className="mr-2" />
                  Trend Analysis
                </h3>
                <div className="h-64">
                  {chartData.line && (
                    <Line data={chartData.line} options={chartOptions} />
                  )}
                </div>
              </div>

              {/* Bar Chart */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <FiBarChart2 className="mr-2" />
                  Distribution Analysis
                </h3>
                <div className="h-64">
                  {chartData.bar && (
                    <Bar data={chartData.bar} options={chartOptions} />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

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