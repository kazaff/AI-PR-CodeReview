const express = require('express');
const bodyParser = require('body-parser');
const config = require('config');
const webhookRoutes = require('./routes/webhook');

const app = express();
const PORT = process.env.PORT || config.get('server.port');

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/webhook', webhookRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;