import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import { connectDB } from '../../lib/db.js';

jest.mock('mongoose');

describe('Database Connection - connectDB', () => {
  const originalEnv = process.env.MONGO_URL;
  const originalExit = process.exit;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MONGO_URL = 'mongodb://localhost:27017/test_db';
    process.exit = jest.fn();
    console.log = jest.fn();
  });

  afterEach(() => {
    process.env.MONGO_URL = originalEnv;
    process.exit = originalExit;
  });

  describe('Successful Connection', () => {
    test('should connect to MongoDB successfully', async () => {
      const mockConnection = { connection: { host: 'localhost' } };
      mongoose.connect.mockResolvedValue(mockConnection);
      await connectDB();
      expect(mongoose.connect).toHaveBeenCalledWith('mongodb://localhost:27017/test_db', {});
    });

    test('should log successful connection with host', async () => {
      const mockConnection = { connection: { host: 'cluster0.mongodb.net' } };
      mongoose.connect.mockResolvedValue(mockConnection);
      await connectDB();
      expect(console.log).toHaveBeenCalledWith('MongoDB connected', 'cluster0.mongodb.net');
    });

    test('should use MONGO_URL from environment', async () => {
      process.env.MONGO_URL = 'mongodb://custom-host:27017/custom_db';
      const mockConnection = { connection: { host: 'custom-host' } };
      mongoose.connect.mockResolvedValue(mockConnection);
      await connectDB();
      expect(mongoose.connect).toHaveBeenCalledWith('mongodb://custom-host:27017/custom_db', {});
    });

    test('should handle MongoDB Atlas connection string', async () => {
      process.env.MONGO_URL = 'mongodb+srv://user:pass@cluster0.mongodb.net/mydb';
      const mockConnection = { connection: { host: 'cluster0.mongodb.net' } };
      mongoose.connect.mockResolvedValue(mockConnection);
      await connectDB();
      expect(mongoose.connect).toHaveBeenCalledWith('mongodb+srv://user:pass@cluster0.mongodb.net/mydb', {});
    });
  });

  describe('Connection Failure', () => {
    test('should handle connection error and exit with code 1', async () => {
      const error = new Error('Connection failed');
      mongoose.connect.mockRejectedValue(error);
      await connectDB();
      expect(console.log).toHaveBeenCalledWith('Error while connecting to MongoDB', error);
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    test('should handle network timeout errors', async () => {
      const timeoutError = new Error('Connection timeout');
      timeoutError.code = 'ETIMEDOUT';
      mongoose.connect.mockRejectedValue(timeoutError);
      await connectDB();
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    test('should handle authentication errors', async () => {
      const authError = new Error('Authentication failed');
      authError.code = 'EAUTH';
      mongoose.connect.mockRejectedValue(authError);
      await connectDB();
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('Environment Configuration', () => {
    test('should handle missing MONGO_URL', async () => {
      delete process.env.MONGO_URL;
      const mockConnection = { connection: { host: 'localhost' } };
      mongoose.connect.mockResolvedValue(mockConnection);
      await connectDB();
      expect(mongoose.connect).toHaveBeenCalledWith(undefined, {});
    });

    test('should handle MONGO_URL with query parameters', async () => {
      process.env.MONGO_URL = 'mongodb://localhost:27017/db?retryWrites=true&w=majority';
      const mockConnection = { connection: { host: 'localhost' } };
      mongoose.connect.mockResolvedValue(mockConnection);
      await connectDB();
      expect(mongoose.connect).toHaveBeenCalledWith('mongodb://localhost:27017/db?retryWrites=true&w=majority', {});
    });
  });
});