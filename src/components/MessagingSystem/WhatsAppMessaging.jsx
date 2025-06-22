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
  FaMoon
} from 'react-icons/fa';
import parentService from '../../services/parentService';

const WhatsAppMessaging = () => {
  // Theme Management
  const [theme, setTheme] = useState(() => 
    localStorage.getItem('messaging-theme') || 'light'
  );
  
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
  
  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Theme Configuration
  const themes = {
    light: {
      primary: '#075e54',
      secondary: '#128c7e', 
      accent: '#25d366',
      background: '#ffffff',
      chatBg: '#f0f2f5',
      sentBubble: '#dcf8c6',
      receivedBubble: '#ffffff',
      text: '#111b21',
      textSecondary: '#667781',
      border: '#e9edef',
      headerBg: '#00a884',
      headerText: '#ffffff',
      inputBg: '#f0f2f5'
    },
    dark: {
      primary: '#1f2937',
      secondary: '#111b21',
      accent: '#00a884',
      background: '#0b141a',
      chatBg: '#0b141a',
      sentBubble: '#005c4b',
      receivedBubble: '#202c33',
      text: '#e9edef',
      textSecondary: '#8696a0',
      border: '#2a3942',
      headerBg: '#202c33',
      headerText: '#e9edef',
      inputBg: '#2a3942'
    }
  };

  const currentTheme = themes[theme];

  // Effects
  useEffect(() => {
    localStorage.setItem('messaging-theme', theme);
  }, [theme]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    loadChats();
  }, []);

  // Custom Top Notification
  const showTopNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] px-6 py-3 rounded-lg shadow-lg text-white font-medium animate-bounce ${
      type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-blue-500'
    }`;
    notification.textContent = message;
    notification.style.animation = 'slideDown 0.3s ease-out';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideUp 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    }, 2700);
  };

  // Data Loading
  const loadChats = async () => {
    setIsLoading(true);
    try {
      const response = await parentService.getMessages();
      const chatData = Array.isArray(response) ? response : response.messages || [];
      const groupedChats = groupMessagesByConversation(chatData);
      setChats(groupedChats);
    } catch (error) {
      console.error('Failed to load chats:', error);
      showTopNotification('Failed to load messages', 'error');
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
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(chatKey)}&background=00a884&color=fff&size=50`,
          lastMessage: msg.message,
          lastMessageTime: msg.date,
          unreadCount: msg.read ? 0 : 1,
          isOnline: Math.random() > 0.5,
          messages: []
        });
      }
      chatMap.get(chatKey).messages.push({
        ...msg,
        sent: false,
        timestamp: msg.date
      });
    });
    
    return Array.from(chatMap.values()).sort((a, b) => 
      new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );
  };

  // Message Handling
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    
    const messageText = newMessage.trim();
    setNewMessage('');
    
    const tempMessage = {
      id: Date.now(),
      message: messageText,
      sent: true,
      timestamp: new Date().toISOString(),
      status: 'sending'
    };
    
    setMessages(prev => [...prev, tempMessage]);
    
    try {
      await parentService.sendMessage({
        to: selectedChat.id,
        message: messageText,
        subject: 'Chat Message'
      });
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, status: 'sent' }
            : msg
        )
      );
      
      showTopNotification('Message sent!', 'success');
    } catch (error) {
      console.error('Failed to send message:', error);
      showTopNotification('Failed to send message', 'error');
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Navigation
  const openChat = (chat) => {
    setSelectedChat(chat);
    setMessages(chat.messages || []);
    setCurrentView('chat');
  };

  const goBack = () => {
    if (currentView === 'chat') {
      setCurrentView('chatList');
      setSelectedChat(null);
    } else if (currentView === 'settings') {
      setCurrentView('chatList');
    }
  };

  // Emoji Handling
  const emojis = ['😀', '😂', '🥰', '😍', '🤔', '👍', '👎', '❤️', '🔥', '🎉', '😭', '😴', '🙄', '😎', '🤗', '🤝', '📚', '✏️', '🏫', '👨‍🏫', '👩‍🏫', '🎓'];

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  // Filter chats
  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Chat List Component
  const ChatListView = () => (
    <div 
      className="h-screen w-screen flex flex-col"
      style={{ backgroundColor: currentTheme.background }}
    >
      {/* Header - Full Width */}
      <div 
        className="flex items-center justify-between p-4"
        style={{ backgroundColor: currentTheme.headerBg, color: currentTheme.headerText }}
      >
        <h1 className="text-xl font-semibold">Chats</h1>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setCurrentView('settings')}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <FaCog size={18} />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <FaEllipsisV size={18} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3" style={{ backgroundColor: currentTheme.background }}>
        <div 
          className="flex items-center rounded-full px-4 py-3"
          style={{ backgroundColor: currentTheme.inputBg }}
        >
          <FaSearch className="mr-3" style={{ color: currentTheme.textSecondary }} />
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none"
            style={{ color: currentTheme.text }}
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.map(chat => (
          <div
            key={chat.id}
            onClick={() => openChat(chat)}
            className="flex items-center p-4 hover:bg-opacity-50 cursor-pointer transition-colors"
            style={{ 
              backgroundColor: currentTheme.background,
              ':hover': { backgroundColor: currentTheme.chatBg }
            }}
          >
            <div className="relative">
              <img
                src={chat.avatar}
                alt={chat.name}
                className="w-12 h-12 rounded-full"
              />
              {chat.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            
            <div className="flex-1 ml-3 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium truncate" style={{ color: currentTheme.text }}>
                  {chat.name}
                </h3>
                <span className="text-xs" style={{ color: currentTheme.textSecondary }}>
                  {new Date(chat.lastMessageTime).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <p 
                  className="text-sm truncate"
                  style={{ color: currentTheme.textSecondary }}
                >
                  {chat.lastMessage}
                </p>
                {chat.unreadCount > 0 && (
                  <span className="ml-2 px-2 py-1 rounded-full text-xs text-white bg-green-500 min-w-[20px] text-center">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {filteredChats.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="text-6xl mb-4">💬</div>
            <p style={{ color: currentTheme.textSecondary }}>No chats found</p>
          </div>
        )}
      </div>
    </div>
  );

  // Chat View Component  
  const ChatView = () => (
    <div 
      className="h-screen w-screen flex flex-col"
      style={{ backgroundColor: currentTheme.chatBg }}
    >
      {/* Sticky Header */}
      <div 
        className="sticky top-0 z-10 flex items-center p-4"
        style={{ backgroundColor: currentTheme.headerBg, color: currentTheme.headerText }}
      >
        <button 
          onClick={goBack}
          className="mr-3 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <FaArrowLeft size={18} />
        </button>
        
        <div className="relative">
          <img
            src={selectedChat?.avatar}
            alt={selectedChat?.name}
            className="w-10 h-10 rounded-full"
          />
          {selectedChat?.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        
        <div className="flex-1 ml-3">
          <h2 className="font-medium">{selectedChat?.name}</h2>
          <p className="text-sm opacity-75">
            {isTyping ? 'typing...' : selectedChat?.isOnline ? 'online' : 'offline'}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <FaVideo size={18} />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <FaPhone size={18} />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <FaEllipsisV size={18} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message, index) => (
          <div
            key={message.id || index}
            className={`flex ${message.sent ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-3 py-2 rounded-lg shadow-sm ${
                message.sent 
                  ? 'rounded-br-none' 
                  : 'rounded-bl-none'
              }`}
              style={{
                backgroundColor: message.sent ? currentTheme.sentBubble : currentTheme.receivedBubble,
                color: currentTheme.text
              }}
            >
              <p className="text-sm leading-relaxed">{message.message}</p>
              <div className="flex items-center justify-end mt-1 space-x-1">
                <span 
                  className="text-xs"
                  style={{ color: currentTheme.textSecondary }}
                >
                  {new Date(message.timestamp || message.date).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
                {message.sent && (
                  <span style={{ color: currentTheme.textSecondary }}>
                    {message.status === 'sending' ? '⏳' : 
                     message.status === 'sent' ? <FaCheck size={12} /> : 
                     <FaCheckDouble size={12} className="text-blue-500" />}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div 
          className="p-4 border-t"
          style={{ 
            backgroundColor: currentTheme.background,
            borderColor: currentTheme.border 
          }}
        >
          <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
            {emojis.map(emoji => (
              <button
                key={emoji}
                onClick={() => addEmoji(emoji)}
                className="p-2 text-lg hover:bg-gray-100 rounded transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div 
        className="p-4"
        style={{ backgroundColor: currentTheme.background }}
      >
        <div className="flex items-end space-x-2">
          <button 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FaSmile size={20} style={{ color: currentTheme.textSecondary }} />
          </button>
          
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message"
              className="w-full px-4 py-3 rounded-full resize-none max-h-20 outline-none border"
              style={{ 
                backgroundColor: currentTheme.inputBg,
                color: currentTheme.text,
                borderColor: currentTheme.border
              }}
              rows={1}
            />
          </div>

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FaPaperclip size={18} style={{ color: currentTheme.textSecondary }} />
          </button>

          {newMessage.trim() ? (
            <button
              onClick={sendMessage}
              className="p-3 rounded-full transition-colors shadow-lg"
              style={{ backgroundColor: currentTheme.accent, color: 'white' }}
            >
              <FaPaperPlane size={16} />
            </button>
          ) : (
            <button
              onMouseDown={() => setIsRecording(true)}
              onMouseUp={() => setIsRecording(false)}
              className={`p-3 rounded-full transition-colors shadow-lg ${
                isRecording ? 'animate-pulse' : ''
              }`}
              style={{ 
                backgroundColor: isRecording ? '#ef4444' : currentTheme.accent, 
                color: 'white' 
              }}
            >
              <FaMicrophone size={16} />
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
        onChange={(e) => {
          showTopNotification('File upload feature coming soon!', 'info');
        }}
      />
    </div>
  );

  // Settings View Component
  const SettingsView = () => (
    <div 
      className="h-screen w-screen flex flex-col"
      style={{ backgroundColor: currentTheme.background }}
    >
      {/* Sticky Header */}
      <div 
        className="sticky top-0 z-10 flex items-center p-4"
        style={{ backgroundColor: currentTheme.headerBg, color: currentTheme.headerText }}
      >
        <button 
          onClick={goBack}
          className="mr-3 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <FaArrowLeft size={18} />
        </button>
        <h2 className="text-xl font-semibold">Settings</h2>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Theme Settings */}
        <div className="p-4">
          <h3 className="text-lg font-medium mb-4" style={{ color: currentTheme.text }}>
            Appearance
          </h3>
          
          <div 
            className="flex items-center justify-between p-4 rounded-lg"
            style={{ backgroundColor: currentTheme.inputBg }}
          >
            <div className="flex items-center">
              {theme === 'light' ? 
                <FaSun className="mr-3 text-yellow-500" size={20} /> : 
                <FaMoon className="mr-3 text-blue-400" size={20} />
              }
              <div>
                <span className="font-medium" style={{ color: currentTheme.text }}>
                  Theme
                </span>
                <p className="text-sm" style={{ color: currentTheme.textSecondary }}>
                  Choose your preferred theme
                </p>
              </div>
            </div>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="px-3 py-2 rounded-lg border outline-none"
              style={{ 
                backgroundColor: currentTheme.background,
                color: currentTheme.text,
                borderColor: currentTheme.border
              }}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>

        {/* More Settings */}
        <div className="p-4 border-t" style={{ borderColor: currentTheme.border }}>
          <h3 className="text-lg font-medium mb-4" style={{ color: currentTheme.text }}>
            Chat Features
          </h3>
          
          <div className="space-y-3">
            <div 
              className="flex items-center justify-between p-4 rounded-lg"
              style={{ backgroundColor: currentTheme.inputBg }}
            >
              <span style={{ color: currentTheme.text }}>Voice Messages</span>
              <span style={{ color: currentTheme.accent }}>Enabled</span>
            </div>
            
            <div 
              className="flex items-center justify-between p-4 rounded-lg"
              style={{ backgroundColor: currentTheme.inputBg }}
            >
              <span style={{ color: currentTheme.text }}>File Sharing</span>
              <span style={{ color: currentTheme.accent }}>Enabled</span>
            </div>
            
            <div 
              className="flex items-center justify-between p-4 rounded-lg"
              style={{ backgroundColor: currentTheme.inputBg }}
            >
              <span style={{ color: currentTheme.text }}>Emoji Reactions</span>
              <span style={{ color: currentTheme.accent }}>Enabled</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="p-4 border-t" style={{ borderColor: currentTheme.border }}>
          <h3 className="text-lg font-medium mb-4" style={{ color: currentTheme.text }}>
            Notifications
          </h3>
          
          <div 
            className="flex items-center justify-between p-4 rounded-lg"
            style={{ backgroundColor: currentTheme.inputBg }}
          >
            <div>
              <span style={{ color: currentTheme.text }}>Top Notifications</span>
              <p className="text-sm" style={{ color: currentTheme.textSecondary }}>
                Notifications appear from the top
              </p>
            </div>
            <span style={{ color: currentTheme.accent }}>Active</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Main Render
  return (
    <div className="fixed inset-0 z-50" style={{ backgroundColor: currentTheme.background }}>
      {currentView === 'chatList' && <ChatListView />}
      {currentView === 'chat' && <ChatView />}
      {currentView === 'settings' && <SettingsView />}
      
      <style jsx global>{`
        @keyframes slideDown {
          from { transform: translate(-50%, -100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translate(-50%, 0); opacity: 1; }
          to { transform: translate(-50%, -100%); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default WhatsAppMessaging; 