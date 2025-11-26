# Quick Start: Social Integrations

Get WhatsApp, Facebook, and Instagram integrations running in 5 minutes.

## Prerequisites

- Node.js 14+
- Chrome/Chromium installed
- npm or yarn

## Step 1: Start the Backend Server

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

Server will run on `http://localhost:3001`

## Step 2: Configure Frontend

Add to `.env.local`:

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:3001
```

## Step 3: Access Integrations

1. Go to Dashboard
2. Click on "Social Integrations" tab
3. Select WhatsApp, Facebook, or Instagram

## WhatsApp Connection

### For Users

1. Click "Connect WhatsApp"
2. Scan QR code with your phone
3. Confirm on your phone
4. Done! You're connected

### For Developers

Test the API:

```bash
# Initialize connection
curl -X POST http://localhost:3001/api/whatsapp/init \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-user-1"}'

# Get status
curl http://localhost:3001/api/whatsapp/status/test-user-1

# Send message
curl -X POST http://localhost:3001/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId":"test-user-1",
    "chatId":"1234567890@c.us",
    "message":"Hello!"
  }'
```

## File Structure

```
Frontend:
├── components/integrations/
│   ├── WhatsAppIntegration.tsx
│   ├── FacebookIntegration.tsx
│   ├── InstagramIntegration.tsx
│   ├── QRCodeDisplay.tsx
│   └── QRCodeScanner.tsx
├── hooks/
│   └── useSocialIntegration.ts
└── lib/
    └── qrCodeUtils.ts

Backend:
server/
├── index.js
├── services/
│   ├── whatsappService.js
│   ├── facebookService.js
│   └── instagramService.js
├── routes/
│   ├── whatsapp.js
│   ├── facebook.js
│   └── instagram.js
└── package.json
```

## Common Issues

### "Chrome not found"
```bash
# Ubuntu/Debian
sudo apt-get install chromium-browser

# macOS
brew install chromium
```

### "Port 3001 already in use"
```bash
# Kill process
lsof -i :3001
kill -9 <PID>
```

### "QR code not showing"
- Check if backend is running
- Verify `NEXT_PUBLIC_SERVER_URL` in `.env.local`
- Check browser console for errors

## Next Steps

1. **Customize Components**
   - Edit `components/integrations/WhatsAppIntegration.tsx`
   - Add your branding and styling

2. **Add Database**
   - Store sessions in database
   - Persist user connections

3. **Implement Facebook/Instagram**
   - Update `facebookService.js`
   - Update `instagramService.js`
   - Add API keys to `.env`

4. **Add Features**
   - Message history
   - Contact management
   - Automated responses
   - Analytics

## Testing

### Manual Testing

1. Open Dashboard
2. Go to Integrations tab
3. Click "Connect WhatsApp"
4. Scan QR code with phone
5. Verify connection status

### API Testing

```bash
# Test health check
curl http://localhost:3001/health

# Test WhatsApp init
curl -X POST http://localhost:3001/api/whatsapp/init \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test"}'
```

## Deployment

### Frontend (Vercel)
```bash
npm run build
vercel deploy
```

### Backend (Heroku)
```bash
cd server
heroku create your-app-name
git push heroku main
```

## Documentation

- Full setup guide: `SOCIAL_INTEGRATIONS_SETUP.md`
- Backend docs: `server/README.md`
- API reference: See `server/routes/whatsapp.js`

## Support

Check the troubleshooting section in `SOCIAL_INTEGRATIONS_SETUP.md`

---

**Ready to go!** 🚀

Your social integrations are now set up and ready to use.
