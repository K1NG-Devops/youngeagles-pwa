import React, { useState, useEffect } from 'react';
import { FaComments } from 'react-icons/fa';
import messagingService from '../services/messagingService';
import useAuth from '../hooks/useAuth';
import { toast } from 'react-toastify';

// Import messaging components
import ConversationList from './MessagingSystem/ConversationList';
import MessageThread from './MessagingSystem/MessageThread';
import ContactPicker from './MessagingSystem/ContactPicker';

const MessagingCenter = () => {
  const [currentView, setCurrentView] = useState('conversations'); // 'conversations', 'thread', 'contacts'
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    initializeMessaging();
    setupEventListeners();
    
    return () => {
      // Cleanup listeners
      messagingService.off('unreadCountUpdated', handleUnreadCountUpdated);
    };
  }, []);

  const initializeMessaging = async () => {
    try {
      // Initialize messaging service if not already done
      if (!messagingService.isInitialized && user) {
        await messagingService.initialize(user.id, user.role);
      }
      
      // Load initial unread count
      const unread = await messagingService.getUnreadCount();
      setUnreadCount(unread.unreadCount || 0);
      
    } catch (error) {
      console.error('Failed to initialize messaging:', error);
    }
  };

  const setupEventListeners = () => {
    messagingService.on('unreadCountUpdated', handleUnreadCountUpdated);
  };

  const handleUnreadCountUpdated = (data) => {
    setUnreadCount(data.unreadCount || 0);
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    setCurrentView('thread');
  };

  const handleBackToConversations = () => {
    setCurrentView('conversations');
    setSelectedConversation(null);
  };

  const handleNewMessage = () => {
    setCurrentView('contacts');
  };

  const handleBackFromContacts = () => {
    setCurrentView('conversations');
  };

  const handleConversationCreated = (conversation) => {
    // Navigate to the new conversation
    setSelectedConversation(conversation);
    setCurrentView('thread');
    toast.success('Conversation started successfully!');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'thread':
        return (
          <MessageThread
            conversation={selectedConversation}
            onBack={handleBackToConversations}
          />
        );
      
      case 'contacts':
        return (
          <ContactPicker
            onBack={handleBackFromContacts}
            onConversationCreated={handleConversationCreated}
          />
        );
      
      case 'conversations':
      default:
        return (
          <ConversationList
            onConversationSelect={handleConversationSelect}
            onNewMessage={handleNewMessage}
          />
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white shadow-lg">
        <div className="flex items-center space-x-3">
          <FaComments className="w-6 h-6" />
          <div className="flex-1">
            <h1 className="text-xl font-bold">
              {currentView === 'thread' && selectedConversation ? 'Conversation' :
               currentView === 'contacts' ? 'New Message' :
               'Messages'}
            </h1>
            <p className="text-sm text-indigo-100">
              {currentView === 'thread' ? 'Chat in real-time' :
               currentView === 'contacts' ? 'Choose who to message' :
               'Stay connected with your school community'}
            </p>
          </div>
          {unreadCount > 0 && currentView === 'conversations' && (
            <div className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[24px] text-center">
              {unreadCount}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <div className="h-full">
          {renderCurrentView()}
        </div>
      </div>
    </div>
  );
};

export default MessagingCenter;
