const express = require('express');
const facebookService = require('../services/facebookService');

module.exports = (io) => {
  const router = express.Router();

  // Initialize Facebook client
  router.post('/init', async (req, res) => {
    try {
      const { sessionId } = req.body;
      if (!sessionId) {
        return res.status(400).json({ error: 'sessionId is required' });
      }

      await facebookService.initializeClient(sessionId, io);
      res.json({
        status: 'initializing',
        message: 'Facebook integration coming soon'
      });
    } catch (error) {
      console.error('Error initializing Facebook:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get status
  router.get('/status/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const status = await facebookService.getStatus(sessionId);
      res.json(status);
    } catch (error) {
      console.error('Error getting Facebook status:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
