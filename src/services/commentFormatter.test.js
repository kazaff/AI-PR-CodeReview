const CommentFormatter = require('./commentFormatter');

describe('CommentFormatter', () => {
  describe('formatComment', () => {
    it('should format comment with all issue types correctly', () => {
      const analysisResults = {
        performance: [
          {
            type: 'Performance Issue',
            description: 'Inefficient loop detected',
            suggestion: 'Use Array.map instead of for loop',
            severity: 'Medium',
            codeSnippet: 'for (let i = 0; i < arr.length; i++) { }',
            language: 'javascript'
          }
        ],
        security: [
          {
            type: 'Security Vulnerability',
            description: 'Potential XSS vulnerability',
            suggestion: 'Sanitize user input before rendering',
            severity: 'High',
            codeSnippet: 'document.innerHTML = userInput;',
            language: 'javascript'
          }
        ],
        solid: [
          {
            type: 'SOLID Violation',
            description: 'Class has too many responsibilities',
            suggestion: 'Split class into smaller, focused classes',
            severity: 'Low',
            codeSnippet: 'class GodClass { /* many methods */ }',
            language: 'javascript'
          }
        ]
      };
      
      const fileName = 'example.js';
      const result = CommentFormatter.formatComment(analysisResults, fileName);
      
      expect(result).toContain(`## Code Review for \`${fileName}\``);
      expect(result).toContain('### Summary');
      expect(result).toContain('- Total issues found: 3');
      expect(result).toContain('- Performance issues: 1');
      expect(result).toContain('- Security issues: 1');
      expect(result).toContain('- SOLID principle violations: 1');
      expect(result).toContain('### Performance Issues');
      expect(result).toContain('### Security Issues');
      expect(result).toContain('### SOLID Principle Violations');
      expect(result).toContain('```javascript');
      expect(result).toContain('for (let i = 0; i < arr.length; i++) { }');
      expect(result).toContain('document.innerHTML = userInput;');
      expect(result).toContain('class GodClass { /* many methods */ }');
    });
    
    it('should format comment with no issues correctly', () => {
      const analysisResults = {
        performance: [],
        security: [],
        solid: []
      };
      
      const fileName = 'clean.js';
      const result = CommentFormatter.formatComment(analysisResults, fileName);
      
      expect(result).toContain(`## Code Review for \`${fileName}\``);
      expect(result).toContain('- Total issues found: 0');
      expect(result).toContain('No issues found during code review.');
    });
  });
  
  describe('formatSummaryComment', () => {
    it('should format summary comment correctly', () => {
      const fileComments = [
        {
          fileName: 'file1.js',
          analysisResults: {
            performance: [{ type: 'Issue 1' }],
            security: [{ type: 'Issue 2' }],
            solid: []
          }
        },
        {
          fileName: 'file2.js',
          analysisResults: {
            performance: [],
            security: [],
            solid: [{ type: 'Issue 3' }]
          }
        }
      ];
      
      const result = CommentFormatter.formatSummaryComment(fileComments);
      
      expect(result).toContain('## Code Review Summary');
      expect(result).toContain('- Files reviewed: 2');
      expect(result).toContain('- Total issues found: 3');
      expect(result).toContain('- `file1.js`: 2 issues');
      expect(result).toContain('- `file2.js`: 1 issues');
      expect(result).toContain('Please address the identified issues before merging this pull request.');
    });
    
    it('should format summary comment with no files correctly', () => {
      const fileComments = [];
      const result = CommentFormatter.formatSummaryComment(fileComments);
      
      expect(result).toContain('## Code Review Summary');
      expect(result).toContain('- Files reviewed: 0');
      expect(result).toContain('- Total issues found: 0');
    });
  });
  
  describe('countIssues', () => {
    it('should count issues correctly', () => {
      const analysisResults = {
        performance: [1, 2],
        security: [1, 2, 3],
        solid: [1]
      };
      
      const result = CommentFormatter.countIssues(analysisResults);
      expect(result).toBe(6);
    });
    
    it('should count issues correctly with missing sections', () => {
      const analysisResults = {
        performance: [1, 2],
        security: [1, 2, 3]
        // solid is missing
      };
      
      const result = CommentFormatter.countIssues(analysisResults);
      expect(result).toBe(5);
    });
  });
});