/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import { webrtcService, WebRTCService } from '../services/webrtcService';
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX } from 'lucide-react';

export const WebRTCDemo: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionState, setConnectionState] = useState<string>('new');
  const [isMuted, setIsMuted] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const eventsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set up event listeners
    const handleConnected = () => {
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      setIsConnecting(false);
    };

    const handleError = (error: any) => {
      setError(error.message || 'Connection error');
      setIsConnecting(false);
    };

    const handleConnectionStateChange = (state: string) => {
      setConnectionState(state);
    };

    const handleRealtimeEvent = (event: any) => {
      setEvents(prev => [...prev, { 
        timestamp: new Date().toISOString(), 
        type: 'received', 
        data: event 
      }]);
    };

    const handleLocalAudioTrack = (stream: MediaStream) => {
      setHasAudio(true);
    };

    const handleRemoteAudioTrack = (stream: MediaStream) => {
      console.log('Remote audio track received');
    };

    // Add event listeners
    webrtcService.on('connected', handleConnected);
    webrtcService.on('disconnected', handleDisconnected);
    webrtcService.on('error', handleError);
    webrtcService.on('connectionStateChange', handleConnectionStateChange);
    webrtcService.on('realtimeEvent', handleRealtimeEvent);
    webrtcService.on('localAudioTrack', handleLocalAudioTrack);
    webrtcService.on('remoteAudioTrack', handleRemoteAudioTrack);

    // Cleanup on unmount
    return () => {
      webrtcService.off('connected', handleConnected);
      webrtcService.off('disconnected', handleDisconnected);
      webrtcService.off('error', handleError);
      webrtcService.off('connectionStateChange', handleConnectionStateChange);
      webrtcService.off('realtimeEvent', handleRealtimeEvent);
      webrtcService.off('localAudioTrack', handleLocalAudioTrack);
      webrtcService.off('remoteAudioTrack', handleRemoteAudioTrack);
    };
  }, []);

  // Auto-scroll events to bottom
  useEffect(() => {
    if (eventsRef.current) {
      eventsRef.current.scrollTop = eventsRef.current.scrollHeight;
    }
  }, [events]);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      await webrtcService.connect();
    } catch (error: any) {
      setError(error.message);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await webrtcService.disconnect();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleSendTestEvent = () => {
    try {
      const testEvent = {
        type: 'session.update',
        session: {
          modalities: ['text', 'audio'],
          instructions: 'You are a helpful assistant.',
          voice: 'verse',
          input_audio_format: 'pcm16',
          output_audio_format: 'pcm16',
          input_audio_transcription: {
            model: 'whisper-1'
          }
        }
      };
      
      webrtcService.sendEvent(testEvent);
      setEvents(prev => [...prev, { 
        timestamp: new Date().toISOString(), 
        type: 'sent', 
        data: testEvent 
      }]);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const clearEvents = () => {
    setEvents([]);
  };

  const getConnectionStatusColor = () => {
    if (isConnected) return 'text-green-600';
    if (isConnecting) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConnectionStatusText = () => {
    if (isConnected) return 'Connected';
    if (isConnecting) return 'Connecting...';
    return 'Disconnected';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Yes And Demo
        </h2>
        
        {/* Connection Status */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${getConnectionStatusColor()}`}>
              <div className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500' : 
                isConnecting ? 'bg-yellow-500 animate-pulse' : 
                'bg-red-500'
              }`} />
              <span className="font-medium">{getConnectionStatusText()}</span>
            </div>
            <span className="text-sm text-gray-500">
              State: {connectionState}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {hasAudio && (
              <div className="flex items-center space-x-1 text-green-600">
                <Mic className="w-4 h-4" />
                <span className="text-sm">Audio Ready</span>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-6">
          {!isConnected ? (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>{isConnecting ? 'Connecting...' : 'Connect'}</span>
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              <PhoneOff className="w-4 h-4" />
              <span>Disconnect</span>
            </button>
          )}

          <button
            onClick={handleSendTestEvent}
            disabled={!isConnected}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
          >
            <span>Send Test Event</span>
          </button>

          <button
            onClick={clearEvents}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            <span>Clear Events</span>
          </button>
        </div>

        {/* Events Log */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Events Log ({events.length})
          </h3>
          <div 
            ref={eventsRef}
            className="bg-white rounded border max-h-96 overflow-y-auto p-3 space-y-2"
          >
            {events.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No events yet. Connect and send a test event to see activity.
              </p>
            ) : (
              events.map((event, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-md border-l-4 ${
                    event.type === 'sent' 
                      ? 'bg-blue-50 border-blue-400' 
                      : 'bg-green-50 border-green-400'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-sm font-medium ${
                      event.type === 'sent' ? 'text-blue-700' : 'text-green-700'
                    }`}>
                      {event.type === 'sent' ? '→ Sent' : '← Received'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <pre className="text-xs text-gray-700 overflow-x-auto">
                    {JSON.stringify(event.data, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 