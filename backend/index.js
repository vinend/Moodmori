require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require('express-session');

// Import routes for Mood Logger
const authRoutes = require('./src/routes/authRoutes');
const moodRoutes = require('./src/routes/moodRoutes');
const moodLogRoutes = require('./src/routes/moodLogRoutes');
const favoriteRoutes = require('./src/routes/favoriteRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const groupChatRoutes = require('./src/routes/groupChatRoutes');
const commentRoutes = require('./src/routes/commentRoutes');
const consultantRoutes = require('./src/routes/consultantRoutes'); // Added consultant routes

// Import controllers to initialize data
const moodController = require('./src/controllers/moodController');

// Initialize express app
const app = express();
const port = process.env.PORT || 3000;


app.use(express.json({ limit: '10mb' })); // Increase payload limit for base64 images

// Session middleware for simple authentication
app.use(session({
  secret: process.env.SESSION_SECRET || 'omori-mood-logger-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', 
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Root route
app.get("/", (req, res) => {  
  res.send("Mood Logger API is running...");
});

// Health check route
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    const dbConnection = await require('./src/database/connection').testConnection();
    
    res.status(200).json({
      status: 'UP',
      services: {
        database: dbConnection ? 'UP' : 'DOWN'
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'DOWN',
      services: {
        database: 'DOWN'
      },
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Register route modules for Mood Logger
app.use('/api/auth', authRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/mood-logs', moodLogRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/group-chats', groupChatRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/consultant', consultantRoutes); // Added consultant routes

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    payload: process.env.NODE_ENV === 'development' ? err.message : null
  });
});

// Initialize default OMORI-themed moods
const initializeApp = async () => {
  try {
    await moodController.initializeMoods();
    console.log('Application data initialized');
  } catch (error) {
    console.error('Failed to initialize application data:', error);
  }
};

// Initialize data
initializeApp();

// Start the server only in development mode
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Mood Logger API is running on http://localhost:${port}`);
    console.log(`Using session-based authentication for simplified access`);
  });
}

// Export the app for Vercel serverless deployment
module.exports = app;
