const { create } = require('@wppconnect-team/wppconnect');

class WhatsAppService {
  constructor() {
    this.clients = new Map();
    this.qrCodes = new Map();
    this.connectionStates = new Map(); // Track connection state
    this.groupContactsCache = new Map(); // Cache group contacts to prevent redundant fetching
    this.cacheExpiry = new Map(); // Cache expiry times
    this.cacheCleanupInterval = null; // Interval for cache cleanup
    this.io = null;
  }

  setIO(io) {
    this.io = io;

    // Set up periodic cache cleanup (every 5 minutes)
    if (!this.cacheCleanupInterval) {
      this.cacheCleanupInterval = setInterval(() => {
        this.cleanupExpiredCache();
      }, 5 * 60 * 1000);
    }
  }

  async initializeClient(sessionId) {
    try {
      if (this.clients.has(sessionId)) {
        console.log(`✅ Client already exists for session: ${sessionId}`);
        return this.clients.get(sessionId);
      }

      console.log(`Initializing WhatsApp client for session: ${sessionId}`);

      // Try to restore existing session first
      console.log(`📂 Checking for existing session files for ${sessionId}...`);
      
      const fs = require('fs');
      const path = require('path');
      const sessionPath = path.join(process.cwd(), 'tokens', sessionId);
      const sessionExists = fs.existsSync(sessionPath);
      
      if (sessionExists) {
        console.log(`✅ Found existing session files for ${sessionId}`);
      }
      
      const client = await create({
        session: sessionId,
        headless: true,
        devtools: false,
        useChrome: true,
        autoClose: false,
        restartOnCrash: true,
        puppeteerArgs: ['--no-sandbox', '--disable-setuid-sandbox'],
        catchQR: (base64Qr, asciiQR) => {
          console.log(`✅ QR Code generated for session: ${sessionId}`);
          console.log(`📸 QR Code base64 length: ${base64Qr.length}`);
          
          // Store the QR code
          this.qrCodes.set(sessionId, base64Qr);
          console.log(`✅ QR Code stored in map. Map size: ${this.qrCodes.size}`);
          
          // Emit via Socket.io immediately
          if (this.io) {
            this.io.emit('whatsapp:qr', { sessionId, qr: base64Qr });
            console.log(`📡 Emitted whatsapp:qr event to all clients`);
          }
        },
        logQR: false
      });

      // Handle ready state (when successfully connected)
      client.onStateChange((state) => {
        console.log(`State changed for session ${sessionId}:`, state);
        if (state === 'CONNECTED' || state === 'MAIN') {
          console.log(`✅ WhatsApp client ready for session: ${sessionId}`);
          this.connectionStates.set(sessionId, true);
          this.qrCodes.delete(sessionId);
          if (this.io) {
            this.io.emit('whatsapp:ready', { sessionId });
          }
        } else if (state === 'DISCONNECTED' || state === 'LOGOUT' || state === 'UNPAIRED') {
          console.log(`❌ Connection failed for session ${sessionId}: ${state}`);
          this.connectionStates.set(sessionId, false);
        }
      });

      // Also listen for when the client is actually ready
      client.onReady?.(() => {
        console.log(`🎉 Client onReady callback fired for session: ${sessionId}`);
        this.connectionStates.set(sessionId, true);
        this.qrCodes.delete(sessionId);
        if (this.io) {
          this.io.emit('whatsapp:ready', { sessionId });
        }
      });

      // Check if already authenticated (for restored sessions)
      setTimeout(async () => {
        try {
          if (client.isConnected && typeof client.isConnected === 'function') {
            const isAuth = await client.isConnected();
            if (isAuth) {
              console.log(`✅ Restored session is authenticated: ${sessionId}`);
              this.connectionStates.set(sessionId, true);
              this.qrCodes.delete(sessionId);
            }
          }
        } catch (err) {
          console.log(`Could not verify restored session: ${err.message}`);
        }
      }, 3000);

      // Handle incoming messages
      client.onMessage((message) => {
        console.log(`Message received in session ${sessionId}:`, message.body);
        if (this.io) {
          this.io.emit('whatsapp:message', { sessionId, message });
        }
      });

      // Handle incoming calls
      client.onIncomingCall((call) => {
        console.log(`Incoming call in session ${sessionId}:`, call);
        if (this.io) {
          this.io.emit('whatsapp:call', { sessionId, call });
        }
      });

      this.clients.set(sessionId, client);
      return client;
    } catch (error) {
      console.error(`Error initializing WhatsApp client for session ${sessionId}:`, error);
      throw error;
    }
  }

