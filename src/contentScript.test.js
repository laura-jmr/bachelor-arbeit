/*global chrome*/

// contentScript.test.js

// Mock chrome APIs
global.chrome = {
  storage: {
    local: {
      get: jest.fn().mockResolvedValue({ toggleValueAlt: true, toggleEasyLanguage: false }) // Mocking toggleValueAlt to true and toggleEasyLanguage to false for testing
    }
  },
  runtime: {
    sendMessage: jest.fn() // Mocking runtime.sendMessage method
  }
};

// Now import the module to test
const { initializeToggles, executeAltText, executeLeichteSprache } = require('./content');

describe('Content Script Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Initialize Toggles', async () => {
    await initializeToggles();
    expect(chrome.storage.local.get).toHaveBeenCalledTimes(1);
    expect(chrome.storage.local.get).toHaveBeenCalledWith(['toggleValueAlt', 'toggleEasyLanguage']);
    // Ensure that toggleAltText and toggleLeichteSprache are properly initialized
    expect(toggleAltText).toBe(true);
    expect(toggleLeichteSprache).toBe(false);
  });

  test('Execute Alt Text', async () => {
    await initializeToggles();
    await executeAltText();
    // Add assertions to ensure alt text execution
    expect(chrome.runtime.sendMessage).toHaveBeenCalledTimes(/* Expected count */);
    // Add more assertions as needed
  });

  test('Execute Leichte Sprache', async () => {
    await initializeToggles();
    await executeLeichteSprache();
    // Add assertions to ensure Leichte Sprache execution
    expect(chrome.runtime.sendMessage).toHaveBeenCalledTimes(/* Expected count */);
    // Add more assertions as needed
  });
});
