/**
 * Service to process PR events and perform code review
 */
const AIAnalyzer = require('./aiAnalyzer');
const CnbApiClient = require('./cnbApiClient');
const CommentFormatter = require('./commentFormatter');

// Initialize the AI analyzer and CNB API client
const aiAnalyzer = new AIAnalyzer();
const cnbApiClient = new CnbApiClient();

/**
 * Process a PR event from CNB platform
 * @param {Object} prEvent - The PR event data from CNB webhook
 */
async function processPrEvent(prEvent) {
  try {
    console.log('Processing PR event for code review:', prEvent);
    
    // Extract relevant information from the PR event
    const prData = extractPrData(prEvent);
    
    // Fetch full PR details from CNB API
    const fullPrData = await cnbApiClient.getPrDetails(prData.repository, prData.id);
    
    // Perform code review analysis
    const analysisResults = await analyzeCodeChanges(fullPrData);
    
    // Post comments to PR
    await postReviewComments(prData.repository, prData.id, analysisResults);
    
    console.log('Code analysis results:', analysisResults);
  } catch (error) {
    console.error('Error processing PR event:', error);
  }
}

/**
 * Extract relevant PR data from the webhook event
 * @param {Object} prEvent - The PR event data from CNB webhook
 * @returns {Object} Extracted PR data
 */
function extractPrData(prEvent) {
  return {
    id: prEvent.pull_request?.id,
    title: prEvent.pull_request?.title,
    description: prEvent.pull_request?.description,
    author: prEvent.pull_request?.author,
    repository: prEvent.repository?.name,
    changes: prEvent.pull_request?.changes || [],
    diff: prEvent.pull_request?.diff
  };
}

/**
 * Analyze code changes using AI
 * @param {Object} prData - The extracted PR data
 * @returns {Object} Analysis results
 */
async function analyzeCodeChanges(prData) {
  const results = {
    files: {}
  };
  
  // Check if prData has changes property
  if (!prData.changes) {
    console.warn('No changes found in PR data');
    return results;
  }
  
  // Process each file change in the PR
  for (const change of prData.changes) {
    const fileContent = change.content;
    const fileName = change.filename;
    const language = getFileLanguage(fileName);
    
    if (language) {
      try {
        // Initialize file results
        results.files[fileName] = {
          performance: [],
          security: [],
          solid: []
        };
        
        // Performance analysis
        const perfResults = await aiAnalyzer.analyzePerformance(fileContent, language);
        results.files[fileName].performance = perfResults.issues;
        
        // Security analysis
        const secResults = await aiAnalyzer.analyzeSecurity(fileContent, language);
        results.files[fileName].security = secResults.issues;
        
        // SOLID principles analysis
        const solidResults = await aiAnalyzer.analyzeSOLID(fileContent, language);
        results.files[fileName].solid = solidResults.issues;
      } catch (error) {
        console.error(`Error analyzing file ${fileName}:`, error);
      }
    }
  }
  
  return results;
}

/**
 * Get programming language from file extension
 * @param {string} fileName - The file name
 * @returns {string|null} The programming language or null if not supported
 */
function getFileLanguage(fileName) {
  const extensions = {
    '.js': 'JavaScript',
    '.ts': 'TypeScript',
    '.py': 'Python',
    '.java': 'Java',
    '.cpp': 'C++',
    '.c': 'C',
    '.cs': 'C#',
    '.go': 'Go',
    '.rb': 'Ruby',
    '.php': 'PHP',
    '.swift': 'Swift',
    '.kt': 'Kotlin'
  };
  
  const ext = fileName.substring(fileName.lastIndexOf('.'));
  return extensions[ext] || null;
}

/**
 * Post review comments to PR
 * @param {string} repoName - Repository name
 * @param {number} prId - Pull request ID
 * @param {Object} analysisResults - Analysis results from AI
 */
async function postReviewComments(repoName, prId, analysisResults) {
  try {
    const fileComments = [];
    
    // Process each file's analysis results
    for (const [fileName, fileAnalysis] of Object.entries(analysisResults.files)) {
      // Create a comment for this file
      const fileComment = CommentFormatter.formatComment(fileAnalysis, fileName);
      
      // Add to file comments array for summary
      fileComments.push({
        fileName: fileName,
        analysisResults: fileAnalysis,
        content: fileComment
      });
      
      // Post the comment to the PR
      await cnbApiClient.postPrComment(repoName, prId, {
        path: fileName,
        position: 1,
        content: fileComment
      });
      console.log(`Posted review comment for ${fileName} to PR #${prId}`);
    }
    
    // Post summary comment
    if (fileComments.length > 0) {
      const summaryComment = CommentFormatter.formatSummaryComment(fileComments);
      await cnbApiClient.postPrComment(repoName, prId, {
        path: 'README.md',
        position: 1,
        content: summaryComment
      });
      console.log(`Posted summary comment to PR #${prId}`);
    } else {
      console.log(`No issues found in PR #${prId}`);
    }
  } catch (error) {
    console.error(`Error posting review comments to PR #${prId}:`, error);
  }
}

module.exports = { processPrEvent, extractPrData, analyzeCodeChanges, postReviewComments };