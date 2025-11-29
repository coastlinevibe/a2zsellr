const express = require('express');
const whatsappService = require('../services/whatsappService');

module.exports = (io) => {
  const router = express.Router();

  // Initialize WhatsApp client and get QR code
  router.post('/init', (req, res) => {
    try {
      const { sessionId } = req.body;
      if (!sessionId) {
        return res.status(400).json({ error: 'sessionId is required' });
      }

      console.log(`📨 POST /api/whatsapp/init - sessionId: ${sessionId}`);

      // Start initialization in background (don't await)
      whatsappService.initializeClient(sessionId).catch((error) => {
        console.error(`Background initialization error for ${sessionId}:`, error);
        io.emit('whatsapp:auth-failed', { sessionId, error: error.message });
      });

      // Return immediately - QR code will be sent via Socket.io when generated
      res.json({
        status: 'initializing',
        message: 'WhatsApp client initializing. QR code will be sent via Socket.io.',
        sessionId: sessionId
      });
    } catch (error) {
      console.error('❌ Error in /init route:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get current status
  router.get('/status/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const status = await whatsappService.getStatus(sessionId);
      
      console.log(`📊 Status check for ${sessionId}: connected=${status.connected}, qrCode=${!!status.qrCode}`);
      
      res.json(status);
    } catch (error) {
      console.error('Error getting WhatsApp status:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get all contacts
  router.get('/contacts/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const contacts = await whatsappService.getContacts(sessionId);
      res.json({ contacts });
    } catch (error) {
      console.error('Error getting contacts:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get all chats
  router.get('/chats/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const chats = await whatsappService.getChats(sessionId);
      res.json({ chats });
    } catch (error) {
      console.error('Error getting chats:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get all groups
  router.get('/groups/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      // Ensure client is initialized
      let client = whatsappService.getClient(sessionId);
      if (!client) {
        console.log(`⚠️ Client not found for session ${sessionId}, initializing...`);
        client = await whatsappService.initializeClient(sessionId);
        // Wait for client to be ready
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      const groups = await whatsappService.getGroups(sessionId);
      res.json({ groups });
    } catch (error) {
      console.error('Error getting groups:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get all contacts from all groups
  router.get('/group-contacts/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { refresh } = req.query; // Check for refresh query parameter

      // Ensure client is initialized
      let client = whatsappService.getClient(sessionId);
      if (!client) {
        console.log(`⚠️ Client not found for session ${sessionId}, initializing...`);
        client = await whatsappService.initializeClient(sessionId);
        // Wait for client to be ready
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      const forceRefresh = refresh === 'true';
      const contacts = await whatsappService.getGroupContacts(sessionId, forceRefresh);
      res.json({ contacts, total: contacts.length });
    } catch (error) {
      console.error('Error getting group contacts:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get messages from a chat
  router.get('/messages/:sessionId/:chatId', async (req, res) => {
    try {
      const { sessionId, chatId } = req.params;
      const messages = await whatsappService.getMessages(sessionId, chatId);
      res.json({ messages });
    } catch (error) {
      console.error('Error getting messages:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Send message to group or user (chatId can be group ID or user phone number with @c.us or @g.us)
  router.post('/send-message/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { chatId, groupId, message, image, buttons, options } = req.body;
      
      // Support both chatId and groupId for backwards compatibility
      const targetId = chatId || groupId;
      
      // Allow image-only messages (no text required if image is provided)
      if (!targetId || (!message && !image)) {
        return res.status(400).json({ error: 'chatId (or groupId) is required, and either message or image must be provided' });
      }

      // Ensure client is initialized
      let client = whatsappService.getClient(sessionId);
      if (!client) {
        console.log(`⚠️ Client not found for session ${sessionId}, initializing...`);
        client = await whatsappService.initializeClient(sessionId);
      }

      const isGroup = targetId.includes('@g.us');
      const isUser = targetId.includes('@c.us');
      const type = isGroup ? 'group' : isUser ? 'user' : 'chat';
      
      // Send text message if provided
      let textResult = null;
      if (message && message.trim()) {
        console.log(`📨 Sending text message to ${type} ${targetId}: ${message}`);
        textResult = await whatsappService.sendMessage(sessionId, targetId, message, options || {});
      }
      
      // Send image if provided (separately from text)
      let imageResult = null;
      if (image) {
        console.log(`📨 Sending image to ${type} ${targetId}`);
        try {
          imageResult = await whatsappService.sendImageMessage(sessionId, targetId, image, '', options || {});
        } catch (imgErr) {
          console.warn(`⚠️ Image sending failed:`, imgErr.message);
          imageResult = { error: imgErr.message };
        }
      }
      
      res.json({ 
        success: true, 
        textResult,
        imageResult,
        type, 
        hasText: !!message && message.trim(),
        hasImage: !!image,
        note: 'Text and image sent separately'
      });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Send file message (image, video, audio, document)
  router.post('/send-file-message/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { chatId, fileUrl, options } = req.body;
      
      if (!chatId || !fileUrl) {
        return res.status(400).json({ error: 'chatId and fileUrl are required' });
      }

      // Ensure client is initialized
      let client = whatsappService.getClient(sessionId);
      if (!client) {
        console.log(`⚠️ Client not found for session ${sessionId}, initializing...`);
        client = await whatsappService.initializeClient(sessionId);
      }

      const isGroup = chatId.includes('@g.us');
      const isUser = chatId.includes('@c.us');
      const type = isGroup ? 'group' : isUser ? 'user' : 'chat';
      
      console.log(`📤 Sending file message to ${type} ${chatId}:`, { fileUrl, options });
      const result = await whatsappService.sendFileMessage(sessionId, chatId, fileUrl, options);
      res.json({ success: true, result, type });
    } catch (error) {
      console.error('Error sending file message:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Disconnect session
  router.post('/disconnect/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      await whatsappService.disconnect(sessionId);
      res.json({ success: true, message: 'WhatsApp session disconnected' });
    } catch (error) {
      console.error('Error disconnecting:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
