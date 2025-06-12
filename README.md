# Yes And - Voice AI Application

A real-time voice conversation application built with React, TypeScript, and OpenAI's Realtime API using WebRTC.

## Features

- 🎤 **Real-time Voice Conversations**: Connect directly to OpenAI's Realtime API via WebRTC
- 🎯 **Simple Interface**: Clean, intuitive voice circle interface
- 🔄 **Automatic State Management**: Handles connection, listening, and speaking states
- 🛡️ **Secure**: Uses ephemeral tokens for secure API communication
- 📱 **Responsive**: Works on desktop and mobile devices

## How It Works

1. **Connection**: Click the voice circle to establish a WebRTC connection to OpenAI
2. **Listening**: The circle turns blue and listens for your voice input
3. **Processing**: AI processes your speech and generates a response
4. **Speaking**: The circle turns green as the AI speaks back to you
5. **Repeat**: Click again to stop or start a new conversation

## Architecture

```
React App → AppContext → WebRTC Service → OpenAI Realtime API
```

- **AppContext**: Manages application state and WebRTC lifecycle
- **WebRTC Service**: Handles connection, audio streams, and event communication
- **VoiceCircle**: Main UI component for voice interaction
- **API Routes**: Serverless functions for ephemeral token generation

## Setup

### Prerequisites

- Node.js 18+ 
- OpenAI API key with Realtime API access
- Modern browser with WebRTC support

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   Add your OpenAI API key to `.env.local`:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Run locally**:
   ```bash
   npm run dev
   ```

4. **Deploy to Vercel**:
   ```bash
   npm install -g vercel
   vercel
   ```

## Usage

1. Open the application in your browser
2. Click the microphone circle to connect
3. Allow microphone access when prompted
4. Start speaking - the AI will respond in real-time
5. Click again to stop the conversation

## Components

### AppContext
- Manages WebRTC connection state
- Handles real-time events from OpenAI
- Provides connection, listening, and speaking states

### VoiceCircle
- Main interaction component
- Visual feedback for different states
- Handles click events for connection and conversation control

### WebRTC Service
- Establishes and manages WebRTC connections
- Handles audio input/output streams
- Manages data channel for event communication

## State Management

The application uses React Context to manage the following states:

- **isConnected**: WebRTC connection status
- **isConnecting**: Connection establishment in progress
- **isListening**: Currently listening for user input
- **isSpeaking**: AI is currently speaking
- **error**: Any connection or communication errors

## API Endpoints

- `/api/session` (POST): Creates ephemeral tokens for WebRTC connections
- `/api/health` (GET): Health check endpoint

## Development

### Local Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Linting
```bash
npm run lint
```

## Troubleshooting

### Common Issues

1. **"OpenAI API key not configured"**
   - Ensure your `.env.local` file has the correct API key
   - For Vercel deployment, set the environment variable in the dashboard

2. **"Failed to access microphone"**
   - Allow microphone permissions in your browser
   - Ensure you're using HTTPS or localhost

3. **Connection fails**
   - Check that your OpenAI API key has Realtime API access
   - Verify the API routes are working by visiting `/api/health`

4. **Audio not working**
   - Check browser console for WebRTC errors
   - Ensure your browser supports WebRTC
   - Try refreshing the page and reconnecting

## Security

- ✅ API keys are kept server-side and never exposed to the browser
- ✅ Ephemeral tokens expire after 1 minute
- ✅ WebRTC provides encrypted, direct communication
- ✅ No audio data is stored or logged

## Browser Support

- Chrome 66+
- Firefox 60+
- Safari 14+
- Edge 79+

## License

MIT License - see LICENSE file for details. 