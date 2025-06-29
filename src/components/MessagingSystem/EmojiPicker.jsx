import React, { useState, useEffect, useRef } from 'react';
import { FaSmile, FaTimes } from 'react-icons/fa';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

const EmojiPicker = ({ onEmojiSelect, isDark }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEmojiSelect = (emoji) => {
    onEmojiSelect(emoji.native);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={pickerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors
          ${isOpen ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
        title="Open emoji picker"
      >
        <FaSmile className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-12 right-0 z-50">
          <div className="relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-2 top-2 z-10 p-1 rounded-full bg-gray-200 dark:bg-gray-700
                hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <FaTimes className="text-sm text-gray-600 dark:text-gray-300" />
            </button>
            <Picker
              data={data}
              onEmojiSelect={handleEmojiSelect}
              theme={isDark ? 'dark' : 'light'}
              previewPosition="none"
              skinTonePosition="none"
              searchPosition="none"
              maxFrequentRows={2}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EmojiPicker; 