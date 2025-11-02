import { jest } from '@jest/globals';
import bcrypt from 'bcryptjs';
import { signup } from '../../controllers/auth.controller.js';
import User from '../../models/User.js';
import { generateToken } from '../../lib/utils.js';

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('../../models/User.js');
jest.mock('../../lib/utils.js');

describe('Auth Controller - signup', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('Input Validation', () => {
    test('should return 400 when fullName is missing', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      await signup(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required' });
    });

    test('should return 400 when email is missing', async () => {
      req.body = { fullName: 'John Doe', password: 'password123' };
      await signup(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required' });
    });

    test('should return 400 when password is missing', async () => {
      req.body = { fullName: 'John Doe', email: 'test@example.com' };
      await signup(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required' });
    });

    test('should return 400 when all fields are empty strings', async () => {
      req.body = { fullName: '', email: '', password: '' };
      await signup(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should return 400 when fields contain null values', async () => {
      req.body = { fullName: null, email: 'test@example.com', password: 'password123' };
      await signup(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Password Validation', () => {
    test('should return 400 when password is less than 6 characters', async () => {
      req.body = { fullName: 'John Doe', email: 'test@example.com', password: '12345' };
      await signup(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Password must be at least 6 characters long' });
    });

    test('should accept password with exactly 6 characters', async () => {
      req.body = { fullName: 'John Doe', email: 'test@example.com', password: '123456' };
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedPassword');
      const mockUser = {
        _id: 'userId123',
        fullName: 'John Doe',
        email: 'test@example.com',
        password: 'hashedPassword',
        save: jest.fn().mockResolvedValue(true),
      };
      User.mockImplementation(() => mockUser);
      await signup(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('should accept long passwords', async () => {
      const longPassword = 'a'.repeat(100);
      req.body = { fullName: 'John Doe', email: 'test@example.com', password: longPassword };
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedPassword');
      const mockUser = {
        _id: 'userId123',
        fullName: 'John Doe',
        email: 'test@example.com',
        password: 'hashedPassword',
        save: jest.fn().mockResolvedValue(true),
      };
      User.mockImplementation(() => mockUser);
      await signup(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('Email Validation', () => {
    test('should return 400 for email without @', async () => {
      req.body = { fullName: 'John Doe', email: 'invalidemail.com', password: 'password123' };
      await signup(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email format' });
    });

    test('should return 400 for email without domain', async () => {
      req.body = { fullName: 'John Doe', email: 'test@', password: 'password123' };
      await signup(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should return 400 for email with spaces', async () => {
      req.body = { fullName: 'John Doe', email: 'test @example.com', password: 'password123' };
      await signup(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should accept valid email with subdomain', async () => {
      req.body = { fullName: 'John Doe', email: 'test@mail.example.com', password: 'password123' };
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedPassword');
      const mockUser = {
        _id: 'userId123',
        fullName: 'John Doe',
        email: 'test@mail.example.com',
        password: 'hashedPassword',
        save: jest.fn().mockResolvedValue(true),
      };
      User.mockImplementation(() => mockUser);
      await signup(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('should accept email with plus sign', async () => {
      req.body = { fullName: 'John Doe', email: 'test+tag@example.com', password: 'password123' };
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedPassword');
      const mockUser = {
        _id: 'userId123',
        fullName: 'John Doe',
        email: 'test+tag@example.com',
        password: 'hashedPassword',
        save: jest.fn().mockResolvedValue(true),
      };
      User.mockImplementation(() => mockUser);
      await signup(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('User Existence Check', () => {
    test('should return 400 when user already exists', async () => {
      req.body = { fullName: 'John Doe', email: 'existing@example.com', password: 'password123' };
      User.findOne.mockResolvedValue({ _id: 'existingUserId', email: 'existing@example.com' });
      await signup(req, res);
      expect(User.findOne).toHaveBeenCalledWith({ email: 'existing@example.com' });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
    });

    test('should proceed when user does not exist', async () => {
      req.body = { fullName: 'John Doe', email: 'new@example.com', password: 'password123' };
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedPassword');
      const mockUser = {
        _id: 'userId123',
        fullName: 'John Doe',
        email: 'new@example.com',
        password: 'hashedPassword',
        save: jest.fn().mockResolvedValue(true),
      };
      User.mockImplementation(() => mockUser);
      await signup(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('Password Hashing', () => {
    test('should hash password with bcrypt', async () => {
      req.body = { fullName: 'John Doe', email: 'test@example.com', password: 'password123' };
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('mockSalt');
      bcrypt.hash.mockResolvedValue('hashedPassword123');
      const mockUser = {
        _id: 'userId123',
        fullName: 'John Doe',
        email: 'test@example.com',
        password: 'hashedPassword123',
        save: jest.fn().mockResolvedValue(true),
      };
      User.mockImplementation(() => mockUser);
      await signup(req, res);
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'mockSalt');
    });

    test('should use salt rounds of 10', async () => {
      req.body = { fullName: 'John Doe', email: 'test@example.com', password: 'securePassword' };
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashed');
      const mockUser = {
        _id: 'userId123',
        fullName: 'John Doe',
        email: 'test@example.com',
        password: 'hashed',
        save: jest.fn().mockResolvedValue(true),
      };
      User.mockImplementation(() => mockUser);
      await signup(req, res);
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    });
  });

  describe('User Creation Success', () => {
    test('should create user and return 201 status', async () => {
      req.body = { fullName: 'John Doe', email: 'john@example.com', password: 'password123' };
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedPassword');
      const mockUser = {
        _id: 'userId123',
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        profilePic: undefined,
        save: jest.fn().mockResolvedValue(true),
      };
      User.mockImplementation(() => mockUser);
      await signup(req, res);
      expect(mockUser.save).toHaveBeenCalled();
      expect(generateToken).toHaveBeenCalledWith('userId123', res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        _id: 'userId123',
        fullName: 'John Doe',
        email: 'john@example.com',
        profilePic: undefined,
      });
    });

    test('should not include password in response', async () => {
      req.body = { fullName: 'John Doe', email: 'john@example.com', password: 'password123' };
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedPassword');
      const mockUser = {
        _id: 'userId123',
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        save: jest.fn().mockResolvedValue(true),
      };
      User.mockImplementation(() => mockUser);
      await signup(req, res);
      const responseCall = res.json.mock.calls[0][0];
      expect(responseCall).not.toHaveProperty('password');
    });

    test('should handle special characters in name', async () => {
      req.body = { fullName: "John O'Brien-Smith", email: 'test@example.com', password: 'password123' };
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedPassword');
      const mockUser = {
        _id: 'userId123',
        fullName: "John O'Brien-Smith",
        email: 'test@example.com',
        password: 'hashedPassword',
        save: jest.fn().mockResolvedValue(true),
      };
      User.mockImplementation(() => mockUser);
      await signup(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('should handle unicode characters in fullName', async () => {
      req.body = { fullName: '李明', email: 'test@example.com', password: 'password123' };
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedPassword');
      const mockUser = {
        _id: 'userId123',
        fullName: '李明',
        email: 'test@example.com',
        password: 'hashedPassword',
        save: jest.fn().mockResolvedValue(true),
      };
      User.mockImplementation(() => mockUser);
      await signup(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('Error Handling', () => {
    test('should return 500 when database query fails', async () => {
      req.body = { fullName: 'John Doe', email: 'test@example.com', password: 'password123' };
      User.findOne.mockRejectedValue(new Error('Database connection failed'));
      await signup(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });

    test('should return 500 when bcrypt.hash fails', async () => {
      req.body = { fullName: 'John Doe', email: 'test@example.com', password: 'password123' };
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockRejectedValue(new Error('Hash error'));
      await signup(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });

    test('should return 500 when user.save() fails', async () => {
      req.body = { fullName: 'John Doe', email: 'test@example.com', password: 'password123' };
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedPassword');
      const mockUser = {
        _id: 'userId123',
        fullName: 'John Doe',
        email: 'test@example.com',
        password: 'hashedPassword',
        save: jest.fn().mockRejectedValue(new Error('Save failed')),
      };
      User.mockImplementation(() => mockUser);
      await signup(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });

    test('should handle duplicate key errors', async () => {
      req.body = { fullName: 'John Doe', email: 'test@example.com', password: 'password123' };
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedPassword');
      const duplicateError = new Error('Duplicate key error');
      duplicateError.code = 11000;
      const mockUser = {
        _id: 'userId123',
        fullName: 'John Doe',
        email: 'test@example.com',
        password: 'hashedPassword',
        save: jest.fn().mockRejectedValue(duplicateError),
      };
      User.mockImplementation(() => mockUser);
      await signup(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});