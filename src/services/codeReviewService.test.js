const { processPrEvent, extractPrData } = require('./codeReviewService');
const AIAnalyzer = require('./aiAnalyzer');
const CnbApiClient = require('./cnbApiClient');
const CommentFormatter = require('./commentFormatter');

// Mock the dependencies
jest.mock('./aiAnalyzer');
jest.mock('./cnbApiClient');
jest.mock('./commentFormatter');

describe('codeReviewService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('extractPrData', () => {
    it('should extract PR data correctly', () => {
      const prEvent = {
        pull_request: {
          id: 123,
          title: 'Test PR',
          description: 'This is a test PR',
          author: 'test-user'
        },
        repository: {
          name: 'test-repo'
        }
      };

      const result = extractPrData(prEvent);

      expect(result).toEqual({
        id: 123,
        title: 'Test PR',
        description: 'This is a test PR',
        author: 'test-user',
        repository: 'test-repo',
        changes: [],
        diff: undefined
      });
    });
  });

  describe('processPrEvent', () => {
    it('should process PR event and post comments', async () => {
      // Mock the AI analyzer response
      const mockAnalysisResults = {
        files: {
          'test.js': {
            performance: [{ type: 'Performance Issue', description: 'Inefficient loop' }],
            security: [{ type: 'Security Issue', description: 'Potential XSS' }],
            solid: [{ type: 'SOLID Issue', description: 'Class has too many responsibilities' }]
          }
        }
      };

      // Mock the CNB API client
      const mockCnbApiClient = {
        getPrDetails: jest.fn().mockResolvedValue({
          changes: [
            {
              filename: 'test.js',
              content: 'console.log("test");'
            }
          ]
        }),
        postPrComment: jest.fn().mockResolvedValue({})
      };

      // Mock the AI analyzer
      const mockAiAnalyzer = {
        analyzePerformance: jest.fn().mockResolvedValue({
          issues: [{ type: 'Performance Issue', description: 'Inefficient loop' }]
        }),
        analyzeSecurity: jest.fn().mockResolvedValue({
          issues: [{ type: 'Security Issue', description: 'Potential XSS' }]
        }),
        analyzeSOLID: jest.fn().mockResolvedValue({
          issues: [{ type: 'SOLID Issue', description: 'Class has too many responsibilities' }]
        })
      };

      // Mock the comment formatter
      const mockCommentFormatter = {
        formatComment: jest.fn().mockReturnValue('## Formatted Comment'),
        formatSummaryComment: jest.fn().mockReturnValue('## Summary Comment')
      };

      // Create a new instance of the service with mocked dependencies
      const codeReviewService = require('./codeReviewService');
      
      // Replace the actual implementations with mocks
      CnbApiClient.mockImplementation(() => mockCnbApiClient);
      AIAnalyzer.mockImplementation(() => mockAiAnalyzer);
      CommentFormatter.formatComment = mockCommentFormatter.formatComment;
      CommentFormatter.formatSummaryComment = mockCommentFormatter.formatSummaryComment;

      const prEvent = {
        pull_request: {
          id: 123,
          title: 'Test PR',
          description: 'This is a test PR',
          author: 'test-user'
        },
        repository: {
          name: 'test-repo'
        }
      };

      // Mock the internal functions to avoid calling the actual implementations
      codeReviewService.analyzeCodeChanges = jest.fn().mockResolvedValue(mockAnalysisResults);
      codeReviewService.postReviewComments = jest.fn().mockResolvedValue();

      await codeReviewService.processPrEvent(prEvent);

      // Verify that the CNB API client methods were called
      expect(mockCnbApiClient.getPrDetails).toHaveBeenCalledWith('test-repo', 123);
      
      // Verify that the internal functions were called
      expect(codeReviewService.analyzeCodeChanges).toHaveBeenCalled();
      expect(codeReviewService.postReviewComments).toHaveBeenCalled();
    });
  });
});