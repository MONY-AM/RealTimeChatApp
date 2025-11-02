import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { generateToken } from '../../lib/utils.js';

jest.mock('jsonwebtoken');

describe('Utils - generateToken', () => {
  let res;
  const originalEnv = process.env.JWT_SECRET;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    res = { cookie: jest.fn() };
    process.env.JWT_SECRET = 'test_secret_key';
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    process.env.JWT_SECRET = originalEnv;
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('Token Generation', () => {
    test('should generate JWT token with userId', () => {
      const userId = 'user123';
      jwt.sign.mockReturnValue('mock.jwt.token');
      generateToken(userId, res);
      expect(jwt.sign).toHaveBeenCalledWith({ userId }, 'test_secret_key', { expiresIn: '7d' });
    });

    test('should use JWT_SECRET from environment', () => {
      process.env.JWT_SECRET = 'custom_secret';
      const userId = 'user123';
      jwt.sign.mockReturnValue('mock.jwt.token');
      generateToken(userId, res);
      expect(jwt.sign).toHaveBeenCalledWith({ userId }, 'custom_secret', { expiresIn: '7d' });
    });

    test('should generate token with 7 days expiration', () => {
      const userId = 'user123';
      jwt.sign.mockReturnValue('mock.jwt.token');
      generateToken(userId, res);
      const callArgs = jwt.sign.mock.calls[0];
      expect(callArgs[2]).toEqual({ expiresIn: '7d' });
    });
  });

  describe('Cookie Configuration', () => {
    test('should set cookie with correct name and token', () => {
      const userId = 'user123';
      const mockToken = 'generated.jwt.token';
      jwt.sign.mockReturnValue(mockToken);
      generateToken(userId, res);
      expect(res.cookie).toHaveBeenCalledWith('jwt', mockToken, expect.any(Object));
    });

    test('should set cookie maxAge to 7 days in milliseconds', () => {
      const userId = 'user123';
      jwt.sign.mockReturnValue('mock.token');
      generateToken(userId, res);
      const cookieOptions = res.cookie.mock.calls[0][2];
      expect(cookieOptions.maxAge).toBe(7 * 24 * 60 * 60 * 1000);
    });

    test('should set httpOnly flag to true', () => {
      const userId = 'user123';
      jwt.sign.mockReturnValue('mock.token');
      generateToken(userId, res);
      const cookieOptions = res.cookie.mock.calls[0][2];
      expect(cookieOptions.httpOnly).toBe(true);
    });

    test('should set sameSite to strict', () => {
      const userId = 'user123';
      jwt.sign.mockReturnValue('mock.token');
      generateToken(userId, res);
      const cookieOptions = res.cookie.mock.calls[0][2];
      expect(cookieOptions.sameSite).toBe('strict');
    });
  });

  describe('Environment-specific Cookie Settings', () => {
    test('should set secure to false in development', () => {
      process.env.NODE_ENV = 'development';
      const userId = 'user123';
      jwt.sign.mockReturnValue('mock.token');
      generateToken(userId, res);
      const cookieOptions = res.cookie.mock.calls[0][2];
      expect(cookieOptions.secure).toBe(false);
    });

    test('should set secure to true in production', () => {
      process.env.NODE_ENV = 'production';
      const userId = 'user123';
      jwt.sign.mockReturnValue('mock.token');
      generateToken(userId, res);
      const cookieOptions = res.cookie.mock.calls[0][2];
      expect(cookieOptions.secure).toBe(true);
    });

    test('should set secure to true when NODE_ENV is not development', () => {
      process.env.NODE_ENV = 'staging';
      const userId = 'user123';
      jwt.sign.mockReturnValue('mock.token');
      generateToken(userId, res);
      const cookieOptions = res.cookie.mock.calls[0][2];
      expect(cookieOptions.secure).toBe(true);
    });
  });

  describe('Security Features', () => {
    test('should prevent XSS with httpOnly flag', () => {
      const userId = 'user123';
      jwt.sign.mockReturnValue('mock.token');
      generateToken(userId, res);
      const cookieOptions = res.cookie.mock.calls[0][2];
      expect(cookieOptions.httpOnly).toBe(true);
    });

    test('should prevent CSRF with sameSite strict', () => {
      const userId = 'user123';
      jwt.sign.mockReturnValue('mock.token');
      generateToken(userId, res);
      const cookieOptions = res.cookie.mock.calls[0][2];
      expect(cookieOptions.sameSite).toBe('strict');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty string userId', () => {
      const userId = '';
      jwt.sign.mockReturnValue('mock.token');
      generateToken(userId, res);
      expect(jwt.sign).toHaveBeenCalledWith({ userId: '' }, 'test_secret_key', { expiresIn: '7d' });
    });

    test('should handle numeric userId', () => {
      const userId = 12345;
      jwt.sign.mockReturnValue('mock.token');
      generateToken(userId, res);
      expect(jwt.sign).toHaveBeenCalledWith({ userId: 12345 }, 'test_secret_key', { expiresIn: '7d' });
    });
  });
});