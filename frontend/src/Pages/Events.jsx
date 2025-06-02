import React from 'react';
import { FiCalendar, FiClock, FiMapPin, FiHeart } from 'react-icons/fi';

const Events = ({ events, likedEvents, handleLike }) => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {events.map(event => (
          <div
            key={event.id}
            className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
          >
            <div className="relative w-full aspect-[4/3] overflow-hidden">
              <img
                src={event.image || 'https://images.unsplash.com/photo-1489599243109-f81640a4b40b?w=400&h=300&fit=crop'}
                alt={event.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1489599243109-f81640a4b40b?w=400&h=300&fit=crop';
                }}
                loading="lazy"
              />
              <button
                onClick={() => handleLike(event.id)}
                className="absolute top-3 right-3 p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                aria-label="Like event"
              >
                <FiHeart
                  size={20}
                  className={`transition-colors ${
                    likedEvents.has(event.id)
                      ? 'text-[#005D78] fill-current'
                      : 'text-gray-600'
                  }`}
                />
              </button>
            </div>

            <div className="p-4 flex flex-col flex-1">
              <h4 className="font-semibold text-lg text-gray-900 mb-1">{event.title}</h4>
              <p className="text-sm text-gray-500 mb-1">{event.genre}</p>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>

              <div className="space-y-2 mb-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <FiCalendar className="mr-2 flex-shrink-0" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center">
                  <FiClock className="mr-2 flex-shrink-0" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center">
                  <FiMapPin className="mr-2 flex-shrink-0" />
                  <span>{event.venue}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-200">
                <span className="text-lg font-semibold text-green-600">{event.price}</span>
                <button className="px-4 py-2 bg-[#005D78] text-white rounded-lg hover:bg-[#004D68] transition-colors text-sm font-medium">
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Events;