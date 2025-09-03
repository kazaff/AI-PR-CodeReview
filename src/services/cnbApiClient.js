const axios = require('axios');
const config = require('config');

class CnbApiClient {
  constructor() {
    this.baseUrl = config.get('cnbPlatform.baseUrl');
    this.apiKey = process.env.CNB_API_KEY;
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Fetch PR details from CNB platform
   * @param {string} repoName - Repository name
   * @param {number} prId - Pull request ID
   * @returns {Promise<Object>} PR details
   */
  async getPrDetails(repoName, prId) {
    try {
      const response = await this.axiosInstance.get(`/${repoName}/-/pulls/${prId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch PR details: ${error.message}`);
    }
  }

  /**
   * Fetch file content from CNB platform
   * @param {string} repoName - Repository name
   * @param {string} filePath - File path
   * @param {string} ref - Git reference (branch, tag, or commit SHA)
   * @returns {Promise<Object>} File content
   */
  async getFileContent(repoName, filePath, ref) {
    try {
      const response = await this.axiosInstance.get(`/repos/${repoName}/contents/${filePath}`, {
        params: { ref }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch file content: ${error.message}`);
    }
  }

  /**
   * Post a comment to a PR discussion thread
   * @param {string} repoName - Repository name
   * @param {number} prId - Pull request ID
   * @param {Object} comment - Comment object with file path, line number, and content
   * @returns {Promise<Object>} Comment response
   */
  async postPrComment(repoName, prId, comment) {
    try {
      // Use the comment content directly as it's already formatted as markdown
      const commentContent = comment.content || this.formatCommentAsMarkdown(comment);
      
      const response = await this.axiosInstance.post(`/${repoName}/-/pulls/${prId}/comments`, {
        body: commentContent,
        path: comment.path,
        position: comment.position
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to post PR comment: ${error.message}`);
    }
  }

  /**
   * Format comment content as markdown
   * @param {Object} comment - Comment object
   * @returns {string} Formatted markdown comment
   */
  formatCommentAsMarkdown(comment) {
    let markdown = `## Code Review Comment\n\n`;
    
    if (comment.issues && comment.issues.length > 0) {
      markdown += `### Issues Found\n\n`;
      comment.issues.forEach((issue, index) => {
        markdown += `${index + 1}. **${issue.type}**\n`;
        markdown += `   - **Description**: ${issue.description}\n`;
        if (issue.suggestion) {
          markdown += `   - **Suggestion**: ${issue.suggestion}\n`;
        }
        if (issue.severity) {
          markdown += `   - **Severity**: ${issue.severity}\n`;
        }
        markdown += `\n`;
      });
    } else {
      markdown += `### Issues Found\n\nNo issues found during code review.\n\n`;
    }
    
    if (comment.summary) {
      markdown += `### Summary\n\n${comment.summary}\n\n`;
    }
    
    return markdown;
  }
}

module.exports = CnbApiClient;