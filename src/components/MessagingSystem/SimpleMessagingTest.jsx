import React, { useState, useRef } from 'react';
import parentService from '../../services/parentService';
import { showNotification } from '../../utils/notifications';

const SimpleMessagingTest = () => {
  // Minimal state
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  // Simple form handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🧪 TEST: Submitting:', message);

    if (!message.trim()) return;

    try {
      const response = await parentService.sendMessage({
        to: 'test_recipient',
        message: message.trim(),
        subject: 'Test Message'
      });

      console.log('🧪 TEST: Response:', response);
      setMessage('');
      showNotification('Test message sent!', 'success');
    } catch (error) {
      console.error('🧪 TEST: Error:', error);
      showNotification('Failed to send test message', 'error');
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="bg-blue-100 p-4 rounded-lg mb-4">
        <h1 className="text-lg font-bold mb-2">🧪 Messaging System Test</h1>
        <p className="text-sm">
          This is a minimal test component to verify basic messaging functionality.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => {
              console.log('🧪 TEST: Input changed:', e.target.value);
              setMessage(e.target.value);
            }}
            placeholder="Type test message..."
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Send Test Message
        </button>

        <div className="text-sm text-gray-600 bg-gray-100 p-3 rounded">
          Debug Info:
          <br />
          Current Message: "{message}"
        </div>
      </form>
    </div>
  );
};

export default SimpleMessagingTest; 