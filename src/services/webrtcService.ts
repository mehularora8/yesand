/* eslint-disable @typescript-eslint/no-unsafe-function-type */
export interface WebRTCConnectionConfig {
  model?: string;
  serverUrl?: string;
}

export interface EphemeralTokenResponse {
  client_secret: {
    value: string;
    expires_at: number;
  };
  id: string;
  model: string;
  voice: string;
}

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private localStream: MediaStream | null = null;
  private isConnected = false;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(private config: WebRTCConnectionConfig = {}) {
    this.config = {
      model: "gpt-4o-realtime-preview-2025-06-03",
      // Use current domain for API calls, fallback to localhost for development
      serverUrl: typeof window !== 'undefined' 
        ? window.location.origin 
        : "http://localhost:5173",
      ...config
    };
  }

  /**
   * Initialize the WebRTC connection to OpenAI Realtime API
   */
  async connect(): Promise<void> {
    try {
      // Step 1: Get ephemeral token from our server
      const ephemeralKey = await this.getEphemeralToken();
      
      // Step 2: Set up peer connection
      await this.setupPeerConnection();
      
      // Step 3: Set up audio streams
      await this.setupAudioStreams();
      
      // Step 4: Set up data channel for events
      this.setupDataChannel();
      
      // Step 5: Create offer and establish connection
      await this.establishConnection(ephemeralKey);
      
      this.isConnected = true;
      this.emit('connected');
      
      console.log('WebRTC connection established successfully');
    } catch (error) {
      console.error('Failed to establish WebRTC connection:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Disconnect from the WebRTC session
   */
  async disconnect(): Promise<void> {
    try {
      if (this.dataChannel) {
        this.dataChannel.close();
        this.dataChannel = null;
      }

      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }

      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }

      if (this.audioElement) {
        this.audioElement.srcObject = null;
        this.audioElement = null;
      }

      this.isConnected = false;
      this.emit('disconnected');
      
      console.log('WebRTC connection closed');
    } catch (error) {
      console.error('Error during disconnect:', error);
      throw error;
    }
  }

  /**
   * Send an event to the Realtime API
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendEvent(event: any): void {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      throw new Error('Data channel is not open');
    }

    try {
      const eventString = JSON.stringify(event);
      this.dataChannel.send(eventString);
      console.log('Sent event:', event);
    } catch (error) {
      console.error('Failed to send event:', error);
      throw error;
    }
  }

  /**
   * Check if the connection is active
   */
  getConnectionState(): boolean {
    return this.isConnected && 
           this.peerConnection?.connectionState === 'connected' &&
           this.dataChannel?.readyState === 'open';
  }

  /**
   * Add event listener
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * Remove event listener
   */
  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Get ephemeral token from our backend server
   */
  private async getEphemeralToken(): Promise<string> {
    try {
      const response = await fetch(`${this.config.serverUrl}/api/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to get ephemeral token: ${errorData.error || response.statusText}`);
      }

      const data: EphemeralTokenResponse = await response.json();
      return data.client_secret.value;
    } catch (error) {
      console.error('Error fetching ephemeral token:', error);
      throw error;
    }
  }

  /**
   * Set up the RTCPeerConnection
   */
  private async setupPeerConnection(): Promise<void> {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    });

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      console.log('Connection state changed:', state);
      this.emit('connectionStateChange', state);
      
      if (state === 'failed' || state === 'disconnected') {
        this.isConnected = false;
        this.emit('disconnected');
      }
    };

    // Handle ICE connection state changes
    this.peerConnection.oniceconnectionstatechange = () => {
      const state = this.peerConnection?.iceConnectionState;
      console.log('ICE connection state changed:', state);
      this.emit('iceConnectionStateChange', state);
    };
  }

  /**
   * Set up audio streams for input and output
   */
  private async setupAudioStreams(): Promise<void> {
    try {
      // Set up remote audio playback
      this.audioElement = document.createElement('audio');
      this.audioElement.autoplay = true;
      
      this.peerConnection!.ontrack = (event) => {
        console.log('Received remote audio track');
        if (this.audioElement) {
          this.audioElement.srcObject = event.streams[0];
        }
        this.emit('remoteAudioTrack', event.streams[0]);
      };

      // Set up local audio input (microphone)
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      // Add local audio track to peer connection
      const audioTrack = this.localStream.getAudioTracks()[0];
      this.peerConnection!.addTrack(audioTrack, this.localStream);
      
      console.log('Local audio track added');
      this.emit('localAudioTrack', this.localStream);
    } catch (error) {
      console.error('Error setting up audio streams:', error);
      throw new Error(`Failed to access microphone: ${error}`);
    }
  }

  /**
   * Set up data channel for sending and receiving events
   */
  private setupDataChannel(): void {
    this.dataChannel = this.peerConnection!.createDataChannel('oai-events');
    
    this.dataChannel.onopen = () => {
      console.log('Data channel opened');
      this.emit('dataChannelOpen');
    };

    this.dataChannel.onclose = () => {
      console.log('Data channel closed');
      this.emit('dataChannelClose');
    };

    this.dataChannel.onerror = (error) => {
      console.error('Data channel error:', error);
      this.emit('dataChannelError', error);
    };

    this.dataChannel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit('realtimeEvent', data);
      } catch (error) {
        console.error('Failed to parse received event:', error);
        this.emit('parseError', error);
      }
    };
  }

  /**
   * Create offer and establish WebRTC connection
   */
  private async establishConnection(ephemeralKey: string): Promise<void> {
    try {
      // Create offer
      const offer = await this.peerConnection!.createOffer();
      await this.peerConnection!.setLocalDescription(offer);

      // Send offer to OpenAI Realtime API
      const baseUrl = "https://api.openai.com/v1/realtime";
      const response = await fetch(`${baseUrl}?model=${this.config.model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          "Content-Type": "application/sdp"
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to establish connection: ${response.status} ${errorText}`);
      }

      // Set remote description with the answer
      const answerSdp = await response.text();
      const answer: RTCSessionDescriptionInit = {
        type: "answer",
        sdp: answerSdp,
      };
      
      await this.peerConnection!.setRemoteDescription(answer);
      console.log('Remote description set successfully');
    } catch (error) {
      console.error('Error establishing connection:', error);
      throw error;
    }
  }

  /**
   * Emit events to listeners
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
}

// Export a singleton instance for easy use
export const webrtcService = new WebRTCService(); 