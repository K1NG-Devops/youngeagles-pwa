import React, { useState, useEffect } from 'react';
import { FaPaperPlane, FaUser, FaSpinner, FaArrowLeft, FaPlus, FaExclamationTriangle } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import messagingAPI from '../../services/messagingApi';

const SimpleMessaging = () => {
  const { auth } = useAuth();
  const user = auth?.user;
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('conversations'); // 'conversations', 'messages', 'contacts'
  const [contacts, setContacts] = useState([]);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Initialize messaging system and load conversations
  useEffect(() => {
    console.log('📱 SimpleMessaging component mounted');
    console.log('👤 Current user:', user);
    
    if (user && user.id) {
      initializeMessaging();
    }
  }, [user]);

  const initializeMessaging = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔄 Initializing messaging system...');

      // Initialize socket connection (non-blocking)
      try {
        await messagingAPI.initialize(user.id, user.role);
        console.log('✅ Socket initialized');
      } catch (socketError) {
        console.warn('⚠️ WebSocket initialization failed:', socketError);
        // Continue without real-time features
      }

      // Load conversations
      await loadConversations();

      // Setup real-time listeners (if socket available)
      if (messagingAPI.getStatus().socketConnected) {
        messagingAPI.on('new_message', handleNewMessage);
        messagingAPI.on('new_conversation', handleNewConversation);
        console.log('✅ Real-time listeners setup');
      }

    } catch (err) {
      console.error('❌ Error initializing messaging:', err);
      setError('Failed to initialize messaging system');
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversations = async () => {
    try {
      console.log('📥 Loading conversations...');
      const response = await messagingAPI.getConversations();
      
      if (response.success) {
        setConversations(response.conversations || []);
        console.log(`✅ Loaded ${response.conversations?.length || 0} conversations`);
      } else {
        console.error('❌ Failed to load conversations:', response.error);
        setError('Failed to load conversations');
        setConversations([]);
      }
    } catch (err) {
      console.error('❌ Error loading conversations:', err);
      setError('Failed to load conversations');
      setConversations([]);
    }
  };

  const handleNewMessage = (data) => {
    console.log('📨 New message received:', data);
    if (selectedConversation && data.conversationId === selectedConversation.id) {
      // Add message to current conversation
      setMessages(prev => [...prev, {
        id: data.messageId,
        content: data.content,
        senderName: data.senderName,
        senderType: data.senderRole,
        createdAt: data.createdAt,
        isOwn: false
      }]);
    }
    // Refresh conversations to update last message
    loadConversations();
  };

  const handleNewConversation = (data) => {
    console.log('💬 New conversation:', data);
    loadConversations();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation || sendingMessage) {
      return;
    }

    setSendingMessage(true);
    setError(null);

    try {
      console.log(`📤 Sending message to conversation ${selectedConversation.id}`);
      
      // Send message via API
      const response = await messagingAPI.sendMessage(
        selectedConversation.id, 
        newMessage.trim()
      );

      if (response.success) {
        // Add message to local state immediately
        const message = {
          id: response.messageId,
          content: newMessage.trim(),
          senderName: user?.name || 'You',
          senderType: user?.role,
          createdAt: new Date().toISOString(),
          isOwn: true
        };
        
        setMessages(prev => [...prev, message]);
        setNewMessage('');
        
        console.log('✅ Message sent successfully');

        // Try to send via socket for real-time updates
        messagingAPI.sendRealtimeMessage(selectedConversation.id, newMessage.trim());
      } else {
        console.error('❌ Failed to send message:', response.error);
        setError(`Failed to send message: ${response.error}`);
      }

    } catch (err) {
      console.error('❌ Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleConversationSelect = async (conversation) => {
    try {
      console.log('📖 Selecting conversation:', conversation.id);
      
      setSelectedConversation(conversation);
      setView('messages');
      setIsLoading(true);
      setError(null);
      
      // Join conversation room for real-time updates
      messagingAPI.joinConversation(conversation.id);
      
      // Load messages for this conversation
      const response = await messagingAPI.getMessages(conversation.id);
      
      if (response.success) {
        setMessages(response.messages || []);
        console.log(`✅ Loaded ${response.messages?.length || 0} messages`);
        
        // Mark conversation as read
        await messagingAPI.markConversationAsRead(conversation.id);
      } else {
        console.error('❌ Failed to load conversation:', response.error);
        setError(`Failed to load conversation: ${response.error}`);
        setMessages([]);
      }
      
    } catch (err) {
      console.error('❌ Error loading conversation:', err);
      setError('Failed to load conversation');
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewConversation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('👥 Loading contacts...');
      const response = await messagingAPI.getContacts();
      
      if (response.success) {
        setContacts(response.contacts || []);
        setView('contacts');
        console.log(`✅ Loaded ${response.contacts?.length || 0} contacts`);
      } else {
        console.error('❌ Failed to load contacts:', response.error);
        setError(`Failed to load contacts: ${response.error}`);
      }
    } catch (err) {
      console.error('❌ Error loading contacts:', err);
      setError('Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactSelect = async (contact) => {
    try {
      console.log('🆕 Starting conversation with:', contact.name);
      
      setIsLoading(true);
      setError(null);
      
      const subject = `Message to ${contact.name}`;
      const initialMessage = 'Hello!';
      
      const response = await messagingAPI.startConversation(
        contact.id,
        contact.type,
        subject,
        initialMessage
      );
      
      if (response.success) {
        console.log('✅ Conversation started successfully');
        
        // Refresh conversations and select the new one
        await loadConversations();
        
        // Find and select the new conversation
        const newConversation = {
          id: response.conversationId,
          otherParticipant: contact
        };
        
        await handleConversationSelect(newConversation);
      } else {
        console.error('❌ Failed to start conversation:', response.error);
        setError(`Failed to start conversation: ${response.error}`);
      }
      
    } catch (err) {
      console.error('❌ Error starting conversation:', err);
      setError('Failed to start conversation');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return 'Unknown time';
    }
  };

  const formatDate = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString();
      }
    } catch {
      return 'Unknown date';
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up messaging component');
      messagingAPI.off('new_message', handleNewMessage);
      messagingAPI.off('new_conversation', handleNewConversation);
      
      if (selectedConversation) {
        messagingAPI.leaveConversation(selectedConversation.id);
      }
    };
  }, [selectedConversation]);

  const renderConversationsList = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => window.history.back()}
              className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
            >
              <FaArrowLeft />
            </button>
            <div>
              <h1 className="text-lg font-bold">Messages</h1>
              <p className="text-sm text-blue-100">
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={handleStartNewConversation}
            className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <FaPlus />
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
          <div className="flex">
            <FaExclamationTriangle className="text-red-400 mr-3 mt-1" />
            <div>
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  if (user) initializeMessaging();
                }}
                className="text-sm text-red-600 hover:text-red-800 underline mt-1"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <FaSpinner className="animate-spin text-blue-600 text-xl" />
            <span className="ml-2 text-gray-600">Loading conversations...</span>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p className="mb-2">No conversations yet</p>
            <button
              onClick={handleStartNewConversation}
              className="text-blue-600 hover:underline"
              disabled={isLoading}
            >
              Start your first conversation
            </button>
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => handleConversationSelect(conversation)}
              className="p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {conversation.otherParticipant?.name || 'Unknown User'}
                  </h3>
                  <p className="text-sm text-gray-600 capitalize">
                    {conversation.otherParticipant?.type || 'Contact'}
                  </p>
                  {conversation.lastMessage && (
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {conversation.lastMessage}
                    </p>
                  )}
                </div>
                <div className="text-right ml-4">
                  {conversation.unreadCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 mb-1 inline-block">
                      {conversation.unreadCount}
                    </span>
                  )}
                  {conversation.lastMessageTime && (
                    <p className="text-xs text-gray-400">
                      {formatDate(conversation.lastMessageTime)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderContactsList = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setView('conversations')}
            className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
          >
            <FaArrowLeft />
          </button>
          <div>
            <h1 className="text-lg font-bold">New Message</h1>
            <p className="text-sm text-blue-100">Choose a contact</p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
          <div className="flex">
            <FaExclamationTriangle className="text-red-400 mr-3 mt-1" />
            <div>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <FaSpinner className="animate-spin text-blue-600 text-xl" />
            <span className="ml-2 text-gray-600">Loading contacts...</span>
          </div>
        ) : (
          contacts.map((contact) => (
            <div
              key={`${contact.id}-${contact.type}`}
              onClick={() => handleContactSelect(contact)}
              className="p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaUser className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{contact.type}</p>
                  {contact.email && (
                    <p className="text-xs text-gray-400">{contact.email}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderMessageThread = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => {
              if (selectedConversation) {
                messagingAPI.leaveConversation(selectedConversation.id);
              }
              setView('conversations');
              setSelectedConversation(null);
              setMessages([]);
            }}
            className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
          >
            <FaArrowLeft />
          </button>
          <div>
            <h1 className="text-lg font-bold">
              {selectedConversation?.otherParticipant?.name || 'Conversation'}
            </h1>
            <p className="text-sm text-blue-100 capitalize">
              {selectedConversation?.otherParticipant?.type || 'Contact'}
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
          <div className="flex">
            <FaExclamationTriangle className="text-red-400 mr-3 mt-1" />
            <div>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <FaSpinner className="animate-spin text-blue-600 text-xl" />
            <span className="ml-2 text-gray-600">Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.isOwn
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <div className="text-xs mt-1 opacity-70">
                  {!message.isOwn && message.senderName} • {formatTime(message.createdAt)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            disabled={sendingMessage || isLoading}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sendingMessage || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {sendingMessage ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaPaperPlane />
            )}
            <span className="hidden sm:inline">
              {sendingMessage ? 'Sending...' : 'Send'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );

  // Show loading state on initial load
  if (isLoading && !conversations.length && !error) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-gray-900">
        <div className="bg-blue-600 text-white p-4">
          <h1 className="text-lg font-bold">Messages</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-blue-600 text-2xl mb-4 mx-auto" />
            <p className="text-gray-600">Initializing messaging system...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render current view
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {view === 'conversations' && renderConversationsList()}
      {view === 'contacts' && renderContactsList()}
      {view === 'messages' && renderMessageThread()}
      
      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 p-2 border-t border-gray-200 dark:border-gray-700">
          <p>User: {user?.name || 'Not logged in'} | Role: {user?.role || 'None'}</p>
          <p>View: {view} | Conversations: {conversations.length} | Messages: {messages.length}</p>
          <p>Socket: {messagingAPI.getStatus().socketConnected ? 'Connected' : 'Disconnected'}</p>
        </div>
      )}
    </div>
  );
};

export default SimpleMessaging;
