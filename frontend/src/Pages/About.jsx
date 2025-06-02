import React from 'react';
import { FiCalendar, FiUsers, FiCheckCircle, FiStar, FiAward } from 'react-icons/fi';

const About = () => {
  const primaryColor = '#004A65';
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#004A65] to-[#0077a3] rounded-xl shadow-lg overflow-hidden">
        <div className="p-8 md:p-12 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">A Fresh Approach to Event Management</h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl">
            Built on years of event industry experience, we're launching a better way to book and manage events
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <p className="text-gray-600 text-lg mb-6">
            After years in the event industry, we recognized the need for a simpler, more transparent platform. 
            EventHub is our answer - combining deep industry knowledge with fresh technology to create the best 
            event booking experience.
          </p>
          <div className="flex items-center space-x-4">
            <FiAward className="text-[#004A65] text-2xl" />
            <span className="font-medium">Founded by event professionals with 15+ years combined experience</span>
          </div>
        </div>
        <div className="bg-gray-100 rounded-xl h-80 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Event planning" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Features Section */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center">What Makes Us Different</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <FiCalendar className="text-[#004A65] text-3xl" />,
              title: "Industry-Designed",
              description: "Built by event professionals who understand your real needs and pain points"
            },
            {
              icon: <FiUsers className="text-[#004A65] text-3xl" />,
              title: "Community First",
              description: "We're growing with our users, prioritizing features that matter most to you"
            },
            {
              icon: <FiCheckCircle className="text-[#004A65] text-3xl" />,
              title: "No Legacy Baggage",
              description: "Modern infrastructure means faster, more reliable service from day one"
            }
          ].map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Our Approach Section */}
      <div className="bg-[#f5f9fa] rounded-xl p-8" style={{ border: `1px solid ${primaryColor}20` }}>
        <h2 className="text-3xl font-bold text-center mb-8" style={{ color: primaryColor }}>Our Approach</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Quality Over Quantity",
              content: "We're carefully onboarding venues and organizers to ensure excellent experiences"
            },
            {
              title: "Transparent Pricing",
              content: "No hidden fees - you'll always know exactly what you're paying for"
            },
            {
              title: "Continuous Improvement",
              content: "We're listening to our early users to shape the platform's future"
            }
          ].map((item, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-xl font-semibold" style={{ color: primaryColor }}>{item.title}</h3>
              <p className="text-gray-600">{item.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Early Adopters Section */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center">Our First Supporters</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              quote: "Excited to be part of EventHub's journey from the beginning. The team really understands event organizers' needs.",
              author: "Alex Morgan, Conference Organizer",
              rating: 5
            },
            {
              quote: "The clean interface and fair pricing convinced me to try this new platform. So far, so good!",
              author: "Priya Patel, Wedding Planner",
              rating: 4
            }
          ].map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <FiStar 
                    key={i} 
                    className={`${i < testimonial.rating ? 'text-[#004A65]' : 'text-gray-300'} text-lg`} 
                  />
                ))}
              </div>
              <blockquote className="text-gray-600 italic mb-4">"{testimonial.quote}"</blockquote>
              <p className="text-gray-800 font-medium">{testimonial.author}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[#004A65] to-[#0077a3] rounded-xl p-8 text-center text-white">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Join Us From the Beginning</h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          As an early user, you'll help shape the future of EventHub while enjoying special founding member benefits.
        </p>
        <div className="space-x-4">
          <button 
            className="bg-white px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors" 
            style={{ color: primaryColor }}
          >
            List Your Event
          </button>
          <button className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors">
            Browse Events
          </button>
        </div>
      </div>
    </div>
  );
};

export default About;