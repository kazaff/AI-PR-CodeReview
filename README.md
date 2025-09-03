# AI Code Review Assistant

AI Code Review Assistant is an automated code review tool that integrates with the CNB platform. It uses AI (Anthropic's Claude) to analyze pull requests for performance, security, and SOLID principle violations, then automatically posts structured feedback as comments on the PR.

## Features

- Automated code review for pull requests
- Analysis of performance issues
- Security vulnerability detection
- SOLID principle violation identification
- Automated commenting on pull requests with detailed feedback

## Technology Stack

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web framework for Node.js
- **Anthropic Claude API** - AI model for code analysis
- **Axios** - HTTP client for API requests
- **Jest** - Testing framework

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Anthropic API key
- CNB platform API key
- CNB platform webhook secret

## Configuration

1. Create a `.env` file in the project root based on `env.txt`:
   ```bash
   cp env.txt .env
   ```

2. Update the `.env` file with your actual credentials:
   ```bash
   # CNB Platform Configuration
   CNB_API_KEY=your_actual_cnb_api_key
   CNB_WEBHOOK_SECRET=your_actual_webhook_secret
   
   # AI Provider Configuration
   ANTHROPIC_API_KEY=your_actual_anthropic_api_key
   
   # Server Configuration
   PORT=3000
   ```

3. Update the `config/default.json` file with appropriate values for your CNB platform:
   ```json
   {
     "server": {
       "port": 3000
     },
     "cnbPlatform": {
       "baseUrl": "https://api.your-cnb-platform.com",
       "webhookSecret": "your-webhook-secret-here"
     },
     "aiProvider": {
       "name": "anthropic",
       "model": "claude-3-5-sonnet-20240620"
     }
   }
   ```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kazaff/AI-PR-CodeReview.git
   cd AI-PR-CodeReview
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Deployment

1. Start the server:
   ```bash
   npm start
   ```

2. The server will start on the port specified in your `.env` file (default: 3000).

3. Configure your CNB platform to send webhook events to:
   ```
   http://your-server-address:3000/webhook/pr
   ```

## Usage

Once deployed and configured, the AI Code Review Assistant will automatically analyze pull requests on your CNB platform. It will post detailed feedback as comments on the PR with identified issues and suggested improvements.

## Running Tests

To run the test suite:
```bash
npm test
```

## How It Works

1. The CNB platform sends webhook events to the assistant when a new pull request is created or updated.
2. The assistant fetches the full PR details from the CNB platform API.
3. Changed files are analyzed using Anthropic's Claude AI model for:
   - Performance issues
   - Security vulnerabilities
   - SOLID principle violations
4. The analysis results are formatted as structured comments.
5. Comments are posted back to the PR on the CNB platform.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Support

For support, please open an issue on the GitHub repository.
