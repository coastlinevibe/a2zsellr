# Social Integrations Server

Backend server for WhatsApp, Facebook, and Instagram integrations using WPPConnect.

## Features

- ✅ WhatsApp Business integration via WPPConnect
- ✅ Real-time message handling with Socket.io
- ✅ QR code authentication
- ✅ Contact and chat management
- ✅ Message sending and receiving
- 🔄 Facebook integration (coming soon)
- 🔄 Instagram integration (coming soon)

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

### Environment Variables

```env
# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# WhatsApp
WPP_SESSION_NAME=default-session
WPP_HEADLESS=true
WPP_DEVTOOLS=false
WPP_USE_CHROME=true
WHATSAPP_SESSION_TIMEOUT=3600000
WHATSAPP_AUTO_CLOSE=false

# Facebook (Coming Soon)
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
FACEBOOK_API_KEY=your_api_key

# Instagram (Coming Soon)
INSTAGRAM_APP_ID=your_app_id
INSTAGRAM_APP_SECRET=your_app_secret
INSTAGRAM_API_KEY=your_api_key

# Storage & Logging
SESSION_STORAGE_PATH=./sessions
LOG_LEVEL=info
```

## Running the Server

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### WhatsApp Integration

#### Initialize Connection
```
POST /api/whatsapp/init
Body: { sessionId: "string" }
Response: { status: "initializing", qrCode: "string" }
```

#### Get Status
```
GET /api/whatsapp/status/:sessionId
Response: { connected: boolean, qrCode?: "string" }
```

#### Get Contacts
```
GET /api/whatsapp/contacts/:sessionId
Response: { contacts: Array }
```

#### Get Chats
```
GET /api/whatsapp/chats/:sessionId
Response: { chats: Array }
```

#### Get Messages
```
GET /api/whatsapp/messages/:sessionId/:chatId
Response: { messages: Array }
```

#### Send Message
```
POST /api/whatsapp/send
Body: { sessionId: "string", chatId: "string", message: "string" }
Response: { success: boolean, result: Object }
```

#### Disconnect
```
POST /api/whatsapp/disconnect/:sessionId
Response: { success: boolean, message: "string" }
```

### Facebook (Coming Soon)
- `POST /api/facebook/init`
- `GET /api/facebook/status/:sessionId`
- `POST /api/facebook/send`

### Instagram (Coming Soon)
- `POST /api/instagram/init`
- `GET /api/instagram/status/:sessionId`
- `POST /api/instagram/send`

## Socket.io Events

### WhatsApp Events

**Emitted by Server:**
- `whatsapp:qr` - QR code generated
  ```javascript
  { sessionId: "string", qr: "string" }
  ```
- `whatsapp:ready` - Client ready
  ```javascript
  { sessionId: "string" }
  ```
- `whatsapp:auth-failed` - Authentication failed
  ```javascript
  { sessionId: "string", error: "string" }
  ```
- `whatsapp:message` - New message received
  ```javascript
  { sessionId: "string", message: Object }
  ```
- `whatsapp:call` - Incoming call
  ```javascript
  { sessionId: "string", call: Object }
  ```

### Facebook Events (Coming Soon)
- `facebook:ready`
- `facebook:message`
- `facebook:error`

### Instagram Events (Coming Soon)
- `instagram:ready`
- `instagram:message`
- `instagram:error`

## Project Structure

```
server/
├── index.js                    # Main server file
├── services/
│   ├── whatsappService.js     # WhatsApp service (WPPConnect)
│   ├── facebookService.js     # Facebook service (placeholder)
│   └── instagramService.js    # Instagram service (placeholder)
├── routes/
│   ├── whatsapp.js            # WhatsApp API routes
│   ├── facebook.js            # Facebook API routes (placeholder)
│   └── instagram.js           # Instagram API routes (placeholder)
├── package.json
├── .env.example
└── README.md
```

## Frontend Integration

The frontend connects via Socket.io and REST API:

```typescript
// Initialize WhatsApp
const response = await fetch('http://localhost:3001/api/whatsapp/init', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sessionId: 'user-123' })
})

// Listen for QR code
socket.on('whatsapp:qr', (data) => {
  displayQRCode(data.qr)
})

// Listen for ready
socket.on('whatsapp:ready', () => {
  console.log('WhatsApp connected!')
})
```

## Development Notes

### Requirements
- Node.js 14+
- Chrome/Chromium (for WPPConnect)
- npm or yarn

### Important
- WPPConnect requires Chrome/Chromium to be installed on the server
- Sessions are stored in memory (implement database for production)
- QR codes expire after 60 seconds
- Each session runs a separate browser instance

### Best Practices
- Implement proper error handling and logging
- Use database for session persistence
- Add rate limiting for API endpoints
- Implement authentication/authorization
- Use message queues for reliable delivery
- Monitor resource usage (memory, CPU)

## Troubleshooting

### Chrome not found
```bash
# Install Chrome
# Ubuntu/Debian
sudo apt-get install chromium-browser

# macOS
brew install chromium
```

### Port already in use
```bash
# Change PORT in .env or kill process
lsof -i :3001
kill -9 <PID>
```

### QR code not displaying
- Check Socket.io connection
- Verify FRONTEND_URL in .env
- Check browser console for errors

## Future Enhancements

- [ ] Database integration for session persistence
- [ ] Message queue (Redis/RabbitMQ) for reliable delivery
- [ ] Webhook support for external integrations
- [ ] Rate limiting and authentication
- [ ] Comprehensive logging and monitoring
- [ ] Docker containerization
- [ ] Kubernetes deployment
- [ ] Multi-tenant support
- [ ] Message encryption
- [ ] Backup and recovery

## License

MIT
