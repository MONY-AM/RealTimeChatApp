import { jest } from '@jest/globals';

// Set test environment variables
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.NODE_ENV = 'test';
process.env.MONGO_URL = 'mongodb://localhost:27017/test_db';

// Increase timeout for async operations
jest.setTimeout(10000);