  getClient(sessionId) {
    return this.clients.get(sessionId);
  }

  getQRCode(sessionId) {
    return this.qrCodes.get(sessionId);
  }

  async getContacts(sessionId) {
    try {
      const client = this.getClient(sessionId);
      if (!client) throw new Error('Client not initialized');
      return await client.getAllContacts();
    } catch (error) {
      console.error(`Error getting contacts for session ${sessionId}:`, error);
      throw error;
    }
  }

  async getChats(sessionId) {
    try {
      const client = this.getClient(sessionId);
      if (!client) throw new Error('Client not initialized');
      return await client.listChats();
    } catch (error) {
      console.error(`Error getting chats for session ${sessionId}:`, error);
      throw error;
    }
  }

  async getGroupContacts(sessionId, forceRefresh = false) {
    try {
      const client = this.getClient(sessionId);
      if (!client) throw new Error('Client not initialized');

      // Check cache first (cache for 5 minutes) unless force refresh is requested
      const cacheKey = `contacts_${sessionId}`;
      const now = Date.now();
      const cacheExpiry = this.cacheExpiry.get(cacheKey);
      if (!forceRefresh && cacheExpiry && now < cacheExpiry) {
        const cachedContacts = this.groupContactsCache.get(cacheKey);
        if (cachedContacts) {
          console.log(`📱 Returning cached group contacts for ${sessionId} (${cachedContacts.length} contacts)`);
          return cachedContacts;
        }
      }

      console.log(`📱 Fetching fresh group contacts for ${sessionId}...`);

      // Get all chats (which includes groups) with timeout
      let chats = [];
      try {
        console.log(`Fetching all chats...`);

        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Chat fetching timeout after 30 seconds')), 30000)
        );

        const listChatsPromise = client.listChats();
        chats = await Promise.race([listChatsPromise, timeoutPromise]);
        console.log(`✅ Got ${chats.length} chats`);
      } catch (err) {
        console.log(`listChats failed: ${err.message}, trying getAllChats...`);
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Chat fetching timeout after 30 seconds')), 30000)
          );

          const getAllChatsPromise = client.getAllChats();
          chats = await Promise.race([getAllChatsPromise, timeoutPromise]);
          console.log(`✅ Got ${chats.length} chats from getAllChats`);
        } catch (err2) {
          console.log(`getAllChats also failed: ${err2.message}`);
          return [];
        }
      }

      // Filter for groups only and limit processing to prevent excessive time
      let groups = chats.filter(chat => chat.isGroup);
      console.log(`📊 Found ${groups.length} groups`);

      // Limit to first 50 groups to prevent excessive processing time
      if (groups.length > 50) {
        console.log(`⚠️ Limiting processing to first 50 groups out of ${groups.length} to prevent timeout`);
        groups = groups.slice(0, 50);
      }

      const allContacts = new Map(); // Use Map to deduplicate by phone number
      let processedGroups = 0;
      const totalGroups = groups.length;

      // Extract contacts from each group with progress tracking
      for (const group of groups) {
        try {
          processedGroups++;
          console.log(`👥 Processing group ${processedGroups}/${totalGroups}: ${group.name}`);

          // Get participants from the group with timeout
          let participants = [];
          try {
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Group members fetching timeout')), 15000)
            );

            const getMembersPromise = client.getGroupMembers(group.id._serialized);
            participants = await Promise.race([getMembersPromise, timeoutPromise]);
            console.log(`   ✅ Got ${participants.length} participants from ${group.name}`);
          } catch (err) {
            console.log(`   ⚠️ Could not get participants from ${group.name}: ${err.message}`);
            participants = group.participants || [];
          }

          // Process each participant
          let validParticipants = 0;
          for (const participant of participants) {
            try {
              // Skip if it's the user themselves
              if (participant.isMe) {
                continue;
              }

              // Get the participant ID
              const participantId = participant.id?._serialized || participant.id;
              if (!participantId) {
                continue;
              }

              // Extract phone number from ID (format: 27123456789@c.us or similar)
              const phoneMatch = participantId.match(/^(\d+)@/);
              const phoneNumber = phoneMatch ? phoneMatch[1] : participantId;

              // Use phone number as unique ID
              if (!allContacts.has(phoneNumber)) {
                allContacts.set(phoneNumber, {
                  phoneNumber: phoneNumber,
                  userId: phoneNumber,
                  name: participant.name || participant.pushname || 'Unknown',
                  groups: [group.name]
                });
              } else {
                // Add group to existing contact
                const contact = allContacts.get(phoneNumber);
                if (!contact.groups.includes(group.name)) {
                  contact.groups.push(group.name);
                }
              }
              validParticipants++;
            } catch (err) {
              // Continue processing other participants
            }
          }

          console.log(`   📊 Added ${validParticipants} valid participants from ${group.name}`);

        } catch (err) {
          console.error(`Error processing group ${group.name}:`, err.message);
          // Continue processing other groups
        }

        // Yield control every 10 groups to prevent blocking
        if (processedGroups % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      const contactsList = Array.from(allContacts.values());
      console.log(`✅ Extracted ${contactsList.length} unique contacts from ${totalGroups} groups (processed ${processedGroups})`);

      // Cache the results for 10 minutes (increased from 5)
      this.groupContactsCache.set(cacheKey, contactsList);
      this.cacheExpiry.set(cacheKey, now + (10 * 60 * 1000)); // 10 minutes

      return contactsList;
    } catch (error) {
      console.error(`Error getting group contacts for session ${sessionId}:`, error);
      throw error;
    }
  }

  async getGroups(sessionId) {
    try {
      const client = this.getClient(sessionId);
      if (!client) throw new Error('Client not initialized');
      
      console.log(`Fetching groups for ${sessionId}...`);
      
      // Use listChats which is the current method
      let chats = [];
      try {
        chats = await client.listChats();
        console.log(`✅ Got ${chats.length} chats from listChats`);
      } catch (err) {
        console.log(`listChats failed: ${err.message}, trying getAllChats...`);
        try {
          chats = await client.getAllChats();
          console.log(`✅ Got ${chats.length} chats from getAllChats`);
        } catch (err2) {
          console.log(`getAllChats also failed: ${err2.message}`);
          return [];
        }
      }
      
      // Filter for groups only
      const groups = chats.filter(chat => chat.isGroup);
      console.log(`📊 Found ${groups.length} groups`);
      
      return groups.map(group => ({
        id: group.id?._serialized || group.id,
        name: group.name,
        participants: group.participants?.length || 0,
        groupId: group.id?._serialized || group.id,
        profilePicture: group.profilePicture,
        description: group.description || ''
      }));
    } catch (error) {
      console.error(`Error getting groups for session ${sessionId}:`, error);
      throw error;
    }
  }

  async getMessages(sessionId, chatId) {
    try {
      const client = this.getClient(sessionId);
      if (!client) throw new Error('Client not initialized');
      return await client.loadAndGetAllMessagesInChat(chatId);
    } catch (error) {
      console.error(`Error getting messages for session ${sessionId}:`, error);
      throw error;
    }
  }

  async sendMessage(sessionId, chatId, message, options = {}) {
    try {
      const client = this.getClient(sessionId);
      if (!client) throw new Error('Client not initialized');
      
      console.log(`📨 Sending text message to ${chatId}:`, { message, options });
      
      // Try different WPPConnect methods for sending text
      try {
        // Method 1: Try sendTextMessage (WPP.chat.sendTextMessage) - supports buttons
        if (client.sendTextMessage && typeof client.sendTextMessage === 'function') {
          const result = await client.sendTextMessage(chatId, message, options);
          console.log(`✅ Message sent via sendTextMessage`);
          return result;
        }
      } catch (err) {
        console.log(`sendTextMessage failed: ${err.message}`);
      }
      
      try {
        // Method 2: Try sendText
        if (client.sendText && typeof client.sendText === 'function') {
          const result = await client.sendText(chatId, message);
          console.log(`✅ Message sent via sendText`);
          return result;
        }
      } catch (err) {
        console.log(`sendText failed: ${err.message}`);
      }
      
      try {
        // Method 3: Try sendMessage
        if (client.sendMessage && typeof client.sendMessage === 'function') {
          const result = await client.sendMessage(chatId, message);
          console.log(`✅ Message sent via sendMessage`);
          return result;
        }
      } catch (err) {
        console.log(`sendMessage failed: ${err.message}`);
      }
      
      throw new Error('No suitable text sending method found in WPPConnect client');
    } catch (error) {
      console.error(`Error sending message in session ${sessionId}:`, error);
      throw error;
    }
  }

  async sendFileMessage(sessionId, chatId, fileUrl, options = {}) {
    try {
      const client = this.getClient(sessionId);
      if (!client) throw new Error('Client not initialized');
      
      console.log(`📤 Sending file message to ${chatId}:`, { fileUrl, options });
      
      // Try different WPPConnect methods for sending images
      try {
        // Method 1: Try sendImage with caption
        if (client.sendImage && typeof client.sendImage === 'function') {
          const result = await client.sendImage(chatId, fileUrl, options.caption || 'Product Image');
          console.log(`✅ Image sent via sendImage`);
          return result;
        }
      } catch (err) {
        console.log(`sendImage failed: ${err.message}`);
      }
      
      try {
        // Method 2: Try sendFile
        if (client.sendFile && typeof client.sendFile === 'function') {
          const result = await client.sendFile(chatId, fileUrl, options.caption || 'Product Image');
          console.log(`✅ Image sent via sendFile`);
          return result;
        }
      } catch (err) {
        console.log(`sendFile failed: ${err.message}`);
      }
      
      try {
        // Method 3: Try sendMediaFile
        if (client.sendMediaFile && typeof client.sendMediaFile === 'function') {
          const result = await client.sendMediaFile(chatId, fileUrl, options.caption || 'Product Image');
          console.log(`✅ Image sent via sendMediaFile`);
          return result;
        }
      } catch (err) {
        console.log(`sendMediaFile failed: ${err.message}`);
      }
      
      throw new Error('No suitable image sending method found in WPPConnect client');
    } catch (error) {
      console.error(`Error sending file message in session ${sessionId}:`, error);
      throw error;
    }
  }

  async sendImageMessage(sessionId, chatId, base64Image, caption = '', options = {}) {
    try {
      const client = this.getClient(sessionId);
      if (!client) throw new Error('Client not initialized');
      
      console.log(`📤 Attempting to send image with caption to ${chatId}`);
      
      // WPPConnect doesn't reliably support image sending via base64
      // For now, just log that image sending is not supported
      console.log(`⚠️ Image sending via WPPConnect is not fully supported`);
      console.log(`📝 Caption will be sent as text message instead`);
      
      // Send caption as text message
      if (caption) {
        await this.sendMessage(sessionId, chatId, caption, options);
        console.log(`✅ Caption sent as text message`);
      }
      
      return { success: true, method: 'caption-only', message: 'Image sending not supported, caption sent as text' };
    } catch (error) {
      console.error(`Error sending image message in session ${sessionId}:`, error);
      throw error;
    }
  }

  async sendMessageButtons(sessionId, chatId, message, buttons = [], options = {}) {
    try {
      const client = this.getClient(sessionId);
      if (!client) throw new Error('Client not initialized');
      
      console.log(`📤 Sending message with ${buttons.length} button(s) to ${chatId}`);
      
      // Send message with button info as text (most reliable method)
      let messageWithButtons = message + '\n\n';
      buttons.forEach((btn, index) => {
        messageWithButtons += `${index + 1}. ${btn.text}`;
        if (btn.url) {
          messageWithButtons += ` - ${btn.url}`;
        }
        messageWithButtons += '\n';
      });
      
      console.log(`📤 Sending message with button info as text`);
      await this.sendMessage(sessionId, chatId, messageWithButtons, options);
      console.log(`✅ Message with button info sent as text`);
      return { success: true, method: 'text-buttons' };
    } catch (error) {
      console.error(`Error sending message with buttons in session ${sessionId}:`, error);
      throw error;
    }
  }

  async disconnect(sessionId) {
    try {
      const client = this.getClient(sessionId);
      if (client) {
        await client.close();
        this.clients.delete(sessionId);
        this.qrCodes.delete(sessionId);
        this.connectionStates.delete(sessionId);

        // Clear cached data
        const cacheKey = `contacts_${sessionId}`;
        this.groupContactsCache.delete(cacheKey);
        this.cacheExpiry.delete(cacheKey);

        console.log(`WhatsApp client disconnected for session: ${sessionId}`);
      }
    } catch (error) {
      console.error(`Error disconnecting WhatsApp client for session ${sessionId}:`, error);
      throw error;
    }
  }

  async getStatus(sessionId) {
    try {
      const client = this.getClient(sessionId);
      const qrCode = this.getQRCode(sessionId);
      let isConnected = this.connectionStates.get(sessionId) || false;

      if (!client) {
        console.log(`⚠️ No client found for session ${sessionId}`);
        return { connected: false, qrCode: qrCode || null };
      }

      // Always try to verify connection status with the client
      try {
        // Check if client has isConnected method
        if (client.isConnected && typeof client.isConnected === 'function') {
          const connected = await client.isConnected();
          if (connected) {
            console.log(`✅ Client is connected (isConnected returned true) for ${sessionId}`);
            this.connectionStates.set(sessionId, true);
            isConnected = true;
            this.qrCodes.delete(sessionId);
          } else {
            console.log(`❌ Client is NOT connected for ${sessionId}`);
            this.connectionStates.set(sessionId, false);
            isConnected = false;
          }
        } else if (client.getState && typeof client.getState === 'function') {
          // Fallback: try getState method
          const state = await client.getState();
          const connected = state === 'CONNECTED' || state === 'MAIN';
          console.log(`Client state: ${state} for ${sessionId}`);
          this.connectionStates.set(sessionId, connected);
          isConnected = connected;
          if (connected) {
            this.qrCodes.delete(sessionId);
          }
        }
      } catch (err) {
        console.log(`⚠️ Connection check failed for ${sessionId}: ${err.message}`);
        // If check fails, assume disconnected
        this.connectionStates.set(sessionId, false);
        isConnected = false;
      }

      return { connected: isConnected, qrCode: qrCode || null };
    } catch (error) {
      console.error(`Error getting status for session ${sessionId}:`, error);
      throw error;
    }
  }

  // Clear cache for a specific session
  clearGroupContactsCache(sessionId) {
    const cacheKey = `contacts_${sessionId}`;
    this.groupContactsCache.delete(cacheKey);
    this.cacheExpiry.delete(cacheKey);
    console.log(`🗑️ Cleared group contacts cache for session: ${sessionId}`);
  }

  // Clean up expired cache entries
  cleanupExpiredCache() {
    const now = Date.now();
    const keysToDelete = [];

    for (const [key, expiry] of this.cacheExpiry.entries()) {
      if (now > expiry) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.groupContactsCache.delete(key);
      this.cacheExpiry.delete(key);
    });

    if (keysToDelete.length > 0) {
      console.log(`🧹 Cleaned up ${keysToDelete.length} expired cache entries`);
    }
  }
}

module.exports = new WhatsAppService();
