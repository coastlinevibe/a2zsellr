# Integration Testing Guide

Complete testing guide for social integrations.

## Test Environment Setup

### Prerequisites

- Node.js 14+
- Chrome/Chromium
- Postman or curl
- A test WhatsApp account

### Start Services

```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
npm run dev

# Terminal 3: Optional - Monitor logs
tail -f server/logs/server.log
```

## Unit Tests

### Backend Service Tests

```bash
cd server
npm test
```

### Frontend Component Tests

```bash
npm test
```

## Integration Tests

### 1. WhatsApp Connection Flow

#### Test Case: QR Code Generation

```bash
# Request
curl -X POST http://localhost:3001/api/whatsapp/init \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-session-1"}'

# Expected Response
{
  "status": "initializing",
  "message": "WhatsApp client initializing. Scan QR code with your phone.",
  "qrCode": "data:image/png;base64,..."
}
```

#### Test Case: Connection Status

```bash
# Request
curl http://localhost:3001/api/whatsapp/status/test-session-1

# Expected Response (Before Scan)
{
  "connected": false,
  "qrCode": "data:image/png;base64,..."
}

# Expected Response (After Scan)
{
  "connected": true
}
```

### 2. Message Operations

#### Test Case: Get Contacts

```bash
# Request
curl http://localhost:3001/api/whatsapp/contacts/test-session-1

# Expected Response
{
  "contacts": [
    {
      "id": "1234567890@c.us",
      "name": "John Doe",
      "number": "1234567890"
    }
  ]
}
```

#### Test Case: Get Chats

```bash
# Request
curl http://localhost:3001/api/whatsapp/chats/test-session-1

# Expected Response
{
  "chats": [
    {
      "id": "1234567890@c.us",
      "name": "John Doe",
      "unreadCount": 0
    }
  ]
}
```

#### Test Case: Send Message

```bash
# Request
curl -X POST http://localhost:3001/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session-1",
    "chatId": "1234567890@c.us",
    "message": "Hello from A2Z!"
  }'

# Expected Response
{
  "success": true,
  "result": {
    "id": "message-id",
    "status": "sent"
  }
}
```

### 3. Socket.io Events

#### Test Case: QR Code Event

```javascript
// Client-side test
const socket = io('http://localhost:3001')

socket.on('whatsapp:qr', (data) => {
  console.log('✓ QR Code received:', data.sessionId)
  console.log('✓ QR Code data:', data.qr.substring(0, 50) + '...')
})

// Trigger by calling init endpoint
```

#### Test Case: Ready Event

```javascript
// Client-side test
socket.on('whatsapp:ready', (data) => {
  console.log('✓ WhatsApp ready:', data.sessionId)
})

// Trigger by scanning QR code
```

#### Test Case: Message Event

```javascript
// Client-side test
socket.on('whatsapp:message', (data) => {
  console.log('✓ Message received:', data.message.body)
  console.log('✓ From:', data.message.from)
})

// Trigger by sending message to WhatsApp number
```

## Frontend Component Tests

### 1. WhatsAppIntegration Component

```typescript
// Test: Component renders
render(<WhatsAppIntegration />)
expect(screen.getByText('WhatsApp Business')).toBeInTheDocument()

// Test: Connect button works
const connectButton = screen.getByText('Connect WhatsApp')
fireEvent.click(connectButton)
expect(connectButton).toHaveAttribute('disabled')

// Test: QR code displays
await waitFor(() => {
  expect(screen.getByText('Scan QR Code')).toBeInTheDocument()
})

// Test: Disconnect button appears when connected
// (Requires mocking socket.io)
```

### 2. QRCodeDisplay Component

```typescript
// Test: Component renders
render(
  <QRCodeDisplay
    qrCode="data:image/png;base64,..."
    platform="WhatsApp"
    isConnected={false}
    onClose={jest.fn()}
    sessionId="test-123"
  />
)

// Test: QR code image displays
expect(screen.getByAltText('QR Code')).toBeInTheDocument()

// Test: Timer counts down
expect(screen.getByText(/60s/)).toBeInTheDocument()

// Test: Close button works
const closeButton = screen.getByRole('button', { name: /close/i })
fireEvent.click(closeButton)
expect(onClose).toHaveBeenCalled()

// Test: Success state shows when connected
render(
  <QRCodeDisplay
    qrCode="data:image/png;base64,..."
    platform="WhatsApp"
    isConnected={true}
    onClose={jest.fn()}
    sessionId="test-123"
  />
)
expect(screen.getByText('Connected!')).toBeInTheDocument()
```

### 3. useSocialIntegration Hook

