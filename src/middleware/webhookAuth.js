const crypto = require('crypto');
const config = require('config');

/**
 * Middleware to verify CNB webhook signature
 */
function verifyWebhookSignature(req, res, next) {
  const signature = req.headers['x-cnb-signature'];
  const secret = process.env.CNB_WEBHOOK_SECRET || config.get('cnb.webhookSecret');
  
  if (!signature) {
    return res.status(401).json({ error: 'Missing webhook signature' });
  }
  
  if (!secret) {
    console.error('Webhook secret is not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }
  
  // Create hash with secret
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');
  
  // Compare signatures
  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid webhook signature' });
  }
  
  next();
}

module.exports = verifyWebhookSignature;