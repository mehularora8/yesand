import React from 'react';
import { useApp } from '../contexts/AppContext';
// import { Mic, MicOff, RotateCw } from 'lucide-react';

type VoiceState = 'idle' | 'connecting' | 'listening' | 'speaking' | 'error';

const VoiceCircle: React.FC = () => {
  const { 
    isConnected, 
    isConnecting, 
    isListening, 
    isSpeaking, 
    error, 
    connect,
    disconnect
  } = useApp();

  const handleClick = async () => {
    if (isConnected) {
      disconnect();
      return;
    }

    if (error) {
      // If there's an error, try to reconnect
      await connect();
      return;
    }

    if (!isConnected && !isConnecting) {
      // Not connected, start connection
      await connect();
      return;
    }
  };

  const getVoiceState = (): VoiceState => {
    if (error) return 'error';
    if (isConnecting) return 'connecting';
    if (isSpeaking) return 'speaking';
    if (isListening) return 'listening';
    return 'idle';
  };

  const voiceState = getVoiceState();

  const getCircleClasses = () => {
    const baseClasses = "relative flex items-center justify-center rounded-full transition-all duration-500 cursor-pointer border-2 border-rose-900";
    
    switch (voiceState) {
      case 'idle':
        return `${baseClasses} bg-white hover:bg-gray-50`;
      case 'connecting':
        return `${baseClasses} bg-indicator-yellow`;
      case 'listening':
        return `${baseClasses} bg-blue-500`;
      case 'speaking':
        return `${baseClasses} bg-green-500`;
      case 'error':
        return `${baseClasses} bg-indicator-red`;
      default:
        return baseClasses;
    }
  };

  const getIcon = () => {
    switch (voiceState) {
      case 'idle':
        return <div className="text-4xl sm:text-5xl md:text-6xl">🎤</div>;
      case 'connecting':
        return <div className="text-4xl sm:text-5xl md:text-6xl animate-pulse">📡</div>;
      case 'listening':
        return <div className="text-4xl sm:text-5xl md:text-6xl">🎙️</div>;
      case 'speaking':
        return <div className="text-4xl sm:text-5xl md:text-6xl">🔊</div>;
      case 'error':
        return <div className="text-4xl sm:text-5xl md:text-6xl">🤷‍♀️</div>;
      default:
        return <div className="text-4xl sm:text-5xl md:text-6xl">🤷‍♀️</div>;
    }
  };

  const getStatusText = () => {
    switch (voiceState) {
      case 'idle':
        return isConnected ? 'Connected' : 'Ready to start';
      case 'connecting':
        return 'Connecting...';
      case 'listening':

        return 'Listening...';
      case 'speaking':
        return 'Speaking...';
      case 'error':
        return 'Error - Click to retry';
      default:
        return '';
    }
  };

  return (
    <div className="relative">
      <div 
        className={`${getCircleClasses()} w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 lg:w-48 lg:h-48`}
        onClick={handleClick}
      >
        {getIcon()}
      </div>
      
      {/* Status text */}
      <div className="absolute -bottom-6 sm:-bottom-8 left-1/2 transform -translate-x-1/2 text-xs sm:text-sm font-light min-w-32 sm:min-w-48 flex items-center justify-center text-cyan-800">
        {getStatusText()}
      </div>
    </div>
  );
};

export default VoiceCircle;