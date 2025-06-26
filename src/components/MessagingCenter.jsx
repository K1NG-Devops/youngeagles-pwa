import React, { useState, useEffect } from 'react';
import { FaComments, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import parentService from '../services/parentService';
import { toast } from 'react-toastify';

const MessagingCenter = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ subject: '', message: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await parentService.getMessages();
        setMessages(Array.isArray(res) ? res : res.messages || []);
      } catch (_err) {
        setError('Failed to load messages');
        toast.error('Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSend = async e => {
    e.preventDefault();
    if (!form.subject || !form.message) {
      toast.error('Please fill in both subject and message');
      return;
    }
    setSending(true);
    try {
      await parentService.sendMessage(form);
      toast.success('Message sent!');
      setForm({ subject: '', message: '' });
      // Refresh messages
      const res = await parentService.getMessages();
      setMessages(Array.isArray(res) ? res : res.messages || []);
    } catch (_err) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-full overflow-x-hidden pb-20">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
        <h1 className="text-xl font-bold mb-1">Messages</h1>
        <p className="text-sm text-indigo-100">Chat with teachers and school admin</p>
      </div>
      {/* Send Message Form */}
      <form onSubmit={handleSend} className="bg-white rounded-lg shadow p-4 space-y-3 border">
        <h3 className="text-lg font-semibold mb-2">Send a Message</h3>
        <input
          name="subject"
          value={form.subject}
          onChange={handleChange}
          placeholder="Subject"
          className="w-full border rounded-lg px-3 py-2 mb-2"
          required
        />
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Type your message..."
          className="w-full border rounded-lg px-3 py-2 min-h-[80px]"
          required
        />
        <button
          type="submit"
          disabled={sending}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {sending ? <FaSpinner className="animate-spin mr-2" /> : <FaPaperPlane className="mr-2" />}
          <span>{sending ? 'Sending...' : 'Send Message'}</span>
        </button>
      </form>
      {/* Messages List */}
      <div className="bg-white rounded-lg shadow p-4 border">
        <h3 className="text-lg font-semibold mb-4">Inbox</h3>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <FaSpinner className="animate-spin text-gray-400 text-2xl" />
            <span className="ml-2 text-gray-500">Loading messages...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-gray-500 text-center">No messages yet.</div>
        ) : (
          <div className="space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className="p-3 rounded-lg border bg-gray-50">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-blue-700 text-sm">{msg.from || msg.fromRole || 'School'}</span>
                  <span className="text-xs text-gray-400">{new Date(msg.date).toLocaleString()}</span>
                </div>
                <div className="font-medium text-gray-900 mb-1">{msg.subject}</div>
                <div className="text-gray-700 text-sm whitespace-pre-line">{msg.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingCenter;
