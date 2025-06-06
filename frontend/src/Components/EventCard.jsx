// src/Components/EventCard.jsx
import React from 'react';
import { FiCalendar, FiClock, FiMapPin, FiHeart } from 'react-icons/fi';

const EventCard = ({ event, likedEvents, onLike, onBook }) => {
  const formattedDate = new Date(event.startTime).toLocaleDateString();
  const startTime = new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endTime = new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <img
          src={event.image || '/default-event.jpg'}
          alt={event.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <button
          onClick={() => onLike(event._id)}
          className="absolute top-3 right-3 p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
          aria-label="Like event"
        >
          <FiHeart
            size={20}
            className={`transition-colors ${
              likedEvents.includes(event._id)
                ? 'text-[#005D78] fill-current'
                : 'text-gray-600'
            }`}
          />
        </button>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h4 className="font-semibold text-lg text-gray-900 mb-1">{event.title}</h4>
        <p className="text-sm text-gray-500 mb-1">{event.category}</p>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>

        <div className="space-y-2 mb-4 text-sm text-gray-600">
          <div className="flex items-center">
            <FiCalendar className="mr-2 flex-shrink-0" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center">
            <FiClock className="mr-2 flex-shrink-0" />
            <span>{startTime} - {endTime}</span>
          </div>
          <div className="flex items-center">
            <FiMapPin className="mr-2 flex-shrink-0" />
            <span>{event.location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-200">
          {event.ticketTypes.length > 0 && (  //yaha lagega question mark
            <span className="text-lg font-semibold text-green-600">
              ${event.ticketTypes[0].price}
            </span>
          )}
          <button 
            onClick={() => onBook(event._id)}
            className="px-4 py-2 bg-[#005D78] text-white rounded-lg hover:bg-[#004D68] transition-colors text-sm font-medium"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;