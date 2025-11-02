import bcrypt from 'bcryptjs';
import { signup } from '../../controllers/auth.controller.js';
import User from '../../models/User.js';
import { generateToken } from '../../lib/utils.js';

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('../../models/User.js');
jest.mock('../../lib/utils.js');

describe('Auth Controller - signup', () => {
  let req, res, mockUser;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup request object
    req = {
      body: {
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123'
      }
    };

    // Setup response object with chainable methods
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Mock user object
    mockUser = {
      _id: 'user123',
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      password: 'hashedPassword123',
      profilePic: undefined,
      save: jest.fn().mockResolvedValue(true)
    };
  });

  describe('Happy Path - Successful Signup', () => {
    it('should successfully create a new user with valid data', async () => {
      // Arrange
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt123');
      bcrypt.hash.mockResolvedValue('hashedPassword123');
      User.mockImplementation(() => mockUser);
      generateToken.mockImplementation(() => {});

      // Act
      await signup(req, res);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'john.doe@example.com' });
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt123');
      expect(generateToken).toHaveBeenCalledWith('user123', res);
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        _id: 'user123',
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        profilePic: undefined
      });
    });

    it('should hash password with bcrypt using salt rounds of 10', async () => {
      // Arrange
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('randomSalt');
      bcrypt.hash.mockResolvedValue('hashedPass');
      User.mockImplementation(() => mockUser);

      // Act
      await signup(req, res);

      // Assert
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'randomSalt');
    });

    it('should call generateToken before saving user', async () => {
      // Arrange
      const callOrder = [];
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashed');
      User.mockImplementation(() => mockUser);
      generateToken.mockImplementation(() => callOrder.push('generateToken'));
      mockUser.save.mockImplementation(() => {
        callOrder.push('save');
        return Promise.resolve();
      });

      // Act
      await signup(req, res);

      // Assert
      expect(callOrder).toEqual(['generateToken', 'save']);
    });
  });

  describe('Validation - Missing Fields', () => {
    it('should return 400 error when fullName is missing', async () => {
      // Arrange
      req.body.fullName = '';

      // Act
      await signup(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'All fields are required' 
      });
      expect(User.findOne).not.toHaveBeenCalled();
    });

    it('should return 400 error when email is missing', async () => {
      // Arrange
      req.body.email = '';

      // Act
      await signup(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'All fields are required' 
      });
    });

    it('should return 400 error when password is missing', async () => {
      // Arrange
      req.body.password = '';

      // Act
      await signup(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'All fields are required' 
      });
    });

    it('should return 400 error when all fields are missing', async () => {
      // Arrange
      req.body = {};

      // Act
      await signup(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'All fields are required' 
      });
    });

    it('should return 400 error when fullName is null', async () => {
      // Arrange
      req.body.fullName = null;

      // Act
      await signup(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'All fields are required' 
      });
    });

    it('should return 400 error when fullName is undefined', async () => {
      // Arrange
      req.body.fullName = undefined;

      // Act
      await signup(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'All fields are required' 
      });
    });
  });

  describe('Validation - Password Length', () => {
    it('should return 400 error when password is less than 6 characters', async () => {
      // Arrange
      req.body.password = '12345';

      // Act
      await signup(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Password must be at least 6 characters long' 
      });
    });

    it('should return 400 error when password is exactly 5 characters', async () => {
      // Arrange
      req.body.password = 'pass5';

      // Act
      await signup(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Password must be at least 6 characters long' 
      });
    });

    it('should accept password with exactly 6 characters', async () => {
      // Arrange
      req.body.password = 'pass12';
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashed');
      User.mockImplementation(() => mockUser);

      // Act
      await signup(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should accept password with more than 6 characters', async () => {
      // Arrange
      req.body.password = 'password123456';
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashed');
      User.mockImplementation(() => mockUser);

      // Act
      await signup(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should return 400 error when password is an empty string', async () => {
      // Arrange
      req.body.password = '';

      // Act
      await signup(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'All fields are required' 
      });
    });
  });

  describe('Validation - Email Format', () => {
    it('should return 400 error for invalid email format without @', async () => {
      // Arrange
      req.body.email = 'invalidemail.com';

      // Act
      await signup(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Invalid email format' 
      });
    });

    it('should return 400 error for invalid email format without domain', async () => {
      // Arrange
      req.body.email = 'user@';

      // Act
      await signup(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Invalid email format' 
      });
    });

    it('should return 400 error for invalid email format without TLD', async () => {
      // Arrange
      req.body.email = 'user@domain';

      // Act
      await signup(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Invalid email format' 
      });
    });

    it('should return 400 error for email with spaces', async () => {
      // Arrange
      req.body.email = 'user name@example.com';

      // Act
      await signup(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Invalid email format' 
      });
    });

    it('should return 400 error for email with multiple @ symbols', async () => {
      // Arrange
      req.body.email = 'user@@example.com';

      // Act
      await signup(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Invalid email format' 
      });
    });

    it('should accept valid email with subdomain', async () => {
      // Arrange
      req.body.email = 'user@subdomain.example.com';
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashed');
      User.mockImplementation(() => mockUser);

      // Act
      await signup(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should accept valid email with special characters', async () => {
      // Arrange
      req.body.email = 'user.name+tag@example.co.uk';
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashed');
      User.mockImplementation(() => mockUser);

      // Act
      await signup(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should accept valid email with numbers', async () => {
      // Arrange
      req.body.email = 'user123@example123.com';
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashed');
      User.mockImplementation(() => mockUser);

      // Act
      await signup(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('Business Logic - User Existence Check', () => {
    it('should return 400 error when user already exists', async () => {
      // Arrange
      const existingUser = {
        _id: 'existing123',
        email: 'john.doe@example.com'
      };
      User.findOne.mockResolvedValue(existingUser);

      // Act
      await signup(req, res);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ 
        email: 'john.doe@example.com' 
      });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'User already exists' 
      });
      expect(bcrypt.genSalt).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('should check user existence with exact email match', async () => {
      // Arrange
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashed');
      User.mockImplementation(() => mockUser);

      // Act
      await signup(req, res);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ 
        email: 'john.doe@example.com' 
      });
    });

    it('should not proceed with registration when user exists', async () => {
      // Arrange
      User.findOne.mockResolvedValue({ email: 'john.doe@example.com' });

      // Act
      await signup(req, res);

      // Assert
      expect(bcrypt.genSalt).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(generateToken).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should return 500 error when database query fails', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      User.findOne.mockRejectedValue(dbError);

      // Act
      await signup(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Internal server error' 
      });
    });

    it('should return 500 error when bcrypt.genSalt fails', async () => {
      // Arrange
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockRejectedValue(new Error('Salt generation failed'));

      // Act
      await signup(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Internal server error' 
      });
    });

    it('should return 500 error when bcrypt.hash fails', async () => {
      // Arrange
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockRejectedValue(new Error('Hashing failed'));

      // Act
      await signup(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Internal server error' 
      });
    });

    it('should return 500 error when user.save fails', async () => {
      // Arrange
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashed');
      mockUser.save.mockRejectedValue(new Error('Save failed'));
      User.mockImplementation(() => mockUser);

      // Act
      await signup(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Internal server error' 
      });
    });

    it('should handle unexpected errors gracefully', async () => {
      // Arrange
      User.findOne.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      // Act
      await signup(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Internal server error' 
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long passwords', async () => {
      // Arrange
      req.body.password = 'a'.repeat(1000);
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashed');
      User.mockImplementation(() => mockUser);

      // Act
      await signup(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(bcrypt.hash).toHaveBeenCalledWith('a'.repeat(1000), 'salt');
    });

    it('should handle very long email addresses', async () => {
      // Arrange
      const longEmail = 'a'.repeat(50) + '@example.com';
      req.body.email = longEmail;
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashed');
      User.mockImplementation(() => mockUser);

      // Act
      await signup(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should handle special characters in fullName', async () => {
      // Arrange
      req.body.fullName = "John O'Brien-Smith";
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashed');
      User.mockImplementation(() => mockUser);

      // Act
      await signup(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should handle unicode characters in fullName', async () => {
      // Arrange
      req.body.fullName = '李明';
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashed');
      User.mockImplementation(() => mockUser);

      // Act
      await signup(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should handle password with special characters', async () => {
      // Arrange
      req.body.password = 'P@ssw0rd!#$%';
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashed');
      User.mockImplementation(() => mockUser);

      // Act
      await signup(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(bcrypt.hash).toHaveBeenCalledWith('P@ssw0rd!#$%', 'salt');
    });

    it('should not trim whitespace from password', async () => {
      // Arrange
      req.body.password = '  pass  ';
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashed');
      User.mockImplementation(() => mockUser);

      // Act
      await signup(req, res);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith('  pass  ', 'salt');
    });

    it('should handle case-sensitive emails', async () => {
      // Arrange
      req.body.email = 'John.Doe@Example.COM';
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashed');
      User.mockImplementation(() => mockUser);

      // Act
      await signup(req, res);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ 
        email: 'John.Doe@Example.COM' 
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('Response Format', () => {
    it('should not include password in response', async () => {
      // Arrange
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashed');
      User.mockImplementation(() => mockUser);

      // Act
      await signup(req, res);

      // Assert
      const responseData = res.json.mock.calls[0][0];
      expect(responseData).not.toHaveProperty('password');
    });

    it('should include _id, fullName, email, and profilePic in response', async () => {
      // Arrange
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashed');
      User.mockImplementation(() => mockUser);

      // Act
      await signup(req, res);

      // Assert
      const responseData = res.json.mock.calls[0][0];
      expect(responseData).toHaveProperty('_id');
      expect(responseData).toHaveProperty('fullName');
      expect(responseData).toHaveProperty('email');
      expect(responseData).toHaveProperty('profilePic');
    });

    it('should return 201 status code on successful creation', async () => {
      // Arrange
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashed');
      User.mockImplementation(() => mockUser);

      // Act
      await signup(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('Integration with Dependencies', () => {
    it('should pass correct userId to generateToken', async () => {
      // Arrange
      const testUserId = 'test-user-id-123';
      mockUser._id = testUserId;
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashed');
      User.mockImplementation(() => mockUser);

      // Act
      await signup(req, res);

      // Assert
      expect(generateToken).toHaveBeenCalledWith(testUserId, res);
    });

    it('should create User instance with correct parameters', async () => {
      // Arrange
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt123');
      bcrypt.hash.mockResolvedValue('hashedPassword123');
      User.mockImplementation(() => mockUser);

      // Act
      await signup(req, res);

      // Assert
      expect(User).toHaveBeenCalledWith({
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        password: 'hashedPassword123'
      });
    });
  });
});