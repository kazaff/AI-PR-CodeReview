const codeReviewService = require('../services/codeReviewService');

/**
 * Handle CNB PR webhook events
 */
async function handlePrEvent(req, res) {
  try {
    // Log incoming webhook
    console.log('Received CNB PR webhook event:', {
      headers: req.headers,
      body: req.body
    });
    
    // Process the PR event for code review
    await codeReviewService.processPrEvent(req.body);
    
    // Send success response
    res.status(200).json({ 
      status: 'success', 
      message: 'PR event received and processing started' 
    });
  } catch (error) {
    console.error('Error processing PR webhook:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to process PR event' 
    });
  }
}

module.exports = { handlePrEvent };