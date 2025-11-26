const express = require('express');
const instagramService = require('../services/instagramService');

module.exports = (io) => {
  const router = express.Router();

  // Initialize Instagram client
  router.post('/init', async (req, res) => {
    try {
      const { sessionId } = req.body;
      if (!sessionId) {
        return res.status(400).json({ error: 'sessionId is required' });
      }

      await instagramService.initializeClient(sessionId, io);
      res.json({
        status: 'initializing',
        message: 'Instagram integration coming soon'
      });
    } catch (error) {
      console.error('Error initializing Instagram:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get status
  router.get('/status/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const status = await instagramService.getStatus(sessionId);
      res.json(status);
    } catch (error) {
      console.error('Error getting Instagram status:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
