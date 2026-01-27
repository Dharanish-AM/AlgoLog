/**
 * Test Setup File
 * Initialize test environment before running tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.MONGO_TEST_URL = process.env.MONGO_TEST_URL || 'mongodb://127.0.0.1:27017/algolog_test';
process.env.DB_URI = process.env.MONGO_TEST_URL; // Force tests to local test DB, never prod
process.env.JWT_SECRET = 'test_jwt_secret_key';

// Mock Mongoose sessions to avoid replica-set requirement during tests
const mongoose = require('mongoose');
jest.spyOn(mongoose, 'startSession').mockResolvedValue({
  withTransaction: async (fn) => fn(),
  endSession: async () => {},
  inTransaction: () => false,
  client: { s: { options: {} } },
});

// Mock scrapers/config to avoid background intervals during tests
jest.mock('../config/scraper', () => ({
  startCacheCleanup: jest.fn(),
}));

// Mock helpers to skip external stats fetching and keep tests fast (track calls)
jest.mock('../utils/helpers', () => ({
  getStatsForStudent: jest.fn(async () => ({ stats: {} })),
}));

// Mock authMiddleware BEFORE any routes are loaded
jest.mock('../middleware/authMiddleware', () => {
  return (req, res, next) => {
    // Inject test user/class context
    req.user = { id: 'test-class-id', type: 'class' };
    req.classId = 'test-class-id';
    next();
  };
});

// Global test timeout (30s to account for DB ops)
jest.setTimeout(30000);

// Clean up after all tests
afterAll(async () => {
  // Close database connection if open
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});

// Suppress console logs during tests (optional)
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn((msg) => {
    // Only log actual errors
    if (msg && msg.includes('Error')) {
      process.stderr.write(msg + '\n');
    }
  }),
};
