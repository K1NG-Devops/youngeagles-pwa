import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaPaperPlane, FaSmile, FaPaperclip, FaSearch,
  FaEllipsisV, FaCheck, FaCheckDouble, FaPlus, FaTimes, FaClock, 
  FaExclamationCircle, FaRedo
} from 'react-icons/fa';
import parentService from '../../services/parentService';
import { useTheme } from '../../hooks/useTheme';
import { showNotification } from '../../utils/notifications';

// --- Helper Functions (Defined at Top Level) ---

const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    } else if (diffInHours < 7 * 24) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
};
  
const mergeChatsAndContacts = (conversations, contacts) => {
    const chatMap = new Map();
  
    // First, add all available contacts to the map as a base
    contacts.forEach(contact => {
      chatMap.set(contact.id.toString(), {
        id: contact.id.toString(),
        name: contact.name,
        role: contact.role || 'user',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=128C7E&color=fff&size=50`,
        lastMessage: 'Click to start a conversation',
        lastMessageTime: null, // No timestamp for contacts without messages
        unreadCount: 0,
        isOnline: false, // Default to offline
        messages: [],
        contactInfo: contact
      });
    });
  
    // Then, update with actual conversation data
    conversations.forEach(convo => {
      const participant = convo.otherParticipant; // Assuming the API provides this
      if (participant) {
        const existing = chatMap.get(participant.id.toString());
        if (existing) {
          // Normalize conversation ID format - ensure it follows {userId}_{userType} pattern
          let normalizedConvoId = convo.id;
          if (typeof convo.id === 'number' || !convo.id.includes('_')) {
            // If it's a numeric ID, convert to proper format
            normalizedConvoId = `${participant.id}_${participant.type}`;
          }
          
          chatMap.set(participant.id.toString(), {
            ...existing,
            id: normalizedConvoId, // Use the normalized conversation ID
            lastMessage: convo.lastMessage?.content || 'No messages yet.',
            lastMessageTime: convo.lastMessage?.createdAt || convo.updatedAt,
            unreadCount: convo.unreadCount || 0,
          });
        }
      }
    });
  
    return Array.from(chatMap.values()).sort((a, b) => {
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });
};

// --- View Components (Defined at Top Level) ---

const ChatListView = ({ currentTheme, setCurrentView, loadContacts, isLoading, chats, searchQuery, setSearchQuery, setSelectedChat, setMessages, loadConversationMessages }) => (
    <div style={{ backgroundColor: currentTheme.background, minHeight: '100vh' }}>
      <div 
        style={{ backgroundColor: currentTheme.headerBg, boxShadow: `0 1px 3px ${currentTheme.shadow}` }} 
        className="px-4 py-3"
      >
        <div className="flex items-center justify-between">
          <h1 style={{ color: currentTheme.headerText }} className="text-xl font-semibold">Messages</h1>
          <div className="flex items-center space-x-2">
            <button onClick={() => { setCurrentView('compose'); loadContacts(); }} className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <FaPlus style={{ color: currentTheme.headerText }} />
            </button>
            <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <FaEllipsisV style={{ color: currentTheme.headerText }} />
            </button>
          </div>
        </div>
        <div className="mt-4 px-4">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2" style={{ color: currentTheme.textMuted }} size={16} />
            <input
              type="text"
              placeholder="Search conversations"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ backgroundColor: currentTheme.searchBg, color: currentTheme.text, border: `1px solid ${currentTheme.border}` }}
              className="w-full pl-12 pr-4 py-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-green-500/30 transition-all"
            />
          </div>
        </div>
      </div>
      <div className="pb-20">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: currentTheme.accent }}></div>
          </div>
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: currentTheme.chatBg }}><FaPaperPlane className="w-10 h-10" style={{ color: currentTheme.textMuted }} /></div>
            <h3 style={{ color: currentTheme.text }} className="text-lg font-medium mb-2">Welcome to Young Eagles</h3>
            <p style={{ color: currentTheme.textSecondary }} className="text-center text-sm leading-relaxed">Start a conversation with your teachers or school administrators.</p>
            <button onClick={() => { setCurrentView('compose'); loadContacts(); }} style={{ backgroundColor: currentTheme.accent }} className="mt-6 px-6 py-2.5 rounded-full text-white font-medium hover:opacity-90 transition-opacity">Start Conversation</button>
          </div>
        ) : (
          chats.filter(chat => searchQuery === '' || chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || (chat.lastMessage && chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))).map((chat) => (
              <div key={chat.id} onClick={async () => { setSelectedChat(chat); setCurrentView('chat'); await loadConversationMessages(chat.id); }} style={{ backgroundColor: currentTheme.background }} className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="relative">
                  <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full object-cover" />
                  {chat.isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 style={{ color: currentTheme.text }} className="font-medium truncate">{chat.name}</h3>
                    {chat.lastMessageTime && (
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span style={{ color: currentTheme.textSecondary }} className="text-xs">{formatMessageTime(chat.lastMessageTime)}</span>
                        {chat.unreadCount > 0 && <div style={{ backgroundColor: currentTheme.unreadBg }} className="min-w-[20px] h-5 rounded-full flex items-center justify-center px-1.5"><span style={{ color: currentTheme.unreadText }} className="text-xs font-medium">{chat.unreadCount > 99 ? '99+' : chat.unreadCount}</span></div>}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p style={{ color: currentTheme.textMuted }} className="text-xs mb-1">{chat.role}</p>
                      <p style={{ color: currentTheme.textSecondary }} className="text-sm truncate leading-tight">{chat.lastMessage || 'No messages yet'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
);
  
const ComposeView = ({ currentTheme, goBack, isLoading, availableContacts, startNewChat, isDark }) => (
    <div style={{ backgroundColor: currentTheme.background, minHeight: '100vh' }}>
      <div style={{ backgroundColor: currentTheme.headerBg, boxShadow: `0 1px 3px ${currentTheme.shadow}` }} className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={goBack} className="mr-3 p-2 rounded-full hover:bg-white/10 transition-colors"><FaArrowLeft style={{ color: currentTheme.headerText }} /></button>
            <h1 style={{ color: currentTheme.headerText }} className="text-xl font-semibold">New Message</h1>
          </div>
        </div>
      </div>
      <div className="p-6">
        <p style={{ color: currentTheme.textSecondary }} className="mb-4 text-sm">Select a contact to start a conversation:</p>
        {isLoading ? (
          <div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div><span style={{ color: currentTheme.textSecondary }} className="ml-3">Loading contacts...</span></div>
        ) : (
          <div className="space-y-3">
            {availableContacts.map((contact) => (
              <div key={contact.id} onClick={() => startNewChat(contact)} className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" style={{ backgroundColor: isDark ? currentTheme.receivedBubble : currentTheme.background, borderRadius: '8px' }}>
                <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-full" />
                <div className="ml-3"><h3 style={{ color: currentTheme.text }} className="font-medium">{contact.name}</h3><p style={{ color: currentTheme.textSecondary }} className="text-sm">{contact.role}</p></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
);
  
const ChatView = ({ currentTheme, goBack, selectedChat, messages, messagesEndRef, newMessage, setNewMessage, sendMessage, handleKeyPress, inputRef, retryMessage }) => (
    <div style={{ backgroundColor: currentTheme.chatBg, minHeight: '100vh' }} className="flex flex-col">
      <div style={{ backgroundColor: currentTheme.headerBg, boxShadow: `0 1px 3px ${currentTheme.shadow}` }} className="px-4 py-3 flex items-center sticky top-0 z-10">
        <button onClick={goBack} className="mr-3 p-2 rounded-full hover:bg-white/10 transition-colors"><FaArrowLeft style={{ color: currentTheme.headerText }} /></button>
        <div className="flex items-center flex-1">
          <div className="relative">
            <img src={selectedChat?.avatar} alt={selectedChat?.name} className="w-10 h-10 rounded-full object-cover" />
            {selectedChat?.isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
          </div>
          <div className="ml-3">
            <h2 style={{ color: currentTheme.headerText }} className="font-medium">{selectedChat?.name}</h2>
            <p style={{ color: currentTheme.headerText }} className="text-sm opacity-70">{selectedChat?.role}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors"><FaEllipsisV style={{ color: currentTheme.headerText }} /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20"><div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: currentTheme.receivedBubble }}><FaPaperPlane className="w-6 h-6" style={{ color: currentTheme.textMuted }} /></div><p style={{ color: currentTheme.textSecondary }} className="text-center">Start a conversation with {selectedChat?.name}</p></div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.sent ? 'justify-end' : 'justify-start'}`}>
              <div style={{ backgroundColor: message.sent ? currentTheme.sentBubble : currentTheme.receivedBubble, color: currentTheme.text }} className={`max-w-[80%] px-3 py-2 rounded-lg ${message.sent ? 'rounded-br-sm' : 'rounded-bl-sm'}`}>
                <p className="text-sm">{message.message}</p>
                <div className="flex items-center justify-end mt-1 space-x-1">
                  <span style={{ color: currentTheme.textMuted }} className="text-xs">{formatMessageTime(message.timestamp)}</span>
                  {message.sent && (
                    <div className="flex items-center ml-1 space-x-1">
                      {message.status === 'sending' ? (
                        <div className="flex items-center space-x-1">
                          <FaClock className="text-xs text-gray-400 animate-pulse" />
                          <div className="w-2 h-2 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : message.status === 'failed' ? (
                        <div className="flex items-center space-x-1">
                          <FaExclamationCircle className="text-xs text-red-500 cursor-pointer" title="Failed to send - Click to retry" onClick={() => retryMessage(message)} />
                          <FaRedo className="text-xs text-red-400 cursor-pointer hover:text-red-600" onClick={() => retryMessage(message)} />
                        </div>
                      ) : message.status === 'sent' ? (
                        <FaCheck className="text-xs text-gray-400" title="Sent" />
                      ) : message.status === 'delivered' ? (
                        <FaCheckDouble className="text-xs text-gray-500" title="Delivered" />
                      ) : message.status === 'read' ? (
                        <FaCheckDouble className="text-xs text-blue-500" title="Read" />
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ backgroundColor: currentTheme.background, borderColor: currentTheme.border }} className="px-4 py-3 border-t sticky bottom-0">
        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors"><FaPaperclip style={{ color: currentTheme.textMuted }} /></button>
          <div className="flex-1 relative">
            <input ref={inputRef} type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={handleKeyPress} placeholder="Type a message..." style={{ backgroundColor: currentTheme.inputBg, color: currentTheme.text, border: `1px solid ${currentTheme.border}` }} className="w-full px-4 py-2 pr-12 rounded-full border outline-none focus:ring-2 focus:ring-green-500/30 transition-all" />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"><FaSmile style={{ color: currentTheme.textMuted }} /></button>
          </div>
          <button onClick={sendMessage} disabled={!newMessage.trim()} style={{ backgroundColor: newMessage.trim() ? currentTheme.accent : currentTheme.textMuted }} className="p-3 rounded-full text-white transition-colors disabled:opacity-50"><FaPaperPlane /></button>
        </div>
      </div>
    </div>
);

// --- Main Component ---

const WhatsAppStyleMessaging = () => {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    
    const [currentView, setCurrentView] = useState('chatList');
    const [selectedChat, setSelectedChat] = useState(null);
    const [chats, setChats] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [availableContacts, setAvailableContacts] = useState([]);
    
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
  
    const themes = {
      light: { primary: '#128C7E', secondary: '#075E54', accent: '#25D366', background: '#FFFFFF', chatBg: '#E5DDD5', sentBubble: '#DCF8C6', receivedBubble: '#FFFFFF', text: '#111B21', textSecondary: '#667781', textMuted: '#8696A0', border: '#E9EDEF', headerBg: '#128C7E', headerText: '#FFFFFF', inputBg: '#F0F2F5', searchBg: '#F0F2F5', shadow: 'rgba(0,0,0,0.1)', unreadBg: '#25D366', unreadText: '#FFFFFF' },
      dark: { primary: '#1F2937', secondary: '#111B21', accent: '#00A884', background: '#0B141A', chatBg: '#0B141A', sentBubble: '#005C4B', receivedBubble: '#202C33', text: '#E9EDEF', textSecondary: '#8696A0', textMuted: '#667781', border: '#2A3942', headerBg: '#202C33', headerText: '#E9EDEF', inputBg: '#2A3942', searchBg: '#2A3942', shadow: 'rgba(0,0,0,0.3)', unreadBg: '#00A884', unreadText: '#FFFFFF' }
    };
  
    const currentTheme = themes[isDark ? 'dark' : 'light'];
  
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  
    useEffect(() => { loadChats(); }, []);
  
  const loadChats = async () => {
    setIsLoading(true);
    try {
      const contactsResponse = await parentService.getAvailableContacts();
      const contacts = (contactsResponse?.contacts || contactsResponse?.teachers || []);
      let conversations = [];
      try {
        const convoResponse = await parentService.getConversations();
        // Handle both array response and object with conversations property
        if (Array.isArray(convoResponse)) {
          conversations = convoResponse;
        } else if (convoResponse && Array.isArray(convoResponse.conversations)) {
          conversations = convoResponse.conversations;
        } else {
          console.warn("💡 Conversations endpoint returned non-array data, using empty array");
          conversations = [];
        }
      } catch (convoError) { 
        console.warn("Could not load conversations, proceeding with contact list only.", convoError); 
        conversations = [];
      }
      const finalChats = mergeChatsAndContacts(conversations, contacts);
      const finalChatsWithStatus = finalChats.map((chat, index) => ({ ...chat, isOnline: index % 3 === 0 }));
      setChats(finalChatsWithStatus);
      
      // Load persisted messages from localStorage
      finalChatsWithStatus.forEach(chat => {
        const savedMessages = JSON.parse(localStorage.getItem(`messages_${chat.id}`) || '[]');
        if (savedMessages.length > 0) {
          chat.lastMessage = savedMessages[savedMessages.length - 1]?.message || '';
          chat.lastMessageTime = savedMessages[savedMessages.length - 1]?.timestamp || chat.lastMessageTime;
        }
      });
      
      showNotification('Messages loaded', 'success');
    } catch (error) {
      console.error('❌ Failed to load contacts:', error);
      showNotification('Could not load contacts', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // NEW FUNCTION: Load messages for a specific conversation
  const loadConversationMessages = async (conversationId) => {
    try {
      // Ensure we have a valid conversation ID format (userId_userType)
      let normalizedId = conversationId;
      if (typeof conversationId === 'number' || !conversationId.includes('_')) {
        // If it's a contact ID, use the contact info to build the proper ID
        const contact = selectedChat?.contactInfo;
        if (contact) {
          normalizedId = `${contact.id}_${contact.type || contact.role}`;
          console.log(`🔧 Normalized conversation ID from ${conversationId} to ${normalizedId}`);
        }
      }
      
      console.log(`🔄 Loading messages for conversation: ${normalizedId}`);
      setIsLoading(true);
      
      // Call the conversation messages API endpoint using parentService
      const response = await parentService.getMessageHistory(normalizedId);
      
      console.log(`✅ Loaded ${response.messages?.length || 0} messages for conversation ${normalizedId}`);
      
      // Format messages for the UI
      const formattedMessages = (response.messages || []).map(msg => ({
        id: msg.id,
        message: msg.content || msg.message,
        sent: msg.isOwn || msg.senderId === JSON.parse(localStorage.getItem('user') || '{}')?.id,
        timestamp: msg.createdAt || msg.created_at,
        status: msg.status || 'delivered'
      }));
      
      setMessages(formattedMessages);
      return formattedMessages;
      
    } catch (error) {
      console.error('❌ Failed to load conversation messages:', error);
      showNotification(`Failed to load messages: ${error.message}`, 'error');
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveMessagesToStorage = (chatId, updatedMessages) => {
    localStorage.setItem(`messages_${chatId}`, JSON.stringify(updatedMessages));
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    const messageText = newMessage.trim();
    setNewMessage('');
    const tempMessage = { 
      id: `temp_${Date.now()}`, 
      message: messageText, 
      sent: true, 
      timestamp: new Date().toISOString(), 
      status: 'sending',
      retryCount: 0
    };
    
    const updatedMessages = [...messages, tempMessage];
    setMessages(updatedMessages);
    saveMessagesToStorage(selectedChat.id, updatedMessages);
    
    try {
      const messageData = { 
        recipientId: selectedChat.contactInfo?.id || selectedChat.id,
        recipientType: selectedChat.contactInfo?.type || selectedChat.contactInfo?.role || selectedChat.role,
        message: messageText,
        subject: 'Chat Message',
        timestamp: new Date().toISOString()
      };
      const result = await parentService.sendMessage(messageData);
      
      // Reload conversation messages after sending
      if (selectedChat?.id) {
        console.log('🔄 Reloading conversation messages after send...');
        await loadConversationMessages(selectedChat.id);
      }
      
      const deliveredMessages = messages.map(msg => msg.id === tempMessage.id ? { 
        ...msg, 
        status: 'delivered', 
        id: result.messageId || msg.id,
        deliveredAt: new Date().toISOString()
      } : msg );
      
      setMessages(deliveredMessages);
      saveMessagesToStorage(selectedChat.id, deliveredMessages);
      
      // Simulate read status after 2-5 seconds (in real app, this would come from WebSocket)
      setTimeout(() => {
        const readMessages = deliveredMessages.map(msg => 
          msg.id === (result.messageId || tempMessage.id) ? { ...msg, status: 'read' } : msg
        );
        setMessages(readMessages);
        saveMessagesToStorage(selectedChat.id, readMessages);
      }, Math.random() * 3000 + 2000);
      
      showNotification('Message sent!', 'success');
      setChats(prev => prev.map(chat => chat.id === selectedChat.id ? { ...chat, lastMessage: messageText, lastMessageTime: new Date().toISOString() } : chat ));
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      showNotification('Failed to send message', 'error');
      
      const failedMessages = messages.map(msg => msg.id === tempMessage.id ? { 
        ...msg, 
        status: 'failed',
        failedAt: new Date().toISOString(),
        retryCount: (msg.retryCount || 0) + 1
      } : msg );
      
      setMessages(failedMessages);
      saveMessagesToStorage(selectedChat.id, failedMessages);
    }
  };
  
    const handleKeyPress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
  
    const goBack = () => {
      if (currentView === 'chat') { setCurrentView('chatList'); setSelectedChat(null); setMessages([]); }
      else if (currentView === 'compose') { setCurrentView('chatList'); }
      else { navigate(-1); }
    };
  
    const loadContacts = async () => {
      try {
        setIsLoading(true);
        const response = await parentService.getAvailableContacts();
        let contacts = [];
        if (Array.isArray(response)) contacts = response;
        else if (response && Array.isArray(response.contacts)) contacts = response.contacts;
        else if (response && Array.isArray(response.teachers)) contacts = response.teachers;
        setAvailableContacts(contacts.map(contact => ({ ...contact, avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=128C7E&color=fff&size=50` })));
      } catch (error) {
        console.error('❌ Failed to load contacts:', error);
        showNotification('Could not load contacts', 'error');
      } finally {
        setIsLoading(false);
      }
    };
  
  const startNewChat = (contact) => {
    const newChat = { id: `contact_${contact.id}`, name: contact.name, role: contact.role, avatar: contact.avatar, lastMessage: '', lastMessageTime: new Date().toISOString(), unreadCount: 0, isOnline: false, isPinned: false, messages: [], contactInfo: contact };
    setSelectedChat(newChat);
    
    // Load persisted messages for this chat
    const savedMessages = JSON.parse(localStorage.getItem(`messages_${newChat.id}`) || '[]');
    setMessages(savedMessages);
    
    setCurrentView('chat');
  };
    
    const retryMessage = async (failedMessage) => {
      if (failedMessage.retryCount >= 3) {
        showNotification('Maximum retry attempts reached', 'error');
        return;
      }
      
      console.log('🔄 Retrying message:', failedMessage);
      
      // Update message status to sending
      const sendingMessages = messages.map(msg => 
        msg.id === failedMessage.id ? { ...msg, status: 'sending' } : msg
      );
      setMessages(sendingMessages);
      saveMessagesToStorage(selectedChat.id, sendingMessages);
      
      try {
        const messageData = { 
          to: selectedChat.contactInfo?.email || selectedChat.name, 
          message: failedMessage.message, 
          subject: 'Chat Message', 
          timestamp: new Date().toISOString() 
        };
        const result = await parentService.sendMessage(messageData);
        
        const deliveredMessages = messages.map(msg => 
          msg.id === failedMessage.id ? { 
            ...msg, 
            status: 'delivered', 
            id: result.messageId || msg.id,
            deliveredAt: new Date().toISOString(),
            retryCount: (msg.retryCount || 0) + 1
          } : msg
        );
        
        setMessages(deliveredMessages);
        saveMessagesToStorage(selectedChat.id, deliveredMessages);
        
        showNotification('Message sent successfully!', 'success');
        
        // Simulate read status
        setTimeout(() => {
          const readMessages = deliveredMessages.map(msg => 
            msg.id === (result.messageId || failedMessage.id) ? { ...msg, status: 'read' } : msg
          );
          setMessages(readMessages);
          saveMessagesToStorage(selectedChat.id, readMessages);
        }, Math.random() * 3000 + 2000);
        
      } catch (error) {
        console.error('❌ Failed to retry message:', error);
        const failedMessages = messages.map(msg => 
          msg.id === failedMessage.id ? { 
            ...msg, 
            status: 'failed',
            retryCount: (msg.retryCount || 0) + 1
          } : msg
        );
        setMessages(failedMessages);
        saveMessagesToStorage(selectedChat.id, failedMessages);
        showNotification('Retry failed', 'error');
      }
    };
  
    if (currentView === 'chat' && selectedChat) {
      return <ChatView currentTheme={currentTheme} goBack={goBack} selectedChat={selectedChat} messages={messages} messagesEndRef={messagesEndRef} newMessage={newMessage} setNewMessage={setNewMessage} sendMessage={sendMessage} handleKeyPress={handleKeyPress} inputRef={inputRef} retryMessage={retryMessage} />;
    }
    if (currentView === 'compose') {
      return <ComposeView currentTheme={currentTheme} goBack={goBack} isLoading={isLoading} availableContacts={availableContacts} startNewChat={startNewChat} isDark={isDark} />;
    }
    return <ChatListView currentTheme={currentTheme} setCurrentView={setCurrentView} loadContacts={loadContacts} isLoading={isLoading} chats={chats} searchQuery={searchQuery} setSearchQuery={setSearchQuery} setSelectedChat={setSelectedChat} setMessages={setMessages} loadConversationMessages={loadConversationMessages} isDark={isDark} />;
};

export default WhatsAppStyleMessaging;

