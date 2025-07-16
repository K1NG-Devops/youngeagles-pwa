import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FaPlay, FaDownload, FaExpand, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

// Interactive Flashcard Component
export const InteractiveFlashcard = ({ cards, title }) => {
  const { isDark } = useTheme();
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);

  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % cards.length);
    setIsFlipped(false);
  };

  const prevCard = () => {
    setCurrentCard((prev) => (prev - 1 + cards.length) % cards.length);
    setIsFlipped(false);
  };

  return (
    <div className={`max-w-md mx-auto p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h3 className={`text-lg font-semibold mb-4 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>
      
      <div className="relative h-48 mb-4">
        <div 
          className={`absolute inset-0 rounded-lg cursor-pointer transition-transform duration-300 ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className={`w-full h-full flex items-center justify-center text-2xl font-bold rounded-lg ${
            isDark ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-800'
          }`}>
            {isFlipped ? cards[currentCard].split(' - ')[1] || 'Answer' : cards[currentCard].split(' - ')[0]}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <button
          onClick={prevCard}
          className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
        >
          Previous
        </button>
        
        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {currentCard + 1} / {cards.length}
        </span>
        
        <button
          onClick={nextCard}
          className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
        >
          Next
        </button>
      </div>
      
      <div className="mt-4 text-center">
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Click card to flip
        </p>
      </div>
    </div>
  );
};

// Digital Storybook Component
export const DigitalStorybook = ({ pages, title }) => {
  const { isDark } = useTheme();
  const [currentPage, setCurrentPage] = useState(0);
  const [isReading, setIsReading] = useState(false);

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const readAloud = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(pages[currentPage].text);
      utterance.rate = 0.8;
      utterance.pitch = 1.2;
      setIsReading(true);
      
      utterance.onend = () => setIsReading(false);
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className={`max-w-2xl mx-auto p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h3 className={`text-xl font-semibold mb-4 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Image */}
        <div className={`aspect-square rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center`}>
          <div className="text-6xl">
            {currentPage === 0 ? '📚' : currentPage === 1 ? '👶' : '🌟'}
          </div>
        </div>
        
        {/* Text */}
        <div className="flex flex-col justify-center">
          <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {pages[currentPage].text}
          </p>
          
          <button
            onClick={readAloud}
            disabled={isReading}
            className={`mt-4 self-start px-4 py-2 rounded-lg transition-colors ${
              isReading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            } text-white`}
          >
            {isReading ? (
              <>
                <FaVolumeUp className="inline mr-2" />
                Reading...
              </>
            ) : (
              <>
                <FaPlay className="inline mr-2" />
                Read Aloud
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className={`px-4 py-2 rounded-lg ${
            currentPage === 0 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Previous
        </button>
        
        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Page {currentPage + 1} of {pages.length}
        </span>
        
        <button
          onClick={nextPage}
          disabled={currentPage === pages.length - 1}
          className={`px-4 py-2 rounded-lg ${
            currentPage === pages.length - 1 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

// Audio Player Component
export const AudioPlayer = ({ audioUrl, title, duration }) => {
  const { isDark } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className={`max-w-md mx-auto p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h3 className={`text-lg font-semibold mb-4 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>
      
      {/* Audio Visualization */}
      <div className={`h-32 rounded-lg mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center`}>
        <div className="flex items-center space-x-1">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`w-2 bg-blue-500 rounded-full animate-pulse`}
              style={{
                height: `${Math.random() * 60 + 20}px`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className={`h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
          <div 
            className="h-2 bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${(currentTime / 225) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}</span>
          <span>{duration}</span>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`p-3 rounded-full ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
        >
          {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>
        
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={isMuted ? 0 : volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-20"
        />
      </div>
    </div>
  );
};

// Interactive Game Component
export const InteractiveGame = ({ gameData, title }) => {
  const { isDark } = useTheme();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setCurrentLevel(0);
  };

  const nextLevel = () => {
    if (currentLevel < gameData.levels.length - 1) {
      setCurrentLevel(currentLevel + 1);
      setScore(score + 10);
    }
  };

  return (
    <div className={`max-w-lg mx-auto p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h3 className={`text-xl font-semibold mb-4 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>
      
      {!gameStarted ? (
        <div className="text-center">
          <div className="text-6xl mb-4">🎮</div>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Ready to start learning through play?
          </p>
          <button
            onClick={startGame}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Start Game
          </button>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Level: {gameData.levels[currentLevel]}
            </span>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Score: {score}
            </span>
          </div>
          
          <div className={`h-40 rounded-lg mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center`}>
            <div className="text-center">
              <div className="text-4xl mb-2">
                {currentLevel === 0 ? '🔢' : currentLevel === 1 ? '🔤' : '🎯'}
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Interactive content for {gameData.levels[currentLevel]}
              </p>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={nextLevel}
              disabled={currentLevel === gameData.levels.length - 1}
              className={`px-4 py-2 rounded-lg ${
                currentLevel === gameData.levels.length - 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Next Level
            </button>
            
            <button
              onClick={() => setGameStarted(false)}
              className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
            >
              Restart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Worksheet Preview Component
export const WorksheetPreview = ({ worksheetData, title }) => {
  const { isDark } = useTheme();
  const [currentPage, setCurrentPage] = useState(0);

  const downloadWorksheet = () => {
    // In a real app, this would trigger a PDF download
    alert('Worksheet download would start here');
  };

  return (
    <div className={`max-w-2xl mx-auto p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h3 className={`text-xl font-semibold mb-4 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>
      
      <div className={`h-96 rounded-lg mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center border-2 border-dashed ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Worksheet Preview
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {worksheetData.pages} pages of activities
          </p>
        </div>
      </div>
      
      <div className="flex justify-center space-x-4">
        <button
          onClick={downloadWorksheet}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <FaDownload className="inline mr-2" />
          Download PDF
        </button>
        
        <button
          onClick={() => alert('Print preview would open here')}
          className={`px-6 py-3 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
        >
          Print Preview
        </button>
      </div>
    </div>
  );
};

// Video Player Component
export const VideoPlayer = ({ videoData, title }) => {
  const { isDark } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(0);

  return (
    <div className={`max-w-2xl mx-auto p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h3 className={`text-xl font-semibold mb-4 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>
      
      <div className={`aspect-video rounded-lg mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center relative`}>
        {!isPlaying ? (
          <button
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-colors"
          >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <FaPlay className="text-2xl text-black ml-1" />
            </div>
          </button>
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-2">🎬</div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Playing: {videoData.chapters[currentChapter]}
            </p>
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Chapters
        </h4>
        <div className="space-y-2">
          {videoData.chapters.map((chapter, index) => (
            <button
              key={index}
              onClick={() => setCurrentChapter(index)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                currentChapter === index
                  ? 'bg-blue-600 text-white'
                  : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {index + 1}. {chapter}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`px-4 py-2 rounded-lg ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        
        <button
          onClick={() => alert('Fullscreen would be enabled here')}
          className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
        >
          <FaExpand className="inline mr-2" />
          Fullscreen
        </button>
      </div>
    </div>
  );
};
