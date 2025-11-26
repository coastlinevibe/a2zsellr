# Social Integrations Setup Guide

Complete guide for setting up WhatsApp, Facebook, and Instagram integrations.

## Overview

The social integrations system consists of:
- **Backend Server**: Node.js/Express server with WPPConnect for WhatsApp
- **Frontend Components**: React components for displaying QR codes and managing integrations
- **Real-time Communication**: Socket.io for live updates

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Dashboard → Integrations Tab                        │   │
│  │  ├── WhatsAppIntegration.tsx                         │   │
│  │  ├── FacebookIntegration.tsx                         │   │
│  │  ├── InstagramIntegration.tsx                        │   │
│  │  ├── QRCodeDisplay.tsx                              │   │
│  │  └── QRCodeScanner.tsx                              │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↕ (Socket.io + REST API)            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Backend Server (Node.js)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Express Server (Port 3001)                          │   │
│  │  ├── /api/whatsapp/* (WPPConnect)                   │   │
│  │  ├── /api/facebook/* (Coming Soon)                  │   │
│  │  └── /api/instagram/* (Coming Soon)                 │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Services                                            │   │
│  │  ├── whatsappService.js (WPPConnect Client)         │   │
│  │  ├── facebookService.js (Placeholder)               │   │
│  │  └── instagramService.js (Placeholder)              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Setup

### 1. Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:3001
```

### 2. Components

All integration components are located in `components/integrations/`:

- **WhatsAppIntegration.tsx** - Main WhatsApp integration component
- **FacebookIntegration.tsx** - Facebook integration (placeholder)
- **InstagramIntegration.tsx** - Instagram integration (placeholder)
- **QRCodeDisplay.tsx** - QR code display modal
- **QRCodeScanner.tsx** - QR code scanner component

### 3. Hooks

The `useSocialIntegration` hook handles all Socket.io communication:

```typescript
import { useSocialIntegration } from '@/hooks/useSocialIntegration'

export default function MyComponent() {
  const {
    qrCode,
    isConnected,
    isLoading,
    error,
    sessionId,
    initializeIntegration,
    getStatus,
    disconnect,
    socket
  } = useSocialIntegration('whatsapp')

  // Use the hook...
}
```

### 4. Utilities

QR code utilities are available in `lib/qrCodeUtils.ts`:

```typescript
import {
  generateQRCode,
  downloadQRCode,
  copyQRCodeToClipboard,
  isCameraSupported,
  requestCameraPermission
} from '@/lib/qrCodeUtils'
```

## Backend Setup

### 1. Installation

```bash
cd server
npm install
```

### 2. Environment Configuration

Create `.env` file:

```bash
cp .env.example .env
```

Update with your settings:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
WPP_HEADLESS=true
WPP_USE_CHROME=true
```

### 3. Start the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server will be available at `http://localhost:3001`

## WhatsApp Integration Flow

### 1. User Initiates Connection

```
User clicks "Connect WhatsApp" button
    ↓
Frontend calls POST /api/whatsapp/init
    ↓
Backend creates WPPConnect client
    ↓
QR code generated
    ↓
Socket.io emits 'whatsapp:qr' event
    ↓
Frontend displays QR code modal
```

### 2. User Scans QR Code

```
User scans QR code with phone
    ↓
WPPConnect authenticates
    ↓
Socket.io emits 'whatsapp:ready' event
    ↓
Frontend shows success message
    ↓
Connection established
```

### 3. Real-time Message Handling

```
Message received on WhatsApp
    ↓
WPPConnect detects message
    ↓
Socket.io emits 'whatsapp:message' event
    ↓
Frontend updates UI
```

## API Usage Examples

### Initialize WhatsApp

```javascript
const response = await fetch('http://localhost:3001/api/whatsapp/init', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sessionId: 'user-123' })
})

const data = await response.json()
console.log(data.qrCode) // Display QR code
```

### Get Status

```javascript
const response = await fetch('http://localhost:3001/api/whatsapp/status/user-123')
const status = await response.json()
console.log(status.connected) // true/false
```

### Send Message

```javascript
const response = await fetch('http://localhost:3001/api/whatsapp/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: 'user-123',
    chatId: '1234567890@c.us',
    message: 'Hello from A2Z!'
  })
})

const result = await response.json()
console.log(result.success)
```

### Disconnect

```javascript
const response = await fetch('http://localhost:3001/api/whatsapp/disconnect/user-123', {
  method: 'POST'
})

const result = await response.json()
console.log(result.success)
```

## Socket.io Events

### Listening for Events

```typescript
import io from 'socket.io-client'

const socket = io('http://localhost:3001')

// QR Code Generated
socket.on('whatsapp:qr', (data) => {
  console.log('QR Code:', data.qr)
  displayQRCode(data.qr)
})

// Connection Ready
socket.on('whatsapp:ready', (data) => {
  console.log('WhatsApp Ready:', data.sessionId)
  showSuccessMessage()
})

// Authentication Failed
socket.on('whatsapp:auth-failed', (data) => {
  console.error('Auth Failed:', data.error)
  showErrorMessage(data.error)
})

// New Message
socket.on('whatsapp:message', (data) => {
  console.log('New Message:', data.message)
  updateMessageList(data.message)
})

// Incoming Call
socket.on('whatsapp:call', (data) => {
  console.log('Incoming Call:', data.call)
  notifyIncomingCall(data.call)
})
```

## Troubleshooting

### QR Code Not Displaying

1. Check if backend server is running
2. Verify `NEXT_PUBLIC_SERVER_URL` is correct
3. Check browser console for errors
4. Verify Socket.io connection in Network tab

### Connection Fails After Scanning

1. Ensure Chrome/Chromium is installed on server
2. Check server logs for errors
3. Verify WhatsApp account is not already connected elsewhere
4. Try disconnecting and reconnecting

### Messages Not Receiving

1. Check Socket.io connection status
2. Verify WhatsApp is connected (check status endpoint)
3. Check server logs for message handling errors
4. Ensure message format is correct

### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>
```

## Performance Optimization

### Frontend

- Use React.memo for integration components
- Implement lazy loading for QR code scanner
- Debounce status checks
- Cache QR codes temporarily

### Backend

- Implement session cleanup
- Use connection pooling
- Add rate limiting
- Monitor memory usage

## Security Considerations

1. **Session Management**
   - Use secure session IDs
   - Implement session expiration
   - Clear sessions on disconnect

2. **Data Protection**
   - Encrypt sensitive data
   - Use HTTPS in production
   - Validate all inputs

3. **Authentication**
   - Implement user authentication
   - Verify session ownership
   - Add CORS restrictions

4. **Rate Limiting**
   - Limit API requests per user
   - Implement exponential backoff
   - Monitor for abuse

## Deployment

### Frontend

```bash
# Build
npm run build

# Deploy to Vercel, Netlify, etc.
```

### Backend

```bash
# Using PM2
pm2 start server/index.js --name "social-integrations"

# Using Docker
docker build -t social-integrations-server .
docker run -p 3001:3001 social-integrations-server
```

## Future Enhancements

- [ ] Facebook Messenger integration
- [ ] Instagram Direct Messages
- [ ] Message scheduling
- [ ] Automated responses
- [ ] Analytics dashboard
- [ ] Multi-account support
- [ ] Message templates
- [ ] Contact management
- [ ] Conversation history
- [ ] Team collaboration

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review server logs
3. Check browser console
4. Verify environment configuration
5. Test with curl/Postman

## Resources

- [WPPConnect Documentation](https://github.com/wppconnect-team/wppconnect)
- [Socket.io Documentation](https://socket.io/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
