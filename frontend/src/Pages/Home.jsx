import React from 'react';
import { FiCalendar, FiMapPin, FiUsers, FiCheckCircle, FiStar, FiArrowRight } from 'react-icons/fi';

const HomePage = () => {
  const primaryColor = '#004A65';
  const secondaryColor = '#0077a3';

  return (
    <div className="min-h-screen bg-white">
     {/* Minimal Hero Section */}
<div className="relative bg-white">
  <div className="max-w-7xl mx-auto px-4 py-24 md:py-32">
    <div className="text-center max-w-3xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
        Discover & Book Events
      </h1>
      <p className="text-lg md:text-xl text-gray-600 mb-8">
        From corporate seminars to music festivals — find and book events effortlessly
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button className="bg-[#004A65] text-white px-6 py-3 rounded-md font-medium hover:bg-[#003850] transition-colors">
          Browse Events
        </button>
        <button className="border border-[#004A65] text-[#004A65] px-6 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors">
          List Your Event
        </button>
      </div>
    </div>
  </div>

  {/* Simple divider */}
  <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200 max-w-5xl mx-auto"></div>
</div>

      {/* Event Categories */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ color: primaryColor }}>Explore Event Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: "Corporate", icon: <FiUsers size={24} /> },
            { name: "Seminars", icon: <FiCheckCircle size={24} /> },
            { name: "Parties", icon: <FiStar size={24} /> },
            { name: "Bootcamps", icon: <FiCalendar size={24} /> },
            { name: "Movies", icon: <FiMapPin size={24} /> },
            { name: "Get Togethers", icon: <FiUsers size={24} /> },
            { name: "Music", icon: <FiStar size={24} /> },
            { name: "Workshops", icon: <FiCheckCircle size={24} /> }
          ].map((category, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 hover:border-[#004A65]/20 flex flex-col items-center"
            >
              <div className="text-[#004A65] mb-3">{category.icon}</div>
              <h3 className="font-semibold text-gray-800">{category.name}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-[#f5f9fa] py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: primaryColor }}>How EventHub Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Discover Events",
                description: "Browse our curated selection of events across all categories",
                icon: <FiMapPin className="text-[#004A65]" size={32} />
              },
              {
                step: "2",
                title: "Book Seamlessly",
                description: "Secure your spot with our simple booking process",
                icon: <FiCheckCircle className="text-[#004A65]" size={32} />
              },
              {
                step: "3",
                title: "Enjoy the Experience",
                description: "Receive confirmation and event details instantly",
                icon: <FiStar className="text-[#004A65]" size={32} />
              }
            ].map((item, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#004A65] text-white font-bold text-xl mr-4">
                    {item.step}
                  </div>
                  <div className="text-2xl">{item.icon}</div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Events */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold" style={{ color: primaryColor }}>Featured Events</h2>
          <button className="text-[#004A65] font-semibold hover:underline flex items-center">
            View All <FiArrowRight className="ml-2" />
          </button>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100">
              <div className="h-48 bg-gray-200 relative">
                {/* Placeholder for event image */}
                <div className="absolute top-4 left-4 bg-[#004A65] text-white px-3 py-1 rounded-full text-sm font-medium">
                  {item === 1 ? 'Corporate' : item === 2 ? 'Music' : 'Workshop'}
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2 text-gray-800">
                  {item === 1 ? 'Tech Leadership Summit' : item === 2 ? 'Summer Music Festival' : 'UX Design Workshop'}
                </h3>
                <div className="flex items-center text-gray-600 mb-3">
                  <FiMapPin className="mr-2" /> 
                  {item === 1 ? 'Convention Center' : item === 2 ? 'Central Park' : 'Creative Hub'}
                </div>
                <div className="flex items-center text-gray-600 mb-4">
                  <FiCalendar className="mr-2" /> 
                  {item === 1 ? 'June 15, 2023' : item === 2 ? 'July 22, 2023' : 'August 5, 2023'}
                </div>
                <button className="w-full bg-[#004A65] hover:bg-[#003850] text-white py-2 rounded-lg font-medium transition-colors">
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[#004A65] to-[#0077a3] py-20">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Find Your Next Experience?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join our growing community of event organizers and attendees
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-[#004A65] px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all">
              Browse Events
            </button>
            <button className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white/10 transition-all">
              List Your Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;