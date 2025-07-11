import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FaAward, FaSmile } from 'react-icons/fa';

const NativeAd = ({ 
  context = {},
  className = '',
  size = 'compact' // compact, full
}) => {
  const { isDark } = useTheme();

  // Sample native ad content
  const ads = [
    {
      id: 'native-1',
      title: 'Trusted by 100+ Schools',
      description: 'Join the community of learners and educators achieving more.',
      cta: 'Get Involved',
      bgColor: 'bg-yellow-500',
      textColor: 'text-white',
      icon: FaAward
    },
    {
      id: 'native-2',
      title: 'Smiles All Around',
      description: 'Parents and kids love our interactive learning content.',
      cta: 'See How',
      bgColor: 'bg-pink-500',
      textColor: 'text-white',
      icon: FaSmile
    }
  ];

  // Select a random native ad
  const selectedAd = ads[Math.floor(Math.random() * ads.length)];

  const handleAdClick = () => {
    console.log('Native ad clicked:', selectedAd.id);
  };

  const IconComponent = selectedAd.icon;

  return (
    <div 
      className={`
        w-full p-4 rounded-lg shadow-sm transition-transform transform hover:scale-105 cursor-pointer ${selectedAd.bgColor}
        ${className}
      `}
      onClick={handleAdClick}
    >
      <div className="flex items-center">
        <div className="mr-4">
          <IconComponent className="text-3xl" />
        </div>
        <div>
          <h3 className={`text-lg font-bold ${selectedAd.textColor}`}>{selectedAd.title}</h3>
          <p className={`text-sm ${selectedAd.textColor} opacity-90`}>{selectedAd.description}</p>
        </div>
      </div>
      <div className="mt-2">
        <button className={`
          mt-2 px-4 py-1 rounded-full text-sm font-medium transition-colors
          ${isDark ? 'bg-white bg-opacity-20 hover:bg-opacity-30' : 'bg-white bg-opacity-30 hover:bg-opacity-40'}
        `}>
          {selectedAd.cta}
        </button>
      </div>
    </div>
  );
};

export default NativeAd;

