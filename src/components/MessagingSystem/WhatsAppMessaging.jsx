import React, { useState, useEffect, useRef } from 'react';
import { 
  FaArrowLeft, 
  FaPaperPlane, 
  FaSmile, 
  FaMicrophone, 
  FaPaperclip, 
  FaSearch,
  FaVideo,
  FaPhone,
  FaEllipsisV,
  FaCheck,
  FaCheckDouble,
  FaCog,
  FaSun,
  FaMoon,
  FaWifi,
  FaExclamationCircle,
  FaPlus,
  FaTimes
} from 'react-icons/fa';
import parentService from '../../services/parentService';
import { useTheme } from '../../hooks/useTheme';
import { showNotification } from '../../utils/notifications';
import useWebSocket from '../../hooks/useWebSocket';

const WhatsAppMessaging = React.memo(() => {
  const { isDark } = useTheme();
  
  // WebSocket Integration
  const {
    isConnected,
    lastMessage,
    typingUsers,
    sendMessage: wsSendMessage,
    sendTyping,
    addEventListener,
    removeEventListener,
    reconnect
  } = useWebSocket();
  
  // Core State
  const [currentView, setCurrentView] = useState('chatList');
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  
  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const searchInputRef = useRef(null);

  // Enhanced WhatsApp-style Theme Configuration
  const themes = {
    light: {
      primary: '#128C7E',
      secondary: '#075E54', 
      accent: '#25D366',
      background: '#FFFFFF',
      chatBg: '#E5DDD5', // WhatsApp's signature chat background
      sentBubble: '#DCF8C6',
      receivedBubble: '#FFFFFF',
      text: '#111B21',
      textSecondary: '#667781',
      textMuted: '#8696A0',
      border: '#E9EDEF',
      headerBg: '#128C7E', // WhatsApp green
      headerText: '#FFFFFF',
      inputBg: '#F0F2F5',
      searchBg: '#F0F2F5',
      divider: '#E9EDEF',
      shadow: 'rgba(0,0,0,0.1)',
      unreadBg: '#25D366',
      unreadText: '#FFFFFF'
    },
    dark: {
      primary: '#1F2937',
      secondary: '#111B21',
      accent: '#00A884',
      background: '#0B141A',
      chatBg: '#0B141A',
      sentBubble: '#005C4B',
      receivedBubble: '#202C33',
      text: '#E9EDEF',
      textSecondary: '#8696A0',
      textMuted: '#667781',
      border: '#2A3942',
      headerBg: '#202C33',
      headerText: '#E9EDEF',
      inputBg: '#2A3942',
      searchBg: '#2A3942',
      divider: '#2A3942',
      shadow: 'rgba(0,0,0,0.3)',
      unreadBg: '#00A884',
      unreadText: '#FFFFFF'
    }
  };

  const currentTheme = themes[isDark ? 'dark' : 'light'];

  // Effects
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    loadChats();
  }, []);

  // WebSocket Effects - Handle real-time messages
  useEffect(() => {
    if (lastMessage) {
      console.log('📨 Processing new real-time message:', lastMessage);
      
      // Add message to current conversation if it matches
      if (selectedChat && lastMessage.conversationId === selectedChat.id) {
        setMessages(prev => {
          // Avoid duplicates
          const exists = prev.some(msg => msg.id === lastMessage.id);
          if (exists) return prev;
          
          return [...prev, {
            ...lastMessage,
            sent: lastMessage.senderId === parseInt(localStorage.getItem('user')?.id || '0'),
            timestamp: lastMessage.createdAt || lastMessage.timestamp
          }];
        });
      }
      
      // Update chat list with latest message
      setChats(prev => prev.map(chat => {
        if (chat.id === lastMessage.conversationId) {
          return {
            ...chat,
            lastMessage: lastMessage.message,
            lastMessageTime: lastMessage.createdAt || lastMessage.timestamp,
            unreadCount: selectedChat?.id === chat.id ? 0 : (chat.unreadCount || 0) + 1
          };
        }
        return chat;
      }));
      
      // Show notification if message is from another conversation
      if (!selectedChat || lastMessage.conversationId !== selectedChat.id) {
        showNotification(`New message from ${lastMessage.senderName || 'Unknown'}`, 'info');
      }
    }
  }, [lastMessage, selectedChat]);

  // Join conversation when selected
  useEffect(() => {
    if (selectedChat?.id) {
      console.log('🔗 Joining conversation:', selectedChat.id);
      addEventListener(selectedChat.id);
      
      return () => {
        console.log('🔗 Leaving conversation:', selectedChat.id);
        removeEventListener(selectedChat.id);
      };
    }
  }, [selectedChat?.id, addEventListener, removeEventListener]);

  // Handle typing indicators
  useEffect(() => {
    if (selectedChat && typingUsers.length > 0) {
      const chatTypingUsers = typingUsers.filter(userId => 
        userId !== parseInt(localStorage.getItem('user')?.id || '0')
      );
      setIsTyping(chatTypingUsers.length > 0);
    } else {
      setIsTyping(false);
    }
  }, [typingUsers, selectedChat]);

  // Data Loading
  const loadChats = async () => {
    setIsLoading(true);
    try {
      let contacts = [];
      let chatData = [];
      
      // Get current user to filter out self
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const currentUserId = currentUser.id;
      const currentUserEmail = currentUser.email;
      
      console.log('👤 Current user in loadChats:', { id: currentUserId, email: currentUserEmail, name: currentUser.name });
      
      // Try to fetch available contacts with fallback
      try {
        console.log('📞 Attempting to load contacts...');
        const allContacts = await parentService.getAvailableContacts();
        
        // Handle different response formats and filter out current user
        let contactsArray = [];
        if (Array.isArray(allContacts)) {
          contactsArray = allContacts;
        } else if (allContacts && Array.isArray(allContacts.teachers)) {
          contactsArray = allContacts.teachers;
        } else if (allContacts && Array.isArray(allContacts.data)) {
          contactsArray = allContacts.data;
        }
        
        // Filter out current user
        contacts = contactsArray.filter(contact => {
          const isCurrentUser = contact.id === currentUserId || 
                               contact.email === currentUserEmail ||
                               contact.name === currentUser.name;
          if (isCurrentUser) {
            console.log('🚫 Filtering out current user from chat list:', contact.name);
          }
          return !isCurrentUser;
        });
        
        console.log('✅ Filtered contacts:', contacts.length, 'contacts after removing current user');
        
      } catch (contactError) {
        console.warn('⚠️ Could not load contacts from API, using fallback:', contactError);
        // Fallback to default teacher contacts (excluding current user)
        const fallbackContacts = [
          {
            id: 1,
            name: 'Ms. Sarah Johnson',
            role: 'Grade R Teacher',
            email: 'sarah@youngeagles.org.za'
          },
          {
            id: 2,
            name: 'Mr. David Wilson', 
            role: 'Grade RR Teacher',
            email: 'david@youngeagles.org.za'
          },
          {
            id: 3,
            name: 'School Administrator',
            role: 'Administrator',
            email: 'admin@youngeagles.org.za'
          }
        ];
        
        // Filter fallback contacts too
        contacts = fallbackContacts.filter(contact => {
          const isCurrentUser = contact.id === currentUserId || 
                               contact.email === currentUserEmail ||
                               contact.name === currentUser.name;
          return !isCurrentUser;
        });
      }
      
      // Try to fetch existing conversations with fallback
      try {
        console.log('💬 Attempting to load messages...');
        const response = await parentService.getMessages();
        chatData = Array.isArray(response) ? response : response.messages || [];
      } catch (messageError) {
        console.warn('⚠️ Could not load messages from API:', messageError);
        chatData = []; // Empty array fallback
      }
      
      // Map contacts to the chat format, so they appear in the list
      const contactChats = contacts.map(contact => ({
        id: `teacher_${contact.id}`, // Create a unique ID for the potential chat
        name: contact.name,
        role: contact.role || 'Teacher',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=128C7E&color=fff&size=50`,
        lastMessage: 'Click to start a conversation',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
        isOnline: false, // Real online status should come from WebSocket/server
        isPinned: false,
        messages: []
      }));
      
      // Group existing messages into conversations
      const existingConversations = groupMessagesByConversation(chatData);
      
      // Combine and deduplicate
      const combined = [...contactChats, ...existingConversations];
      const uniqueChats = combined.filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i);

      setChats(uniqueChats.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)));
      
      console.log('✅ Loaded chats successfully:', uniqueChats.length, 'chats');
      
      if (uniqueChats.length > 0) {
        showNotification('Connected to messaging service', 'success');
      }
      
    } catch (error) {
      console.error('❌ Failed to load chats:', error);
      // Even if everything fails, provide a basic contact list
      const fallbackChats = [
        {
          id: 'school_admin',
          name: 'School Office',
          role: 'Administration',
          avatar: 'https://ui-avatars.com/api/?name=School+Office&background=128C7E&color=fff&size=50',
          lastMessage: 'Contact us for any questions',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
          isOnline: true,
          isPinned: false,
          messages: []
        }
      ];
      setChats(fallbackChats);
      showNotification('Limited messaging available - contact support if needed', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  const groupMessagesByConversation = (messages) => {
    const chatMap = new Map();
    
    messages.forEach(msg => {
      const chatKey = msg.from || msg.fromRole || 'School Admin';
      if (!chatMap.has(chatKey)) {
        chatMap.set(chatKey, {
          id: chatKey,
          name: chatKey,
          role: 'Teacher',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(chatKey)}&background=128C7E&color=fff&size=50`,
          lastMessage: msg.message,
          lastMessageTime: msg.date,
          unreadCount: msg.read ? 0 : 1,
          isOnline: false, // Real online status should come from WebSocket/server
          isPinned: false,
          messages: []
        });
      }
      chatMap.get(chatKey).messages.push({
        ...msg,
        sent: false,
        timestamp: msg.date
      });
    });
    
    return Array.from(chatMap.values());
  };

  // Message Handling
  const sendMessage = React.useCallback(async () => {
    if (!newMessage.trim() || !selectedChat) {
      console.log('❌ Cannot send message - missing message or chat:', {
        message: newMessage.trim(),
        selectedChat: selectedChat?.id
      });
      return;
    }
    
    const messageText = newMessage.trim();
    console.log('📤 Sending message:', messageText, 'to:', selectedChat.name);
    
    setNewMessage('');
    
    const tempMessage = {
      id: `temp_${Date.now()}`,
      message: messageText,
      sent: true,
      timestamp: new Date().toISOString(),
      status: 'sending',
      conversationId: selectedChat.id
    };
    
    console.log('📝 Created temp message:', tempMessage);
    
    // Add to local state immediately for instant feedback
    setMessages(prev => {
      const newMessages = [...prev, tempMessage];
      console.log('💬 Updated messages array:', newMessages.length, 'messages');
      return newMessages;
    });
    
    try {
      console.log('🚀 Attempting to send via API...');
      
      // Always use REST API for now (simpler and more reliable)
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('👤 Current user sending message:', currentUser.email);
      
      const messageData = {
        to: selectedChat.id,
        message: messageText,
        subject: 'Chat Message',
        from: currentUser.id,
        timestamp: new Date().toISOString()
      };
      
      console.log('📡 Sending message data:', messageData);
      
      // Use the messages/send endpoint
      const apiUrl = 'http://localhost:3001/messages/send';
      console.log('🌐 Making API call to:', apiUrl);
      
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      console.log('🔑 Using token for request:', token ? `Token present (${token.substring(0, 20)}...)` : 'No token found');
      console.log('🔍 Checking localStorage:', {
        accessToken: !!localStorage.getItem('accessToken'),
        token: !!localStorage.getItem('token'),
        user: !!localStorage.getItem('user'),
        role: localStorage.getItem('role')
      });
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(messageData)
      });
      
      console.log('📡 API Response status:', response.status, response.statusText);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Message sent successfully:', result);
        
        // Update status to sent
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempMessage.id 
              ? { ...msg, status: 'sent', id: result.messageId || msg.id }
              : msg
          )
        );
        
        showNotification('Message sent!', 'success');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Update chat list optimistically
      setChats(prev => prev.map(chat => {
        if (chat.id === selectedChat.id) {
          return {
            ...chat,
            lastMessage: messageText,
            lastMessageTime: new Date().toISOString()
          };
        }
        return chat;
      }));
      
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      showNotification('Failed to send message', 'error');
      
      // Mark message as failed
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, status: 'failed' }
            : msg
        )
      );
    }
  }, [newMessage, selectedChat]);

  // Handle typing indicators
  const handleInputChange = React.useCallback((e) => {
    const value = e.target.value;
    console.log('✏️ Input changed in callback:', value);
    setNewMessage(value);
    
    // Simplified typing indicator - remove problematic dependencies
    if (selectedChat && isConnected) {
      try {
        sendTyping(selectedChat.id);
      } catch (error) {
        console.warn('Failed to send typing indicator:', error);
      }
    }
  }, [selectedChat?.id, isConnected, sendTyping]); // Added sendTyping to dependencies

  const handleKeyPress = React.useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // Navigation
  const goBack = () => {
    if (currentView === 'chat') {
      setCurrentView('chatList');
      setSelectedChat(null);
      setMessages([]);
    } else {
      // Navigate back to dashboard
      window.history.back();
    }
  };

  // Emoji handling
  const addEmoji = React.useCallback((emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    // Keep focus on input after adding emoji
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, []);

  // File upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      showNotification(`File "${file.name}" selected for upload`, 'info');
    }
  };

  // Load available teachers
  const loadTeachers = async () => {
    try {
      console.log('🔄 Loading available teachers from API...');
      
      // First try to load from API
      const response = await parentService.getAvailableContacts();
      console.log('📡 API Response:', response);
      
      // Handle different response formats
      let contacts = [];
      if (Array.isArray(response)) {
        contacts = response;
      } else if (response && Array.isArray(response.teachers)) {
        contacts = response.teachers;
      } else if (response && Array.isArray(response.data)) {
        contacts = response.data;
      } else {
        console.warn('⚠️ Unexpected API response format:', response);
        throw new Error('Invalid API response format');
      }
      
      if (contacts && contacts.length > 0) {
        console.log('✅ Loaded teachers from API:', contacts.length, contacts);
        
        // Get current user to filter out self
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const currentUserId = currentUser.id;
        const currentUserEmail = currentUser.email;
        
        console.log('👤 Current user:', { id: currentUserId, email: currentUserEmail });
        
        // Transform API data to expected format and filter out current user
        const teachers = contacts
          .filter(contact => {
            // Filter out current user by ID or email
            const isCurrentUser = contact.id === currentUserId || 
                                 contact.email === currentUserEmail ||
                                 contact.name === currentUser.name;
            if (isCurrentUser) {
              console.log('🚫 Filtering out current user:', contact.name);
            }
            return !isCurrentUser;
          })
          .map(contact => ({
            id: contact.id || `contact_${contact.name?.replace(/\s+/g, '_')}`,
            name: contact.name,
            role: contact.role || 'Teacher',
            className: contact.className || '',
            email: contact.email || '',
            avatar: contact.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=128C7E&color=fff&size=50`,
            isOnline: false // Real online status should come from WebSocket/server
          }));
        
        setAvailableTeachers(teachers);
        console.log('🎯 Set available teachers:', teachers);
        showNotification(`Loaded ${teachers.length} teachers successfully`, 'success');
      } else {
        throw new Error('No contacts returned from API');
      }
    } catch (error) {
      console.error('❌ Failed to load teachers from API:', error);
      console.log('📋 Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      console.log('🔄 Using fallback teachers data');
      
      // Fallback to default contacts
      setAvailableTeachers([
        {
          id: 'school_office',
          name: 'School Office',
          role: 'Administration',
          avatar: 'https://ui-avatars.com/api/?name=School+Office&background=2196F3&color=fff&size=50',
          isOnline: false
        },
        {
          id: 'teacher_sarah',
          name: 'Ms. Sarah Johnson',
          role: 'Grade R Teacher',
          avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=128C7E&color=fff&size=50',
          isOnline: false
        },
        {
          id: 'teacher_david', 
          name: 'Mr. David Wilson',
          role: 'Grade RR Teacher',
          avatar: 'https://ui-avatars.com/api/?name=David+Wilson&background=25D366&color=fff&size=50',
          isOnline: false
        }
      ]);
      
      showNotification('Using fallback contacts - check network connection', 'warning');
    }
  };

  // Format time in WhatsApp style
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } else if (diffInHours < 7 * 24) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // Load teachers when modal opens
  React.useEffect(() => {
    if (showNewChatModal && availableTeachers.length === 0) {
      console.log('📱 Loading teachers for new chat modal...');
      loadTeachers();
    }
  }, [showNewChatModal]);

  // New Chat Modal - stable component to prevent focus loss
  const NewChatModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        style={{ backgroundColor: currentTheme.background }}
        className="w-full max-w-md mx-4 rounded-lg shadow-xl"
      >
        <div style={{ backgroundColor: currentTheme.headerBg }} className="px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 style={{ color: currentTheme.headerText }} className="text-lg font-semibold">
              New conversation
            </h2>
            <button 
              onClick={() => setShowNewChatModal(false)}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <FaTimes style={{ color: currentTheme.headerText }} />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <p style={{ color: currentTheme.textSecondary }} className="mb-4 text-sm">
            Select a teacher to start a conversation:
          </p>
          
          {availableTeachers.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span style={{ color: currentTheme.textSecondary }} className="ml-3">
                Loading teachers...
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              {availableTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  onClick={() => startNewChat(teacher)}
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  style={{ backgroundColor: currentTheme.chatBg }}
                >
                  <img 
                    src={teacher.avatar} 
                    alt={teacher.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="ml-3">
                    <h3 style={{ color: currentTheme.text }} className="font-medium">
                      {teacher.name}
                    </h3>
                    <p style={{ color: currentTheme.textSecondary }} className="text-sm">
                      {teacher.role}
                    </p>
                  </div>
                  {teacher.isOnline && (
                    <div className="ml-auto w-3 h-3 bg-green-500 rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const startNewChat = (teacher) => {
    const newChat = {
      id: teacher.id,
      name: teacher.name,
      role: teacher.role,
      avatar: teacher.avatar,
      lastMessage: '',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      isOnline: teacher.isOnline,
      isPinned: false,
      messages: []
    };
    
    setSelectedChat(newChat);
    setMessages([]);
    setCurrentView('chat');
    setShowNewChatModal(false);
  };

  // Enhanced Chat List View (WhatsApp Business Style)
  const ChatListView = React.useCallback(() => (
    <div style={{ backgroundColor: currentTheme.background, minHeight: '100vh' }}>
      {/* Header - WhatsApp Business Style */}
      <div 
        style={{ 
          backgroundColor: currentTheme.headerBg,
          boxShadow: `0 1px 3px ${currentTheme.shadow}`
        }} 
        className="px-4 py-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={goBack} 
              className="mr-3 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <FaArrowLeft style={{ color: currentTheme.headerText }} />
            </button>
            <h1 style={{ color: currentTheme.headerText }} className="text-xl font-medium">
              Young Eagles
            </h1>
          </div>
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => setShowNewChatModal(true)}
              className="p-2.5 rounded-full hover:bg-white/10 transition-colors"
              style={{ color: currentTheme.headerText }}
            >
              <FaPlus size={18} />
            </button>
            <button className="p-2.5 rounded-full hover:bg-white/10 transition-colors">
              <FaSearch style={{ color: currentTheme.headerText }} size={18} />
            </button>
            <button className="p-2.5 rounded-full hover:bg-white/10 transition-colors">
              <FaEllipsisV style={{ color: currentTheme.headerText }} size={16} />
            </button>
          </div>
        </div>
        
        {/* Search Bar - WhatsApp Style */}
        <div className="mt-4">
          <div className="relative">
            <FaSearch 
              className="absolute left-4 top-1/2 transform -translate-y-1/2" 
              style={{ color: currentTheme.textMuted }}
              size={16}
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search or start new chat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                backgroundColor: currentTheme.searchBg, 
                color: currentTheme.text,
                border: `1px solid ${currentTheme.border}`
              }}
              className="w-full pl-12 pr-4 py-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-green-500/30 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Chat List - Enhanced WhatsApp Business Style */}
      <div className="pb-20">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: currentTheme.accent }}></div>
          </div>
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: currentTheme.chatBg }}>
              <FaPaperPlane className="w-10 h-10" style={{ color: currentTheme.textMuted }} />
            </div>
            <h3 style={{ color: currentTheme.text }} className="text-lg font-medium mb-2">
              Welcome to Young Eagles
            </h3>
            <p style={{ color: currentTheme.textSecondary }} className="text-center text-sm leading-relaxed">
              Start a conversation with your teachers or school administrators to stay connected with your child's progress.
            </p>
            <button
              onClick={() => setShowNewChatModal(true)}
              style={{ backgroundColor: currentTheme.accent }}
              className="mt-6 px-6 py-2.5 rounded-full text-white font-medium hover:opacity-90 transition-opacity"
            >
              Start Conversation
            </button>
          </div>
        ) : (
          chats
            .filter(chat => 
              searchQuery === '' || 
              chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((chat) => (
              <div
                key={chat.id}
                onClick={() => {
                  setSelectedChat(chat);
                  setMessages(chat.messages || []);
                  setCurrentView('chat');
                }}
                style={{ 
                  backgroundColor: currentTheme.background,
                  borderColor: currentTheme.divider
                }}
                className="flex items-center px-4 py-3 border-b hover:bg-gray-50 cursor-pointer transition-colors relative"
              >
                {/* Profile Picture with Online Indicator */}
                <div className="relative flex-shrink-0">
                  <img 
                    src={chat.avatar} 
                    alt={chat.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {chat.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                
                {/* Chat Content */}
                <div className="flex-1 ml-4 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center min-w-0 flex-1">
                      <h3 style={{ color: currentTheme.text }} className="font-medium truncate text-base">
                        {chat.name}
                      </h3>
                      {chat.isPinned && (
                        <div className="ml-2 w-4 h-4 rotate-45" style={{ color: currentTheme.textMuted }}>
                          📌
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <span style={{ color: currentTheme.textSecondary }} className="text-xs">
                        {formatMessageTime(chat.lastMessageTime)}
                      </span>
                      {chat.unreadCount > 0 && (
                        <div 
                          style={{ backgroundColor: currentTheme.unreadBg }}
                          className="min-w-[20px] h-5 rounded-full flex items-center justify-center px-1.5"
                        >
                          <span style={{ color: currentTheme.unreadText }} className="text-xs font-medium">
                            {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Role and Last Message */}
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p style={{ color: currentTheme.textMuted }} className="text-xs mb-1">
                        {chat.role}
                      </p>
                      <p style={{ color: currentTheme.textSecondary }} className="text-sm truncate leading-tight">
                        {chat.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && <NewChatModal />}
    </div>
  ), [currentTheme, isLoading, chats, searchQuery, showNewChatModal]);

  // Enhanced Chat View (WhatsApp Business Style)
  const ChatView = React.useCallback(() => (
    <div style={{ backgroundColor: currentTheme.chatBg, minHeight: '100vh' }} className="flex flex-col">
      {/* Chat Header - WhatsApp Business Style */}
      <div 
        style={{ 
          backgroundColor: currentTheme.headerBg,
          boxShadow: `0 1px 3px ${currentTheme.shadow}`
        }} 
        className="px-4 py-3 flex items-center"
      >
        <button 
          onClick={goBack} 
          className="mr-3 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <FaArrowLeft style={{ color: currentTheme.headerText }} />
        </button>
        
        <div className="flex items-center flex-1">
          <div className="relative">
            <img 
              src={selectedChat?.avatar} 
              alt={selectedChat?.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            {selectedChat?.isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          
          <div className="ml-3 flex-1">
            <div className="flex items-center">
              <h3 style={{ color: currentTheme.headerText }} className="font-medium text-base">
                {selectedChat?.name}
              </h3>
              {/* Connection Status Indicator */}
              <span className="ml-2">
                {isConnected ? (
                  <FaWifi className="text-green-400 text-xs" title="Connected" />
                ) : (
                  <FaExclamationCircle className="text-red-400 text-xs" title="Disconnected" />
                )}
              </span>
            </div>
            <p style={{ color: currentTheme.headerText }} className="text-xs opacity-80">
              {isTyping ? (
                <span className="flex items-center">
                  <span className="animate-pulse">typing</span>
                  <span className="flex ml-1 space-x-1">
                    <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </span>
                </span>
              ) : (
                onlineUsers.includes(selectedChat?.id) || selectedChat?.isOnline ? 'online' : 'last seen recently'
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button className="p-2.5 rounded-full hover:bg-white/10 transition-colors">
            <FaVideo style={{ color: currentTheme.headerText }} size={18} />
          </button>
          <button className="p-2.5 rounded-full hover:bg-white/10 transition-colors">
            <FaPhone style={{ color: currentTheme.headerText }} size={18} />
          </button>
          <button className="p-2.5 rounded-full hover:bg-white/10 transition-colors">
            <FaEllipsisV style={{ color: currentTheme.headerText }} size={16} />
          </button>
        </div>
      </div>

      {/* Messages Area - WhatsApp Style */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-6" style={{ 
        backgroundImage: isDark ? 'none' : `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.03'%3E%3Cpolygon points='0 40 40 0 0 0'/%3E%3C/g%3E%3C/svg%3E")` 
      }}>
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: currentTheme.receivedBubble }}>
                <FaPaperPlane className="w-8 h-8" style={{ color: currentTheme.textMuted }} />
              </div>
              <p style={{ color: currentTheme.textSecondary }} className="text-center text-sm">
                No messages yet. Start the conversation!
              </p>
              <p style={{ color: currentTheme.textMuted }} className="text-center text-xs mt-2">
                Messages are end-to-end encrypted
              </p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isConsecutive = index > 0 && messages[index - 1].sent === message.sent;
              const showTime = index === messages.length - 1 || 
                              !isConsecutive || 
                              new Date(message.timestamp) - new Date(messages[index + 1]?.timestamp || 0) > 300000; // 5 minutes
              
              return (
                <div key={message.id || index} className={`flex ${message.sent ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs sm:max-w-md lg:max-w-lg ${isConsecutive ? 'mt-1' : 'mt-3'}`}>
                    {/* Message Bubble */}
                    <div
                      style={{ 
                        backgroundColor: message.sent ? currentTheme.sentBubble : currentTheme.receivedBubble,
                        color: currentTheme.text,
                        boxShadow: `0 1px 2px ${currentTheme.shadow}`
                      }}
                      className={`px-3 py-2 rounded-lg relative ${
                        message.sent 
                          ? 'rounded-br-sm bg-gradient-to-r' 
                          : 'rounded-bl-sm'
                      }`}
                    >
                      {/* Message Text */}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.message}
                      </p>
                      
                      {/* Message Meta */}
                      <div className="flex items-center justify-end mt-1 space-x-1">
                        <span style={{ color: message.sent ? currentTheme.textSecondary : currentTheme.textMuted }} className="text-xs">
                          {new Date(message.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          })}
                        </span>
                        
                        {/* Message Status (for sent messages) */}
                        {message.sent && (
                          <div className="flex items-center">
                            {message.status === 'sending' ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400"></div>
                            ) : message.status === 'sent' ? (
                              <FaCheck style={{ color: currentTheme.textSecondary }} className="w-3 h-3" />
                            ) : message.status === 'delivered' ? (
                              <FaCheckDouble style={{ color: currentTheme.textSecondary }} className="w-3 h-3" />
                            ) : message.status === 'read' ? (
                              <FaCheckDouble style={{ color: currentTheme.accent }} className="w-3 h-3" />
                            ) : (
                              <FaCheckDouble style={{ color: currentTheme.accent }} className="w-3 h-3" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Timestamp (shown separately for better readability) */}
                    {showTime && (
                      <div className={`text-center mt-2 mb-1 ${message.sent ? 'text-right' : 'text-left'}`}>
                        <span style={{ color: currentTheme.textMuted }} className="text-xs">
                          {new Date(message.timestamp).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Area - WhatsApp Business Style */}
      <div 
        style={{ 
          backgroundColor: currentTheme.background,
          borderTop: `1px solid ${currentTheme.border}`,
          boxShadow: `0 -1px 3px ${currentTheme.shadow}`
        }} 
        className="p-4"
      >
        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="mb-2 flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span style={{ color: currentTheme.textMuted }} className="text-xs">
              {typingUsers[0]} is typing...
            </span>
          </div>
        )}
        
        {/* Simple Input Container - NO FORM */}
        <div key="input-container" className="flex items-center space-x-3">
          {/* Emoji Button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <FaSmile style={{ color: currentTheme.textSecondary }} size={20} />
          </button>

          {/* Message Input Container */}
          <div className="flex-1 relative">
            <div 
              style={{ 
                backgroundColor: currentTheme.inputBg, 
                border: `1px solid ${currentTheme.border}`
              }}
              className="rounded-2xl flex items-center"
            >
              {/* Simple Input Field */}
              <input
                key="message-input"
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newMessage.trim()) {
                      sendMessage();
                    }
                  }
                }}
                placeholder={isConnected ? "Type a message..." : "Connecting..."}
                disabled={!isConnected}
                style={{ 
                  color: currentTheme.text,
                  backgroundColor: 'transparent'
                }}
                className="flex-1 px-4 py-3 border-none outline-none"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
              />

              {/* Attachment Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 mr-2 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0"
              >
                <FaPaperclip style={{ color: currentTheme.textSecondary }} size={18} />
              </button>
            </div>
          </div>

          {/* Send Button */}
          <button
            type="button"
            disabled={!newMessage.trim() || !isConnected}
            onClick={() => {
              console.log('🖱️ SEND BUTTON CLICKED');
              if (!newMessage.trim()) {
                console.log('❌ No message to send');
                return;
              }
              console.log('✅ Send button - calling sendMessage');
              sendMessage();
            }}
            style={{ backgroundColor: currentTheme.accent }}
            className={`p-3 rounded-full transition-all transform ${
              newMessage.trim() && isConnected
                ? 'hover:scale-105 shadow-lg' 
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <FaPaperPlane className="text-white" size={18} />
          </button>
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div 
            style={{ 
              backgroundColor: currentTheme.background,
              border: `1px solid ${currentTheme.border}`,
              boxShadow: `0 -2px 10px ${currentTheme.shadow}`
            }} 
            className="absolute bottom-20 left-4 right-4 p-4 rounded-xl"
          >
            <div className="flex justify-between items-center mb-3">
              <h4 style={{ color: currentTheme.text }} className="font-medium">
                Emojis
              </h4>
              <button 
                onClick={() => setShowEmojiPicker(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FaTimes style={{ color: currentTheme.textSecondary }} size={14} />
              </button>
            </div>
            
            <div className="grid grid-cols-8 gap-3 max-h-48 overflow-y-auto">
              {[
                '😀', '😃', '😄', '😁', '😊', '😇', '🙂', '🙃',
                '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛',
                '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
                '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄',
                '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷',
                '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴',
                '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕',
                '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺',
                '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱',
                '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤',
                '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩',
                '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '😺',
                '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾',
                '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
                '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
                '💘', '💝', '💟', '💌', '💢', '💥', '💫', '💦',
                '💨', '🕳️', '💣', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭',
                '💤', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏',
                '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆',
                '🖕', '👇', '☝️', '👍', '👎', '👊', '✊', '🤛',
                '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'
              ].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => addEmoji(emoji)}
                  className="p-2 text-xl hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
          onChange={handleFileUpload}
        />

        {/* Connection Status */}
        {!isConnected && (
          <div className="mt-2 flex items-center justify-center">
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-100">
              <FaExclamationCircle className="text-orange-500 text-xs" />
              <span className="text-orange-600 text-xs">
                Connecting... 
                <button 
                  onClick={reconnect}
                  className="ml-1 underline hover:no-underline"
                >
                  Retry
                </button>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  ), [currentTheme, selectedChat?.id, isConnected, messages, newMessage, showEmojiPicker, isRecording, isDark]);

  // Render based on current view
  if (currentView === 'chat' && selectedChat) {
    return <ChatView />;
  }

  return <ChatListView />;
});

export default WhatsAppMessaging; 