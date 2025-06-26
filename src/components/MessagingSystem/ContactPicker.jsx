import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaSearch, FaUserCircle, FaSpinner, FaPaperPlane } from 'react-icons/fa';
import parentService from '../../services/parentService';
import messagingService from '../../services/messagingService';
import useAuth from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const ContactPicker = ({ onBack, onConversationCreated }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [messageForm, setMessageForm] = useState({
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const contactList = await parentService.getAvailableContacts();
      setContacts(contactList);
    } catch (error) {
      console.error('Failed to load contacts:', error);
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'text-red-600 bg-red-100';
      case 'teacher': return 'text-blue-600 bg-blue-100';
      case 'parent': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return '👑';
      case 'teacher': return '👨‍🏫';
      case 'parent': return '👪';
      default: return '👤';
    }
  };

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    setShowNewMessage(true);
  };

  const handleBackToContacts = () => {
    setShowNewMessage(false);
    setSelectedContact(null);
    setMessageForm({ subject: '', message: '' });
  };

  const handleFormChange = (e) => {
    setMessageForm({
      ...messageForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageForm.subject.trim() || !messageForm.message.trim()) {
      toast.error('Please fill in both subject and message');
      return;
    }

    setSending(true);
    try {
      const conversation = await messagingService.createConversation(
        selectedContact.id,
        selectedContact.type,
        messageForm.subject.trim(),
        messageForm.message.trim()
      );

      toast.success('Message sent successfully!');
      onConversationCreated(conversation);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading contacts...</span>
      </div>
    );
  }

  if (showNewMessage && selectedContact) {
    return (
      <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-gray-50 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBackToContacts}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <FaArrowLeft className="w-4 h-4 text-gray-600" />
            </button>
            
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-lg">{getRoleIcon(selectedContact.role)}</span>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                New Message to {selectedContact.name}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(selectedContact.role)}`}>
                  {selectedContact.role}
                </span>
                <span className="ml-2">{selectedContact.email}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="flex-1 p-4">
          <form onSubmit={handleSendMessage} className="h-full flex flex-col space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={messageForm.subject}
                onChange={handleFormChange}
                placeholder="Enter message subject..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div className="flex-1 flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                name="message"
                value={messageForm.message}
                onChange={handleFormChange}
                placeholder="Type your message here..."
                className="flex-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                style={{ minHeight: '200px' }}
                required
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={sending || !messageForm.subject.trim() || !messageForm.message.trim()}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? (
                  <>
                    <FaSpinner className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-3 mb-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <FaArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">Select Contact</h2>
        </div>
        
        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <FaUserCircle className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium">No contacts found</p>
            <p className="text-sm">
              {searchQuery ? 'Try adjusting your search' : 'No contacts available to message'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredContacts.map(contact => (
              <div
                key={`${contact.type}-${contact.id}`}
                onClick={() => handleContactSelect(contact)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xl">{getRoleIcon(contact.role)}</span>
                    </div>
                  </div>
                  
                  {/* Contact Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {contact.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(contact.role)}`}>
                        {contact.role}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-500 truncate">
                      {contact.email}
                    </p>
                    
                    {/* Role-specific info */}
                    {contact.role === 'teacher' && contact.className && (
                      <p className="text-xs text-blue-600 mt-1">
                        Class: {contact.className}
                      </p>
                    )}
                    
                    {contact.role === 'admin' && (
                      <p className="text-xs text-red-600 mt-1">
                        School Administrator
                      </p>
                    )}
                  </div>
                  
                  {/* Action indicator */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <FaPaperPlane className="w-3 h-3 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with info */}
      <div className="p-4 border-t bg-gray-50 rounded-b-lg">
        <p className="text-xs text-gray-600 text-center">
          Select a contact to start a new conversation
        </p>
        <p className="text-xs text-gray-500 text-center mt-1">
          You can message {user.role === 'parent' ? 'teachers and administrators' : 
                          user.role === 'teacher' ? 'administrators and parents in your classes' :
                          'all teachers and parents'}
        </p>
      </div>
    </div>
  );
};

export default ContactPicker;
