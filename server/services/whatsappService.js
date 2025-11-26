const { create } = require('@wppconnect-team/wppconnect');

class WhatsAppService {
  constructor() {
    this.clients = new Map();
    this.qrCodes = new Map();
    this.connectionStates = new Map(); // Track connection state
    this.io = null;
  }

  setIO(io) {
    this.io = io;
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

  async getGroupContacts(sessionId) {
    try {
      const client = this.getClient(sessionId);
      if (!client) throw new Error('Client not initialized');
      
      console.log(`📱 Fetching all group contacts for ${sessionId}...`);
      
      // Wait for store to be ready (longer wait for contacts processing)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Get all chats (which includes groups)
      let chats = [];
      try {
        console.log(`Fetching all chats...`);
        chats = await client.listChats();
        console.log(`✅ Got ${chats.length} chats`);
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
      
      // Filter for groups only and get member counts
      let groups = chats.filter(chat => chat.isGroup);
      console.log(`📊 Found ${groups.length} groups`);
      
      // Store group ID, fetch member count, and try to get invite link
      for (const group of groups) {
        group.groupId = group.id._serialized;
        console.log(`📋 Group: ${group.name} - ID: ${group.groupId}`);
        
        try {
          console.log(`👥 Fetching members for ${group.name}...`);
          const members = await client.getGroupMembers(group.id._serialized);
          group.memberCount = Array.isArray(members) ? members.length : 0;
          console.log(`✅ ${group.name}: ${group.memberCount} members`);
        } catch (err) {
          console.log(`⚠️ Could not get members for ${group.name}: ${err.message}`);
          group.memberCount = 0;
        }
        
        try {
          console.log(`🔗 Trying to get invite link for ${group.name}...`);
          const inviteLink = await client.getGroupInviteLink(group.id._serialized);
          group.inviteLink = inviteLink;
          console.log(`✅ Got invite link for ${group.name}`);
        } catch (err) {
          console.log(`⚠️ Cannot get invite link for ${group.name} (not admin): ${err.message}`);
          group.inviteLink = null;
        }
      }
      
      const allContacts = new Map(); // Use Map to deduplicate by phone number
      
      // Extract contacts from each group
      for (const group of groups) {
        try {
          console.log(`👥 Processing group: ${group.name} (${group.id._serialized})`);
          
          // Use WPP.group.getParticipants to fetch participants
          let participants = [];
          try {
            participants = await client.getGroupMembers(group.id._serialized);
            console.log(`   ✅ Got ${participants.length} participants`);
            if (participants.length > 0) {
              console.log(`   📋 Sample participant:`, JSON.stringify(participants[0], null, 2));
            }
          } catch (err) {
            console.log(`   ⚠️ Could not get participants: ${err.message}`);
            participants = group.participants || [];
          }
          
          for (const participant of participants) {
            // Skip if it's the user themselves
            if (participant.isMe) {
              continue;
            }
            
            // Extract phone number from participant ID
            let phoneNumber = null;
            let userId = null;
            
            try {
              const lid = participant.id._serialized;
              
              // Try to get phone number from LID entry
              try {
                const entry = await client.getPnLidEntry(lid);
                if (entry) {
                  // entry might be a string (phone number) or an object
                  if (typeof entry === 'string') {
                    phoneNumber = entry.replace(/[\s\-+]/g, '');
                  } else if (entry.phoneNumber && typeof entry.phoneNumber === 'string') {
                    phoneNumber = entry.phoneNumber.replace(/[\s\-+]/g, '');
                  }
                }
              } catch (err) {
                // If getPnLidEntry fails, try to extract from LID directly
                console.log(`   Could not resolve LID for ${participant.pushname}: ${err.message}`);
              }
              
              // If we got a phone number, use it; otherwise use the LID as the user ID
              if (phoneNumber && /^\d+$/.test(phoneNumber) && phoneNumber.length >= 10) {
                userId = phoneNumber;
              } else {
                // Use the LID as the user ID (format: number@lid)
                userId = lid;
              }
              
              // Add contact with either phone number or LID
              if (userId) {
                if (!allContacts.has(userId)) {
                  allContacts.set(userId, {
                    phoneNumber: phoneNumber || lid,
                    userId: userId,
                    name: participant.name || participant.pushname || 'Unknown',
                    groups: [group.name]
                  });
                } else {
                  // Add group to existing contact
                  const contact = allContacts.get(userId);
                  if (!contact.groups.includes(group.name)) {
                    contact.groups.push(group.name);
                  }
                }
              }
            } catch (err) {
              console.log(`   Error processing participant: ${err.message}`);
            }
          }
        } catch (err) {
          console.error(`Error processing group ${group.name}:`, err.message);
        }
      }
      
      const contactsList = Array.from(allContacts.values());
      console.log(`✅ Extracted ${contactsList.length} unique contacts from ${groups.length} groups`);
      
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
        inviteLink: group.inviteLink || null,
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
      
      // WPPConnect uses sendText for all text messages
      // Link preview is handled automatically by WhatsApp
      console.log(`📨 Sending text message to ${chatId}`);
      return await client.sendText(chatId, message);
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

  async disconnect(sessionId) {
    try {
      const client = this.getClient(sessionId);
      if (client) {
        await client.close();
        this.clients.delete(sessionId);
        this.qrCodes.delete(sessionId);
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
}

module.exports = new WhatsAppService();