```typescript
// Test: Hook initializes
const { result } = renderHook(() => useSocialIntegration('whatsapp'))
expect(result.current.isConnected).toBe(false)
expect(result.current.qrCode).toBeNull()

// Test: Initialize integration
act(() => {
  result.current.initializeIntegration()
})
await waitFor(() => {
  expect(result.current.isLoading).toBe(false)
})

// Test: QR code received
act(() => {
  result.current.socket?.emit('whatsapp:qr', {
    sessionId: 'test',
    qr: 'data:image/png;base64,...'
  })
})
expect(result.current.qrCode).toBeTruthy()

// Test: Connection ready
act(() => {
  result.current.socket?.emit('whatsapp:ready', { sessionId: 'test' })
})
expect(result.current.isConnected).toBe(true)
```

## End-to-End Tests

### Scenario 1: Complete WhatsApp Connection

```gherkin
Feature: WhatsApp Integration
  Scenario: User connects WhatsApp account
    Given user is on dashboard
    And user navigates to integrations tab
    When user clicks "Connect WhatsApp"
    Then QR code modal appears
    And user scans QR code with phone
    Then connection status shows "Connected"
    And user can see WhatsApp features
```

### Scenario 2: Send Message

```gherkin
Feature: Send WhatsApp Message
  Scenario: User sends message
    Given WhatsApp is connected
    And user has selected a chat
    When user types message "Hello"
    And user clicks send
    Then message appears in chat
    And message status shows "sent"
```

### Scenario 3: Receive Message

```gherkin
Feature: Receive WhatsApp Message
  Scenario: User receives message
    Given WhatsApp is connected
    When message arrives on WhatsApp
    Then notification appears
    And message shows in chat
    And unread count updates
```

## Performance Tests

### Load Testing

```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:3001/health

# Using wrk
wrk -t4 -c100 -d30s http://localhost:3001/health
```

### Memory Profiling

```bash
# Start server with profiling
node --inspect server/index.js

# Open Chrome DevTools
chrome://inspect
```

### Connection Limits

```bash
# Test multiple concurrent connections
for i in {1..100}; do
  curl -X POST http://localhost:3001/api/whatsapp/init \
    -H "Content-Type: application/json" \
    -d "{\"sessionId\":\"test-$i\"}" &
done
```

## Security Tests

### 1. Input Validation

```bash
# Test: Invalid session ID
curl -X POST http://localhost:3001/api/whatsapp/init \
  -H "Content-Type: application/json" \
  -d '{"sessionId":""}'

# Expected: 400 Bad Request

# Test: SQL Injection attempt
curl -X POST http://localhost:3001/api/whatsapp/init \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test\"; DROP TABLE sessions; --"}'

# Expected: 400 Bad Request
```

### 2. CORS Testing

```bash
# Test: Invalid origin
curl -H "Origin: http://evil.com" \
  -H "Access-Control-Request-Method: POST" \
  http://localhost:3001/api/whatsapp/init

# Expected: CORS error or rejection
```

### 3. Rate Limiting

```bash
# Test: Rapid requests
for i in {1..100}; do
  curl http://localhost:3001/api/whatsapp/status/test &
done

# Expected: Rate limit error after threshold
```

## Debugging

### Enable Debug Logging

```bash
# Backend
DEBUG=* npm run dev

# Frontend
NEXT_DEBUG=* npm run dev
```

### Monitor Socket.io

```javascript
// In browser console
io.on('connect', () => console.log('Connected'))
io.on('disconnect', () => console.log('Disconnected'))
io.on('*', (event, data) => console.log('Event:', event, data))
```

### Check Network Requests

1. Open DevTools (F12)
2. Go to Network tab
3. Filter by XHR/Fetch
4. Monitor API calls

## Test Checklist

- [ ] Backend server starts without errors
- [ ] Frontend connects to backend
- [ ] QR code generates and displays
- [ ] Socket.io connection established
- [ ] QR code can be scanned
- [ ] Connection status updates
- [ ] Messages can be sent
- [ ] Messages can be received
- [ ] Disconnect works properly
- [ ] Error handling works
- [ ] UI updates correctly
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Security checks pass

## Continuous Integration

### GitHub Actions Example

```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '14'
      - run: npm install
      - run: npm test
      - run: npm run build
```

## Troubleshooting Tests

### Tests Failing

1. Check if services are running
2. Verify environment variables
3. Check logs for errors
4. Clear cache: `npm cache clean --force`
5. Reinstall dependencies: `rm -rf node_modules && npm install`

### Socket.io Connection Issues

1. Check CORS configuration
2. Verify port is accessible
3. Check firewall settings
4. Monitor network tab

### QR Code Not Generating

1. Verify Chrome is installed
2. Check server logs
3. Verify WPPConnect is working
4. Check disk space

## Resources

- [Jest Testing](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Postman](https://www.postman.com/)
- [Socket.io Testing](https://socket.io/docs/v4/testing/)
