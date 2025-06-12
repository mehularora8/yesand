import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { webrtcService } from '../services/webrtcService';

interface AppContextType {
  isConnected: boolean;
  isConnecting: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  startListening: () => void;
  stopListening: () => void;
  clearError: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set up WebRTC event listeners
  useEffect(() => {
    const handleConnected = () => {
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      setIsConnecting(false);
      setIsListening(false);
      setIsSpeaking(false);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleError = (error: any) => {
      setError(error.message || 'Connection error');
      setIsConnecting(false);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleRealtimeEvent = (event: any) => {
      // Handle different types of realtime events
      if (event.type === 'conversation.item.create') {
        // AI is starting to respond
        setIsSpeaking(true);
        setIsListening(false);
      } else if (event.type === 'conversation.item.completed') {
        // AI finished responding
        setIsSpeaking(false);
        setIsListening(true);
      } else if (event.type === 'session.updated') {
        // Session state changed
        console.log('Session updated:', event);
      } else if (event.type === 'response.done') {
        setIsSpeaking(false);
        setIsListening(true);
      }
    };

    const handleDataChannelOpen = () => {
      console.log('Data channel opened - ready for communication');
    };

    const handleDataChannelClose = () => {
      console.log('Data channel closed');
    };

    // Add event listeners
    webrtcService.on('connected', handleConnected);
    webrtcService.on('disconnected', handleDisconnected);
    webrtcService.on('error', handleError);
    webrtcService.on('realtimeEvent', handleRealtimeEvent);
    webrtcService.on('dataChannelOpen', handleDataChannelOpen);
    webrtcService.on('dataChannelClose', handleDataChannelClose);

    // Cleanup on unmount
    return () => {
      webrtcService.off('connected', handleConnected);
      webrtcService.off('disconnected', handleDisconnected);
      webrtcService.off('error', handleError);
      webrtcService.off('realtimeEvent', handleRealtimeEvent);
      webrtcService.off('dataChannelOpen', handleDataChannelOpen);
      webrtcService.off('dataChannelClose', handleDataChannelClose);
    };
  }, []);

  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);
      await webrtcService.connect();
    } catch {
      setError('Error connecting');
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await webrtcService.disconnect();
    } catch {
      setError('Error disconnecting');
    }
  }, []);

  const startListening = useCallback(() => {
    console.log('Starting listening');
    if (!isConnected) {
      setError('Not connected to WebRTC service');
      return;
    }

    try {
      // Send a session update to start the conversation
      const sessionEvent = {
        type: 'session.update',
        session: {
          modalities: ['text', 'audio'],
          instructions: 'You are a helpful assistant. Please respond in English.',
          voice: 'verse',
          input_audio_format: 'pcm16',
          output_audio_format: 'pcm16',
          input_audio_transcription: {
            model: 'whisper-1'
          }
        }
      };

      webrtcService.sendEvent(sessionEvent);
      setIsListening(true);
      setIsSpeaking(false);
      setError(null);
    } catch {
      setError('Error starting listening');
    }
  }, [isConnected]);

  const stopListening = useCallback(() => {
    console.log('Stopping listening');
    setIsListening(false);
    setIsSpeaking(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AppContextType = {
    isConnected,
    isConnecting,
    isListening,
    isSpeaking,
    error,
    connect,
    disconnect,
    startListening,
    stopListening,
    clearError,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}; 