const CnbApiClient = require('./cnbApiClient');

// Mock axios
jest.mock('axios');
const axios = require('axios');

// Mock config
jest.mock('config');
const config = require('config');

describe('CnbApiClient', () => {
  let cnbApiClient;
  
  beforeEach(() => {
    // Reset mocks
    axios.create.mockReturnValue({
      get: jest.fn(),
      post: jest.fn()
    });
    
    // Mock config values
    config.get.mockImplementation((key) => {
      if (key === 'cnbPlatform.baseUrl') {
        return 'https://api.cnb-platform.com';
      }
      return null;
    });
    
    // Mock process.env
    process.env.CNB_API_KEY = 'test-api-key';
    
    cnbApiClient = new CnbApiClient();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('getPrDetails', () => {
    it('should fetch PR details successfully', async () => {
      const mockResponse = {
        data: {
          id: 123,
          title: 'Test PR',
          description: 'This is a test PR'
        }
      };
      
      cnbApiClient.axiosInstance.get.mockResolvedValue(mockResponse);
      
      const result = await cnbApiClient.getPrDetails('test-repo', 123);
      
      expect(cnbApiClient.axiosInstance.get).toHaveBeenCalledWith('/test-repo/-/pulls/123');
      expect(result).toEqual(mockResponse.data);
    });
    
    it('should handle errors when fetching PR details', async () => {
      cnbApiClient.axiosInstance.get.mockRejectedValue(new Error('Network error'));
      
      await expect(cnbApiClient.getPrDetails('test-repo', 123)).rejects.toThrow('Failed to fetch PR details: Network error');
    });
  });
  

  
  describe('postPrComment', () => {
    it('should post a comment to a PR successfully', async () => {
      const mockResponse = {
        data: {
          id: 456,
          body: '## Code Review Comment\n\n### Issues Found\n\n1. **Performance**\n   - **Description**: Inefficient algorithm\n   - **Suggestion**: Use a more efficient approach\n   - **Severity**: High\n\n### Summary\n\nCode review completed. Found 1 issues.\n\n',
          path: 'src/index.js',
          position: 10
        }
      };
      
      cnbApiClient.axiosInstance.post.mockResolvedValue(mockResponse);
      
      const comment = {
        path: 'src/index.js',
        position: 10,
        issues: [
          {
            type: 'Performance',
            description: 'Inefficient algorithm',
            suggestion: 'Use a more efficient approach',
            severity: 'High'
          }
        ],
        summary: 'Code review completed. Found 1 issues.'
      };
      
      const result = await cnbApiClient.postPrComment('test-repo', 123, comment);
      
      expect(cnbApiClient.axiosInstance.post).toHaveBeenCalledWith('/test-repo/-/pulls/123/comments', {
        body: '## Code Review Comment\n\n### Issues Found\n\n1. **Performance**\n   - **Description**: Inefficient algorithm\n   - **Suggestion**: Use a more efficient approach\n   - **Severity**: High\n\n### Summary\n\nCode review completed. Found 1 issues.\n\n',
        path: 'src/index.js',
        position: 10
      });
      expect(result).toEqual(mockResponse.data);
    });
    
    it('should handle errors when posting a comment to a PR', async () => {
      cnbApiClient.axiosInstance.post.mockRejectedValue(new Error('Unauthorized'));
      
      const comment = {
        path: 'src/index.js',
        position: 10,
        issues: [],
        summary: 'Code review completed. Found 0 issues.'
      };
      
      await expect(cnbApiClient.postPrComment('test-repo', 123, comment)).rejects.toThrow('Failed to post PR comment: Unauthorized');
    });
  });
  
  describe('formatCommentAsMarkdown', () => {
    it('should format comment with issues correctly', () => {
      const comment = {
        issues: [
          {
            type: 'Performance',
            description: 'Inefficient algorithm',
            suggestion: 'Use a more efficient approach',
            severity: 'High'
          },
          {
            type: 'Security',
            description: 'Potential XSS vulnerability',
            suggestion: 'Sanitize user input',
            severity: 'Medium'
          }
        ],
        summary: 'Code review completed. Found 2 issues.'
      };
      
      const formatted = cnbApiClient.formatCommentAsMarkdown(comment);
      
      expect(formatted).toContain('## Code Review Comment');
      expect(formatted).toContain('### Issues Found');
      expect(formatted).toContain('1. **Performance**');
      expect(formatted).toContain('2. **Security**');
      expect(formatted).toContain('### Summary');
      expect(formatted).toContain('Code review completed. Found 2 issues.');
    });
    
    it('should format comment without issues correctly', () => {
      const comment = {
        issues: [],
        summary: 'Code review completed. Found 0 issues.'
      };
      
      const formatted = cnbApiClient.formatCommentAsMarkdown(comment);
      
      expect(formatted).toContain('## Code Review Comment');
      expect(formatted).toContain('### Issues Found');
      expect(formatted).toContain('### Summary');
      expect(formatted).toContain('Code review completed. Found 0 issues.');
    });
  });
});