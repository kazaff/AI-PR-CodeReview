/**
 * AI Analyzer service for code review using LLM
 */
const axios = require('axios');
const config = require('config');

class AIAnalyzer {
  constructor() {
    // Get model name from config
    this.model = config.get('aiProvider.model');
  }
  
  /**
   * Analyze code for performance issues
   * @param {string} code - The code to analyze
   * @param {string} language - The programming language
   * @returns {Object} Analysis results
   */
  async analyzePerformance(code, language) {
    const prompt = this.createPerformancePrompt(code, language);
    const response = await this.callLLM(prompt);
    return this.parseAnalysisResponse(response);
  }
  
  /**
   * Analyze code for security vulnerabilities
   * @param {string} code - The code to analyze
   * @param {string} language - The programming language
   * @returns {Object} Analysis results
   */
  async analyzeSecurity(code, language) {
    const prompt = this.createSecurityPrompt(code, language);
    const response = await this.callLLM(prompt);
    return this.parseAnalysisResponse(response);
  }
  
  /**
   * Analyze code for SOLID principle violations
   * @param {string} code - The code to analyze
   * @param {string} language - The programming language
   * @returns {Object} Analysis results
   */
  async analyzeSOLID(code, language) {
    const prompt = this.createSOLIDPrompt(code, language);
    const response = await this.callLLM(prompt);
    return this.parseAnalysisResponse(response);
  }
  
  /**
   * Create prompt for performance analysis
   * @param {string} code - The code to analyze
   * @param {string} language - The programming language
   * @returns {string} The prompt
   */
  createPerformancePrompt(code, language) {
    return `Analyze the following ${language} code for performance issues:
    
${code}

Please identify any performance bottlenecks, inefficient algorithms, or optimization opportunities. For each issue found, provide:
1. A brief description of the issue
2. The specific line number(s) where the issue occurs
3. A recommended solution or improvement

Format your response as a JSON object with an "issues" array. Each issue should have:
- "type": "performance"
- "description": Description of the issue
- "line": Line number(s)
- "solution": Recommended solution
- "severity": "critical", "major", or "minor"

Example:
{
  "issues": [
    {
      "type": "performance",
      "description": "Inefficient loop complexity",
      "line": "15-18",
      "solution": "Consider using a more efficient algorithm or data structure",
      "severity": "major"
    }
  ]
}`;
  }
  
  /**
   * Create prompt for security analysis
   * @param {string} code - The code to analyze
   * @param {string} language - The programming language
   * @returns {string} The prompt
   */
  createSecurityPrompt(code, language) {
    return `Analyze the following ${language} code for security vulnerabilities:
    
${code}

Please identify any security issues such as:
- Input validation problems
- SQL injection vulnerabilities
- XSS vulnerabilities
- Authentication/authorization issues
- Hardcoded secrets
- Buffer overflows
- Other security best practice violations

For each issue found, provide:
1. A brief description of the vulnerability
2. The specific line number(s) where the issue occurs
3. A recommended solution to fix the vulnerability

Format your response as a JSON object with an "issues" array. Each issue should have:
- "type": "security"
- "description": Description of the vulnerability
- "line": Line number(s)
- "solution": Recommended solution
- "severity": "critical", "major", or "minor"

Example:
{
  "issues": [
    {
      "type": "security",
      "description": "Potential SQL injection vulnerability",
      "line": "22",
      "solution": "Use parameterized queries instead of string concatenation",
      "severity": "critical"
    }
  ]
}`;
  }
  
  /**
   * Create prompt for SOLID principles analysis
   * @param {string} code - The code to analyze
   * @param {string} language - The programming language
   * @returns {string} The prompt
   */
  createSOLIDPrompt(code, language) {
    return `Analyze the following ${language} code for SOLID principle violations:
    
${code}

Please identify any violations of the SOLID principles:
1. Single Responsibility Principle (SRP)
2. Open/Closed Principle (OCP)
3. Liskov Substitution Principle (LSP)
4. Interface Segregation Principle (ISP)
5. Dependency Inversion Principle (DIP)

For each violation found, provide:
1. A brief description of which SOLID principle is violated
2. The specific line number(s) where the violation occurs
3. A recommended solution to fix the violation

Format your response as a JSON object with an "issues" array. Each issue should have:
- "type": "solid"
- "description": Description of the SOLID principle violation
- "line": Line number(s)
- "solution": Recommended solution
- "severity": "critical", "major", or "minor"

Example:
{
  "issues": [
    {
      "type": "solid",
      "description": "Single Responsibility Principle violation - class has multiple responsibilities",
      "line": "10-50",
      "solution": "Split the class into multiple classes with single responsibilities",
      "severity": "major"
    }
  ]
}`;
  }
  
  /**
   * Call the LLM with a prompt
   * @param {string} prompt - The prompt to send to the LLM
   * @returns {string} The LLM response
   */
  async callLLM(prompt) {
    try {
      const response = await axios.post(
        'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
        {
          model: this.model,
          input: {
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ]
          },
          parameters: {
            max_tokens: 1000
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data.output.choices[0].message.content;
    } catch (error) {
      console.error('Error calling DashScope API:', error);
      throw error;
    }
  }
  
  /**
   * Parse the analysis response from the LLM
   * @param {string} response - The LLM response
   * @returns {Object} Parsed analysis results
   */
  parseAnalysisResponse(response) {
    try {
      // Try to parse the response as JSON
      const parsed = JSON.parse(response);
      return parsed;
    } catch (error) {
      console.error('Error parsing LLM response:', error);
      // Return a default structure if parsing fails
      return {
        issues: []
      };
    }
  }
}

module.exports = AIAnalyzer;