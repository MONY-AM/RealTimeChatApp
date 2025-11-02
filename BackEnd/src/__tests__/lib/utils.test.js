import jwt from 'jsonwebtoken';
import { generateToken } from '../../lib/utils.js';

// Mock jsonwebtoken
jest.mock('jsonwebtoken');

describe('Utils - generateToken', () => {
  let res;
  const originalEnv = process.env.NODE_ENV;
  const originalJwtSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup response mock
    res = {
      cookie: jest.fn()
    };

    // Setup default environment
    process.env.JWT_SECRET = 'test_secret_key';
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    process.env.JWT_SECRET = originalJwtSecret;
  });

  describe('Token Generation', () => {
    it('should generate JWT token with correct userId', () => {
      // Arrange
      const userId = 'user123';
      const expectedToken = 'jwt.token.here';
      jwt.sign.mockReturnValue(expectedToken);

      // Act
      generateToken(userId, res);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 'user123' },
        'test_secret_key',
        { expiresIn: '7d' }
      );
    });

    it('should use JWT_SECRET from environment variables', () => {
      // Arrange
      process.env.JWT_SECRET = 'my_custom_secret';
      const userId = 'user456';
      jwt.sign.mockReturnValue('token');

      // Act
      generateToken(userId, res);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId },
        'my_custom_secret',
        expect.any(Object)
      );
    });

    it('should set token expiration to 7 days', () => {
      // Arrange
      const userId = 'user789';
      jwt.sign.mockReturnValue('token');

      // Act
      generateToken(userId, res);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(String),
        { expiresIn: '7d' }
      );
    });

    it('should handle numeric userId', () => {
      // Arrange
      const userId = 12345;
      jwt.sign.mockReturnValue('token');

      // Act
      generateToken(userId, res);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 12345 },
        expect.any(String),
        expect.any(Object)
      );
    });

    it('should handle ObjectId-like userId', () => {
      // Arrange
      const userId = { toString: () => '507f1f77bcf86cd799439011' };
      jwt.sign.mockReturnValue('token');

      // Act
      generateToken(userId, res);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId },
        expect.any(String),
        expect.any(Object)
      );
    });
  });

  describe('Cookie Configuration', () => {
    it('should set cookie with correct name and token', () => {
      // Arrange
      const userId = 'user123';
      const expectedToken = 'generated.jwt.token';
      jwt.sign.mockReturnValue(expectedToken);

      // Act
      generateToken(userId, res);

      // Assert
      expect(res.cookie).toHaveBeenCalledWith(
        'jwt',
        expectedToken,
        expect.any(Object)
      );
    });

    it('should set cookie maxAge to 7 days in milliseconds', () => {
      // Arrange
      const userId = 'user123';
      jwt.sign.mockReturnValue('token');
      const expectedMaxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

      // Act
      generateToken(userId, res);

      // Assert
      expect(res.cookie).toHaveBeenCalledWith(
        'jwt',
        'token',
        expect.objectContaining({
          maxAge: expectedMaxAge
        })
      );
    });

    it('should set httpOnly flag to true', () => {
      // Arrange
      const userId = 'user123';
      jwt.sign.mockReturnValue('token');

      // Act
      generateToken(userId, res);

      // Assert
      expect(res.cookie).toHaveBeenCalledWith(
        'jwt',
        'token',
        expect.objectContaining({
          httpOnly: true
        })
      );
    });

    it('should set sameSite to strict', () => {
      // Arrange
      const userId = 'user123';
      jwt.sign.mockReturnValue('token');

      // Act
      generateToken(userId, res);

      // Assert
      expect(res.cookie).toHaveBeenCalledWith(
        'jwt',
        'token',
        expect.objectContaining({
          sameSite: 'strict'
        })
      );
    });

    it('should set secure to false in development environment', () => {
      // Arrange
      process.env.NODE_ENV = 'development';
      const userId = 'user123';
      jwt.sign.mockReturnValue('token');

      // Act
      generateToken(userId, res);

      // Assert
      expect(res.cookie).toHaveBeenCalledWith(
        'jwt',
        'token',
        expect.objectContaining({
          secure: false
        })
      );
    });

    it('should set secure to true in production environment', () => {
      // Arrange
      process.env.NODE_ENV = 'production';
      const userId = 'user123';
      jwt.sign.mockReturnValue('token');

      // Act
      generateToken(userId, res);

      // Assert
      expect(res.cookie).toHaveBeenCalledWith(
        'jwt',
        'token',
        expect.objectContaining({
          secure: true
        })
      );
    });

    it('should set secure to true in staging environment', () => {
      // Arrange
      process.env.NODE_ENV = 'staging';
      const userId = 'user123';
      jwt.sign.mockReturnValue('token');

      // Act
      generateToken(userId, res);

      // Assert
      expect(res.cookie).toHaveBeenCalledWith(
        'jwt',
        'token',
        expect.objectContaining({
          secure: true
        })
      );
    });

    it('should set secure to true when NODE_ENV is undefined', () => {
      // Arrange
      delete process.env.NODE_ENV;
      const userId = 'user123';
      jwt.sign.mockReturnValue('token');

      // Act
      generateToken(userId, res);

      // Assert
      expect(res.cookie).toHaveBeenCalledWith(
        'jwt',
        'token',
        expect.objectContaining({
          secure: true
        })
      );
    });
  });

  describe('Cookie Options - Complete Configuration', () => {
    it('should set all cookie options correctly', () => {
      // Arrange
      process.env.NODE_ENV = 'development';
      const userId = 'user123';
      jwt.sign.mockReturnValue('token');

      // Act
      generateToken(userId, res);

      // Assert
      expect(res.cookie).toHaveBeenCalledWith(
        'jwt',
        'token',
        {
          maxAge: 7 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          sameSite: 'strict',
          secure: false
        }
      );
    });

    it('should set all cookie options for production', () => {
      // Arrange
      process.env.NODE_ENV = 'production';
      const userId = 'user123';
      jwt.sign.mockReturnValue('token');

      // Act
      generateToken(userId, res);

      // Assert
      expect(res.cookie).toHaveBeenCalledWith(
        'jwt',
        'token',
        {
          maxAge: 7 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          sameSite: 'strict',
          secure: true
        }
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string userId', () => {
      // Arrange
      const userId = '';
      jwt.sign.mockReturnValue('token');

      // Act
      generateToken(userId, res);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: '' },
        expect.any(String),
        expect.any(Object)
      );
    });

    it('should handle null userId', () => {
      // Arrange
      const userId = null;
      jwt.sign.mockReturnValue('token');

      // Act
      generateToken(userId, res);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: null },
        expect.any(String),
        expect.any(Object)
      );
    });

    it('should handle undefined userId', () => {
      // Arrange
      const userId = undefined;
      jwt.sign.mockReturnValue('token');

      // Act
      generateToken(userId, res);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: undefined },
        expect.any(String),
        expect.any(Object)
      );
    });

    it('should handle very long userId string', () => {
      // Arrange
      const userId = 'a'.repeat(1000);
      jwt.sign.mockReturnValue('token');

      // Act
      generateToken(userId, res);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId },
        expect.any(String),
        expect.any(Object)
      );
    });

    it('should handle special characters in userId', () => {
      // Arrange
      const userId = 'user!@#$%^&*()';
      jwt.sign.mockReturnValue('token');

      // Act
      generateToken(userId, res);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId },
        expect.any(String),
        expect.any(Object)
      );
    });
  });

  describe('Return Value', () => {
    it('should not return any value', () => {
      // Arrange
      const userId = 'user123';
      jwt.sign.mockReturnValue('token');

      // Act
      const result = generateToken(userId, res);

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('Security Considerations', () => {
    it('should set httpOnly to prevent XSS attacks', () => {
      // Arrange
      const userId = 'user123';
      jwt.sign.mockReturnValue('token');

      // Act
      generateToken(userId, res);

      // Assert - httpOnly flag prevents client-side JavaScript access
      const cookieOptions = res.cookie.mock.calls[0][2];
      expect(cookieOptions.httpOnly).toBe(true);
    });

    it('should set sameSite to strict to prevent CSRF attacks', () => {
      // Arrange
      const userId = 'user123';
      jwt.sign.mockReturnValue('token');

      // Act
      generateToken(userId, res);

      // Assert - sameSite strict prevents cross-site request forgery
      const cookieOptions = res.cookie.mock.calls[0][2];
      expect(cookieOptions.sameSite).toBe('strict');
    });

    it('should use secure flag in production for HTTPS only', () => {
      // Arrange
      process.env.NODE_ENV = 'production';
      const userId = 'user123';
      jwt.sign.mockReturnValue('token');

      // Act
      generateToken(userId, res);

      // Assert - secure flag ensures HTTPS transmission only
      const cookieOptions = res.cookie.mock.calls[0][2];
      expect(cookieOptions.secure).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should complete full token generation and cookie setting flow', () => {
      // Arrange
      const userId = 'test-user-id';
      const generatedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
      jwt.sign.mockReturnValue(generatedToken);

      // Act
      generateToken(userId, res);

      // Assert - verify complete flow
      expect(jwt.sign).toHaveBeenCalledTimes(1);
      expect(res.cookie).toHaveBeenCalledTimes(1);
      expect(res.cookie).toHaveBeenCalledWith('jwt', generatedToken, expect.any(Object));
    });

    it('should be callable multiple times with different users', () => {
      // Arrange
      jwt.sign.mockReturnValue('token1').mockReturnValueOnce('token1');
      jwt.sign.mockReturnValue('token2').mockReturnValueOnce('token2');

      // Act
      generateToken('user1', res);
      generateToken('user2', res);

      // Assert
      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(res.cookie).toHaveBeenCalledTimes(2);
    });
  });
});