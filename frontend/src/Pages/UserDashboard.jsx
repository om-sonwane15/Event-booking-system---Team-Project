import React, { useState } from 'react';
import { 
  FiSearch, 
  FiHeart, 
  FiMapPin, 
  FiCalendar, 
  FiClock, 
  FiStar,
  FiFilter,
  FiGrid,
  FiList
} from 'react-icons/fi';

const UserDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [likedEvents, setLikedEvents] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid');

  const categories = ['All', 'Movies', 'Events', 'Plays', 'Sports', 'Activities'];

  const events = [
    {
      id: 1,
      title: 'Avengers: Endgame',
      category: 'Movies',
      image: 'https://images.unsplash.com/photo-1489599243109-f81640a4b40b?w=400&h=600&fit=crop',
      rating: 8.4,
      votes: '2.1M',
      genre: 'Action, Adventure',
      language: 'English',
      date: '2025-06-15',
      time: '7:00 PM',
      venue: 'PVR Cinemas',
      location: 'Mumbai',
      price: '₹250'
    },
    {
      id: 2,
      title: 'Stand-up Comedy Night',
      category: 'Events',
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=600&fit=crop',
      rating: 9.2,
      votes: '12.5K',
      genre: 'Comedy',
      language: 'Hindi',
      date: '2025-06-18',
      time: '8:30 PM',
      venue: 'Comedy Club',
      location: 'Delhi',
      price: '₹800'
    },
    {
      id: 3,
      title: 'Rock Concert',
      category: 'Events',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',
      rating: 8.8,
      votes: '45.2K',
      genre: 'Music, Rock',
      language: 'English',
      date: '2025-06-20',
      time: '9:00 PM',
      venue: 'DY Patil Stadium',
      location: 'Mumbai',
      price: '₹1200'
    },
    {
      id: 4,
      title: 'Art Exhibition',
      category: 'Activities',
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=600&fit=crop',
      rating: 7.6,
      votes: '8.9K',
      genre: 'Art, Culture',
      language: 'Multi',
      date: '2025-06-22',
      time: '10:00 AM',
      venue: 'National Gallery',
      location: 'Delhi',
      price: '₹150'
    },
    {
      id: 5,
      title: 'Football Match',
      category: 'Sports',
      image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=600&fit=crop',
      rating: 8.1,
      votes: '156K',
      genre: 'Sports, Football',
      language: 'English',
      date: '2025-06-25',
      time: '5:00 PM',
      venue: 'Salt Lake Stadium',
      location: 'Kolkata',
      price: '₹500'
    },
    {
      id: 6,
      title: 'Theater Play',
      category: 'Plays',
      image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=400&h=600&fit=crop',
      rating: 8.9,
      votes: '21.3K',
      genre: 'Drama, Theater',
      language: 'Hindi',
      date: '2025-06-28',
      time: '7:30 PM',
      venue: 'Prithvi Theatre',
      location: 'Mumbai',
      price: '₹400'
    }
  ];

  const handleLike = (eventId) => {
    const newLikedEvents = new Set(likedEvents);
    if (newLikedEvents.has(eventId)) {
      newLikedEvents.delete(eventId);
    } else {
      newLikedEvents.add(eventId);
    }
    setLikedEvents(newLikedEvents);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#005D78] via-[#004D68] to-[#003D58] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Discover Amazing Events</h2>
          <p className="text-xl opacity-90">Book tickets for movies, events, plays, sports & activities</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h3 className="text-2xl font-bold text-gray-900">
              {selectedCategory === 'All' ? 'All Events' : selectedCategory}
            </h3>
            <span className="text-gray-500">({filteredEvents.length} events)</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
              <FiFilter size={20} />
            </button>
            <div className="flex border border-gray-300 rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'} cursor-pointer`}
              >
                <FiGrid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'} cursor-pointer`}
              >
                <FiList size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {filteredEvents.map(event => (
            <div 
              key={event.id} 
              className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer ${
                viewMode === 'list' ? 'flex' : ''
              }`}
            >
              <div className={viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}>
                <div className="relative">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className={`object-cover ${
                      viewMode === 'list' ? 'w-full h-64' : 'w-full h-80'
                    }`}
                  />
                  <button
                    onClick={() => handleLike(event.id)}
                    className="absolute top-3 right-3 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all cursor-pointer"
                  >
                    <FiHeart 
                      size={20} 
                      className={likedEvents.has(event.id) ? 'text-[#005D78] fill-current' : 'text-gray-600'}
                    />
                  </button>
                  <div className="absolute bottom-3 left-3 flex items-center space-x-1 bg-black bg-opacity-70 text-white px-2 py-1 rounded">
                    <FiStar size={14} className="text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{event.rating}/10</span>
                    <span className="text-xs opacity-80">{event.votes} Votes</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 flex-1">
                <h4 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{event.title}</h4>
                <p className="text-gray-600 text-sm mb-2">{event.genre}</p>
                <p className="text-gray-500 text-sm mb-3">{event.language}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <FiCalendar size={16} className="mr-2" />
                    {event.date}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FiClock size={16} className="mr-2" />
                    {event.time}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FiMapPin size={16} className="mr-2" />
                    {event.venue}, {event.location}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-green-600">{event.price}</span>
                  <button className="px-4 py-2 bg-[#005D78] text-white rounded-md hover:bg-[#004D68] transition-colors text-sm font-medium cursor-pointer">
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No events found matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;