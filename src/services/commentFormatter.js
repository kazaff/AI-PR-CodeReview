/**
 * Service to format code review results as markdown comments
 */

class CommentFormatter {
  /**
   * Format code review results as a markdown comment
   * @param {Object} analysisResults - The analysis results from AI analyzer
   * @param {string} fileName - The name of the file being reviewed
   * @returns {string} Formatted markdown comment
   */
  static formatComment(analysisResults, fileName) {
    let markdown = `## Code Review for \`${fileName}\`\n\n`;
    
    // Add a summary section
    const totalIssues = this.countIssues(analysisResults);
    markdown += `### Summary\n`;
    markdown += `- Total issues found: ${totalIssues}\n`;
    markdown += `- Performance issues: ${analysisResults.performance?.length || 0}\n`;
    markdown += `- Security issues: ${analysisResults.security?.length || 0}\n`;
    markdown += `- SOLID principle violations: ${analysisResults.solid?.length || 0}\n\n`;
    
    // Add performance issues section
    if (analysisResults.performance && analysisResults.performance.length > 0) {
      markdown += this.formatIssueSection('Performance Issues', analysisResults.performance);
    }
    
    // Add security issues section
    if (analysisResults.security && analysisResults.security.length > 0) {
      markdown += this.formatIssueSection('Security Issues', analysisResults.security);
    }
    
    // Add SOLID principle violations section
    if (analysisResults.solid && analysisResults.solid.length > 0) {
      markdown += this.formatIssueSection('SOLID Principle Violations', analysisResults.solid);
    }
    
    // Add no issues found message if applicable
    if (totalIssues === 0) {
      markdown += 'No issues found during code review.\n';
    }
    
    return markdown;
  }
  
  /**
   * Format a section of issues
   * @param {string} title - The section title
   * @param {Array} issues - The issues to format
   * @returns {string} Formatted section markdown
   */
  static formatIssueSection(title, issues) {
    let section = `### ${title}\n\n`;
    
    issues.forEach((issue, index) => {
      section += `#### ${index + 1}. ${issue.type || 'Issue'}\n`;
      section += `**Description:** ${issue.description || 'No description provided'}\n\n`;
      
      if (issue.suggestion) {
        section += `**Suggestion:** ${issue.suggestion}\n\n`;
      }
      
      if (issue.severity) {
        section += `**Severity:** ${issue.severity}\n\n`;
      }
      
      if (issue.codeSnippet) {
        section += `**Code Snippet:**\n`;
        section += `\`\`\`${issue.language || ''}\n`;
        section += `${issue.codeSnippet}\n`;
        section += `\`\`\`\n\n`;
      }
    });
    
    return section;
  }
  
  /**
   * Count total issues in analysis results
   * @param {Object} analysisResults - The analysis results
   * @returns {number} Total number of issues
   */
  static countIssues(analysisResults) {
    return (analysisResults.performance?.length || 0) +
           (analysisResults.security?.length || 0) +
           (analysisResults.solid?.length || 0);
  }
  
  /**
   * Format a summary comment for the PR
   * @param {Array} fileComments - Array of file comments
   * @returns {string} Formatted summary markdown comment
   */
  static formatSummaryComment(fileComments) {
    let markdown = `## Code Review Summary\n\n`;
    
    const totalFiles = fileComments.length;
    let totalIssues = 0;
    
    // Calculate total issues
    fileComments.forEach(comment => {
      totalIssues += this.countIssues(comment.analysisResults);
    });
    
    markdown += `### Overall Statistics\n`;
    markdown += `- Files reviewed: ${totalFiles}\n`;
    markdown += `- Total issues found: ${totalIssues}\n\n`;
    
    // Add file-specific summaries
    if (fileComments.length > 0) {
      markdown += `### File Review Details\n`;
      fileComments.forEach(comment => {
        const issuesCount = this.countIssues(comment.analysisResults);
        markdown += `- \`${comment.fileName}\`: ${issuesCount} issues\n`;
      });
      markdown += `\n`;
    }
    
    // Add recommendations
    markdown += `### Recommendations\n`;
    markdown += `Please address the identified issues before merging this pull request.\n`;
    
    return markdown;
  }
}

module.exports = CommentFormatter;