import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import { useTheme } from '../contexts/ThemeContext';
import { FaCalendarAlt, FaBell, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import { HeaderAd, ContentAd, FooterAd } from '../components/ads/AdComponents';

const Events = () => {
  const { isDark } = useTheme();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await apiService.events.getAll();
        setEvents(response.data.events || []);
      } catch (error) {
        console.error('Events API not available:', error);
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const getEventIcon = (type) => {
    switch (type) {
    case 'meeting': return FaCalendarAlt;
    case 'event': return FaCalendarAlt;
    case 'exhibition': return FaBell;
    case 'holiday': return FaClock;
    default: return FaCalendarAlt;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
    case 'high': return isDark ? 'text-red-400 bg-red-900/20 border-red-800' : 'text-red-600 bg-red-50 border-red-200';
    case 'medium': return isDark ? 'text-yellow-400 bg-yellow-900/20 border-yellow-800' : 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'low': return isDark ? 'text-green-400 bg-green-900/20 border-green-800' : 'text-green-600 bg-green-50 border-green-200';
    default: return isDark ? 'text-blue-400 bg-blue-900/20 border-blue-800' : 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen mt-18 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}  

      <div className="p-4 space-y-4 -mt-1">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-2xl">
          <h1 className="text-2xl font-bold mb-1">📅 Events & Calendar</h1>
          <p className="text-purple-100 text-sm">Stay updated with school events and important dates</p>
        </div>

        {/* Header Ad */}
        <HeaderAd />

        {/* Content Ad */}
        <ContentAd />

        {events.length === 0 ? (
          <div className={`p-6 text-center rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <FaCalendarAlt className={`text-4xl mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-300'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No Upcoming Events</h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Check back later for new events and announcements.</p>
          </div>
        ) : (
          events.map((event, index) => {
            const IconComponent = getEventIcon(event.type);
            return (
              <React.Fragment key={event.id}>
                <div className={`p-4 rounded-xl shadow-sm border transition-all hover:shadow-md ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getPriorityColor(event.priority)}`}>
                        <IconComponent className="text-lg" />
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{event.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(event.priority)}`}>
                          {event.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center space-x-2">
                      <FaCalendarAlt className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{formatDate(event.date)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <FaClock className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{event.time}</span>
                    </div>
                    
                    {event.location !== 'N/A' && (
                      <div className="flex items-center space-x-2">
                        <FaMapMarkerAlt className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{event.location}</span>
                      </div>
                    )}
                  </div>
                  
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>{event.description}</p>
                </div>

                {/* Content Ad after every 4th event */}
                {(index + 1) % 4 === 0 && index < events.length - 1 && (
                  <ContentAd />
                )}
              </React.Fragment>
            );
          })
        )}
        
        {/* Footer Ad */}
        <FooterAd />

        {/* Admin Updates Section */}
        <div className={`p-4 rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center space-x-2 mb-3">
            <FaBell className={`text-lg ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Admin Updates</h3>
          </div>
          <div className={`p-3 rounded-lg border ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
            <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
              📢 <strong>Reminder:</strong> School fees for the new term are due by January 31st. Please submit your payment proofs through the app.
            </p>
          </div>
        </div>

        {/* Bottom Rectangle Ad - Removed to improve user experience */}
      </div>
    </div>
  );
};

export default Events;
