// Mock config module
jest.mock('config', () => ({
  get: jest.fn((key) => {
    const config = {
      'cnbPlatform.baseUrl': 'https://api.cnb-platform.com',
      'aiProvider.name': 'anthropic',
      'aiProvider.model': 'claude-3-5-sonnet-20240620'
    };
    return config[key];
  })
}));