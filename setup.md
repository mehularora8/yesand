# WebRTC OpenAI Realtime API Setup

This project includes a WebRTC service to connect to the OpenAI Realtime API. It's designed to be deployed on Vercel with serverless API routes.

## Prerequisites

1. **OpenAI API Key**: You need an OpenAI API key with access to the Realtime API
2. **Node.js**: Make sure you have Node.js installed (v18 or higher recommended)
3. **Modern Browser**: Chrome, Firefox, Safari, or Edge with WebRTC support

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy the example environment file and add your OpenAI API key:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your OpenAI API key:
```
OPENAI_API_KEY=your_actual_openai_api_key_here
```

### 3. Run the Application

#### Local Development
```bash
npm run dev
```

#### Deploy to Vercel
```bash
# Install Vercel CLI if you haven't already
npm i -g vercel

# Deploy
vercel

# Set environment variable in Vercel dashboard or CLI
vercel env add OPENAI_API_KEY
```

### 4. Access the Application

1. Open your browser and go to your local dev server or deployed URL
2. Click "WebRTC Demo" in the top right corner
3. Click "Connect" to establish a WebRTC connection
4. Allow microphone access when prompted
5. Send test events to interact with the Realtime API

## How It Works

### Architecture
```
Browser (WebRTC Client) ←→ Vercel API Routes ←→ OpenAI Realtime API
```

1. **Token Generation**: Vercel API routes call the OpenAI REST API to generate ephemeral tokens
2. **WebRTC Connection**: The browser uses the ephemeral token to establish a direct WebRTC connection to OpenAI
3. **Real-time Communication**: Audio and events flow directly between browser and OpenAI via WebRTC

### Key Components

- **`api/session.js`**: Vercel API route that generates ephemeral tokens
- **`api/health.js`**: Health check endpoint
- **`src/services/webrtcService.ts`**: WebRTC service class for managing connections
- **`src/components/WebRTCDemo.tsx`**: React component demonstrating the service
- **`vercel.json`**: Vercel configuration for API routes and CORS

### Security

- ✅ **Secure**: API keys are kept on the server, never exposed to the browser
- ✅ **Ephemeral**: Tokens expire after 1 minute for security
- ✅ **Direct**: WebRTC provides direct, encrypted communication with OpenAI
- ✅ **Serverless**: No server maintenance required with Vercel

## Deployment

### Vercel Deployment

1. **Connect your repository** to Vercel
2. **Set environment variables** in the Vercel dashboard:
   - `OPENAI_API_KEY`: Your OpenAI API key
3. **Deploy** - Vercel will automatically build and deploy your app

### Environment Variables in Vercel

In your Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add `OPENAI_API_KEY` with your OpenAI API key
4. Redeploy if necessary

## Extending the Service

The WebRTC service is designed to be extensible. You can:

1. **Add Event Handlers**: Listen for specific Realtime API events
2. **Custom Audio Processing**: Implement audio filters or effects
3. **UI Integration**: Build custom interfaces around the service
4. **Session Management**: Add user authentication and session persistence

### Example: Adding Custom Event Handlers

```typescript
import { webrtcService } from './services/webrtcService';

// Listen for specific events
webrtcService.on('realtimeEvent', (event) => {
  if (event.type === 'conversation.item.created') {
    console.log('New conversation item:', event);
  }
});

// Send custom events
webrtcService.sendEvent({
  type: 'response.create',
  response: {
    modalities: ['audio'],
    instructions: 'Please respond in a cheerful tone.'
  }
});
```

## Troubleshooting

### Common Issues

1. **"OpenAI API key not configured"**
   - Make sure your environment variables are set correctly in Vercel
   - For local development, check your `.env.local` file

2. **"Failed to access microphone"**
   - Allow microphone permissions in your browser
   - Make sure you're using HTTPS or localhost (required for microphone access)

3. **Connection fails**
   - Check that your OpenAI API key has Realtime API access
   - Verify the API routes are working by visiting `/api/health`
   - Check browser console for detailed error messages

4. **CORS errors**
   - The `vercel.json` configuration should handle CORS automatically
   - Check that the API routes are properly configured

### Debug Mode

Enable detailed logging by opening browser developer tools and checking the console. The service logs all connection states and events.

### API Endpoints

- **`/api/session`** (POST): Creates ephemeral tokens for WebRTC connections
- **`/api/health`** (GET): Health check endpoint

## Next Steps

- Implement voice activity detection
- Add conversation history
- Build custom UI components
- Integrate with your existing application
- Add user authentication and session management 