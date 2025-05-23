const express = require('express');
const { handleConsultantChat } = require('../controllers/consultantController.js');
const authMiddleware = require('../utils/authMiddleware.js'); // Changed to default import

const router = express.Router();

// POST /api/consultant/chat
// Requires authentication
router.post('/chat', authMiddleware, handleConsultantChat);

module.exports = router;
