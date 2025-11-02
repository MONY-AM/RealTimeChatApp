import mongoose from 'mongoose';
import { connectDB } from '../../lib/db.js';

// Mock mongoose
jest.mock('mongoose');

describe('Database - connectDB', () => {
  const originalEnv = { ...process.env };
  let mockExit;
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock process.exit
    mockExit = jest.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`Process.exit called with code ${code}`);
    });

    // Spy on console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Setup default environment
    process.env.MONGO_URL = 'mongodb://localhost:27017/testdb';
  });

  afterEach(() => {
    mockExit.mockRestore();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    process.env = { ...originalEnv };
  });

  describe('Successful Connection', () => {
    it('should connect to MongoDB with correct URL', async () => {
      // Arrange
      const mockConnection = {
        connection: {
          host: 'localhost:27017'
        }
      };
      mongoose.connect.mockResolvedValue(mockConnection);

      // Act
      await connectDB();

      // Assert
      expect(mongoose.connect).toHaveBeenCalledWith(
        'mongodb://localhost:27017/testdb',
        {}
      );
    });

    it('should log success message with host on successful connection', async () => {
      // Arrange
      const mockConnection = {
        connection: {
          host: 'localhost:27017'
        }
      };
      mongoose.connect.mockResolvedValue(mockConnection);

      // Act
      await connectDB();

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'MongoDB connected',
        'localhost:27017'
      );
    });

    it('should handle cloud MongoDB URL', async () => {
      // Arrange
      process.env.MONGO_URL = 'mongodb+srv://user:pass@cluster0.mongodb.net/mydb';
      const mockConnection = {
        connection: {
          host: 'cluster0.mongodb.net'
        }
      };
      mongoose.connect.mockResolvedValue(mockConnection);

      // Act
      await connectDB();

      // Assert
      expect(mongoose.connect).toHaveBeenCalledWith(
        'mongodb+srv://user:pass@cluster0.mongodb.net/mydb',
        {}
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'MongoDB connected',
        'cluster0.mongodb.net'
      );
    });

    it('should pass empty options object to mongoose.connect', async () => {
      // Arrange
      const mockConnection = {
        connection: {
          host: 'localhost'
        }
      };
      mongoose.connect.mockResolvedValue(mockConnection);

      // Act
      await connectDB();

      // Assert
      expect(mongoose.connect).toHaveBeenCalledWith(
        expect.any(String),
        {}
      );
    });

    it('should return nothing on successful connection', async () => {
      // Arrange
      const mockConnection = {
        connection: {
          host: 'localhost'
        }
      };
      mongoose.connect.mockResolvedValue(mockConnection);

      // Act
      const result = await connectDB();

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('Connection Failures', () => {
    it('should log error message on connection failure', async () => {
      // Arrange
      const error = new Error('Connection refused');
      mongoose.connect.mockRejectedValue(error);

      // Act & Assert
      await expect(async () => {
        await connectDB();
      }).rejects.toThrow('Process.exit called with code 1');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Error while connecting to MongoDB',
        error
      );
    });

    it('should call process.exit with code 1 on failure', async () => {
      // Arrange
      const error = new Error('Authentication failed');
      mongoose.connect.mockRejectedValue(error);

      // Act & Assert
      try {
        await connectDB();
      } catch (e) {
        expect(mockExit).toHaveBeenCalledWith(1);
      }
    });

    it('should handle network errors', async () => {
      // Arrange
      const networkError = new Error('ENOTFOUND');
      mongoose.connect.mockRejectedValue(networkError);

      // Act & Assert
      try {
        await connectDB();
      } catch (e) {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          'Error while connecting to MongoDB',
          networkError
        );
        expect(mockExit).toHaveBeenCalledWith(1);
      }
    });

    it('should handle authentication errors', async () => {
      // Arrange
      const authError = new Error('Authentication failed');
      authError.code = 18;
      mongoose.connect.mockRejectedValue(authError);

      // Act & Assert
      try {
        await connectDB();
      } catch (e) {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          'Error while connecting to MongoDB',
          authError
        );
        expect(mockExit).toHaveBeenCalledWith(1);
      }
    });

    it('should handle timeout errors', async () => {
      // Arrange
      const timeoutError = new Error('Connection timeout');
      timeoutError.name = 'MongoTimeoutError';
      mongoose.connect.mockRejectedValue(timeoutError);

      // Act & Assert
      try {
        await connectDB();
      } catch (e) {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          'Error while connecting to MongoDB',
          timeoutError
        );
        expect(mockExit).toHaveBeenCalledWith(1);
      }
    });

    it('should handle invalid connection string errors', async () => {
      // Arrange
      const invalidUrlError = new Error('Invalid connection string');
      mongoose.connect.mockRejectedValue(invalidUrlError);

      // Act & Assert
      try {
        await connectDB();
      } catch (e) {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          'Error while connecting to MongoDB',
          invalidUrlError
        );
        expect(mockExit).toHaveBeenCalledWith(1);
      }
    });
  });

  describe('Environment Variables', () => {
    it('should use MONGO_URL from environment', async () => {
      // Arrange
      process.env.MONGO_URL = 'mongodb://custom:27017/customdb';
      const mockConnection = {
        connection: {
          host: 'custom:27017'
        }
      };
      mongoose.connect.mockResolvedValue(mockConnection);

      // Act
      await connectDB();

      // Assert
      expect(mongoose.connect).toHaveBeenCalledWith(
        'mongodb://custom:27017/customdb',
        {}
      );
    });

    it('should handle undefined MONGO_URL', async () => {
      // Arrange
      delete process.env.MONGO_URL;
      mongoose.connect.mockRejectedValue(new Error('No connection string'));

      // Act & Assert
      try {
        await connectDB();
      } catch (e) {
        expect(mongoose.connect).toHaveBeenCalledWith(undefined, {});
      }
    });

    it('should handle empty MONGO_URL', async () => {
      // Arrange
      process.env.MONGO_URL = '';
      mongoose.connect.mockRejectedValue(new Error('Empty connection string'));

      // Act & Assert
      try {
        await connectDB();
      } catch (e) {
        expect(mongoose.connect).toHaveBeenCalledWith('', {});
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle connection object with missing host', async () => {
      // Arrange
      const mockConnection = {
        connection: {}
      };
      mongoose.connect.mockResolvedValue(mockConnection);

      // Act
      await connectDB();

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'MongoDB connected',
        undefined
      );
    });

    it('should handle connection object with null host', async () => {
      // Arrange
      const mockConnection = {
        connection: {
          host: null
        }
      };
      mongoose.connect.mockResolvedValue(mockConnection);

      // Act
      await connectDB();

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'MongoDB connected',
        null
      );
    });

    it('should handle very long connection strings', async () => {
      // Arrange
      const longUrl = 'mongodb://localhost:27017/' + 'a'.repeat(1000);
      process.env.MONGO_URL = longUrl;
      const mockConnection = {
        connection: {
          host: 'localhost:27017'
        }
      };
      mongoose.connect.mockResolvedValue(mockConnection);

      // Act
      await connectDB();

      // Assert
      expect(mongoose.connect).toHaveBeenCalledWith(longUrl, {});
    });

    it('should handle connection strings with special characters', async () => {
      // Arrange
      const specialUrl = 'mongodb://user%40name:p%40ssword@localhost:27017/db';
      process.env.MONGO_URL = specialUrl;
      const mockConnection = {
        connection: {
          host: 'localhost:27017'
        }
      };
      mongoose.connect.mockResolvedValue(mockConnection);

      // Act
      await connectDB();

      // Assert
      expect(mongoose.connect).toHaveBeenCalledWith(specialUrl, {});
    });

    it('should handle connection strings with query parameters', async () => {
      // Arrange
      const urlWithParams = 'mongodb://localhost:27017/db?retryWrites=true&w=majority';
      process.env.MONGO_URL = urlWithParams;
      const mockConnection = {
        connection: {
          host: 'localhost:27017'
        }
      };
      mongoose.connect.mockResolvedValue(mockConnection);

      // Act
      await connectDB();

      // Assert
      expect(mongoose.connect).toHaveBeenCalledWith(urlWithParams, {});
    });
  });

  describe('Process Exit Behavior', () => {
    it('should exit with status code 1 indicating failure', async () => {
      // Arrange
      mongoose.connect.mockRejectedValue(new Error('Connection failed'));

      // Act & Assert
      try {
        await connectDB();
      } catch (e) {
        expect(mockExit).toHaveBeenCalledWith(1);
        expect(mockExit).not.toHaveBeenCalledWith(0);
      }
    });

    it('should not call process.exit on successful connection', async () => {
      // Arrange
      const mockConnection = {
        connection: {
          host: 'localhost'
        }
      };
      mongoose.connect.mockResolvedValue(mockConnection);

      // Act
      await connectDB();

      // Assert
      expect(mockExit).not.toHaveBeenCalled();
    });
  });

  describe('Multiple Connection Attempts', () => {
    it('should be callable multiple times', async () => {
      // Arrange
      const mockConnection = {
        connection: {
          host: 'localhost'
        }
      };
      mongoose.connect.mockResolvedValue(mockConnection);

      // Act
      await connectDB();
      await connectDB();

      // Assert
      expect(mongoose.connect).toHaveBeenCalledTimes(2);
    });

    it('should handle success followed by failure', async () => {
      // Arrange
      const mockConnection = {
        connection: {
          host: 'localhost'
        }
      };
      mongoose.connect
        .mockResolvedValueOnce(mockConnection)
        .mockRejectedValueOnce(new Error('Second connection failed'));

      // Act
      await connectDB();
      
      // Assert first call succeeded
      expect(consoleLogSpy).toHaveBeenCalledWith('MongoDB connected', 'localhost');

      // Assert second call fails
      try {
        await connectDB();
      } catch (e) {
        expect(mockExit).toHaveBeenCalledWith(1);
      }
    });
  });
});