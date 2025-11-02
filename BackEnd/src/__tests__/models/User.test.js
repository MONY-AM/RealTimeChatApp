import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import User from '../../models/User.js';

describe('User Model', () => {
  describe('Schema Definition', () => {
    test('should have correct model name', () => {
      expect(User.modelName).toBe('User');
    });

    test('should have fullName field', () => {
      const user = new User();
      expect(user.schema.paths).toHaveProperty('fullName');
    });

    test('should have email field', () => {
      const user = new User();
      expect(user.schema.paths).toHaveProperty('email');
    });

    test('should have password field', () => {
      const user = new User();
      expect(user.schema.paths).toHaveProperty('password');
    });

    test('should have timestamps enabled', () => {
      const user = new User();
      expect(user.schema.options.timestamps).toBe(true);
    });
  });

  describe('Field: fullName', () => {
    test('should be of type String', () => {
      const user = new User();
      expect(user.schema.paths.fullName.instance).toBe('String');
    });

    test('should be required', () => {
      const user = new User();
      expect(user.schema.paths.fullName.isRequired).toBe(true);
    });
  });

  describe('Field: email', () => {
    test('should be of type String', () => {
      const user = new User();
      expect(user.schema.paths.email.instance).toBe('String');
    });

    test('should be required', () => {
      const user = new User();
      expect(user.schema.paths.email.isRequired).toBe(true);
    });

    test('should be unique', () => {
      const user = new User();
      expect(user.schema.paths.email.options.unique).toBe(true);
    });

    test('should have email validation regex', () => {
      const user = new User();
      const emailRegex = user.schema.paths.email.options.match;
      expect(emailRegex).toBeDefined();
      expect(emailRegex).toBeInstanceOf(RegExp);
    });

    test('email regex should match valid emails', () => {
      const user = new User();
      const emailRegex = user.schema.paths.email.options.match;
      expect(emailRegex.test('test@example.com')).toBe(true);
      expect(emailRegex.test('user+tag@example.com')).toBe(true);
      expect(emailRegex.test('user@mail.example.com')).toBe(true);
    });

    test('email regex should reject invalid emails', () => {
      const user = new User();
      const emailRegex = user.schema.paths.email.options.match;
      expect(emailRegex.test('invalidemail.com')).toBe(false);
      expect(emailRegex.test('test@')).toBe(false);
      expect(emailRegex.test('test @example.com')).toBe(false);
    });
  });

  describe('Field: password', () => {
    test('should be of type String', () => {
      const user = new User();
      expect(user.schema.paths.password.instance).toBe('String');
    });

    test('should be required', () => {
      const user = new User();
      expect(user.schema.paths.password.isRequired).toBe(true);
    });
  });

  describe('Model Instantiation', () => {
    test('should create a new User instance', () => {
      const user = new User({
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword123',
      });
      expect(user).toBeInstanceOf(mongoose.Model);
      expect(user.fullName).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
      expect(user.password).toBe('hashedPassword123');
    });

    test('should generate _id automatically', () => {
      const user = new User({
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
      });
      expect(user._id).toBeDefined();
    });
  });

  describe('Validation', () => {
    test('should require fullName field', () => {
      const user = new User({ email: 'test@example.com', password: 'password123' });
      const error = user.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.fullName).toBeDefined();
    });

    test('should require email field', () => {
      const user = new User({ fullName: 'John Doe', password: 'password123' });
      const error = user.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
    });

    test('should require password field', () => {
      const user = new User({ fullName: 'John Doe', email: 'test@example.com' });
      const error = user.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.password).toBeDefined();
    });

    test('should validate email format', () => {
      const user = new User({ fullName: 'John Doe', email: 'invalid-email', password: 'password123' });
      const error = user.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
    });

    test('should accept valid user data', () => {
      const user = new User({ fullName: 'John Doe', email: 'test@example.com', password: '123456' });
      const error = user.validateSync();
      expect(error).toBeUndefined();
    });
  });

  describe('Special Cases', () => {
    test('should handle unicode characters in fullName', () => {
      const user = new User({ fullName: '李明', email: 'test@example.com', password: '123456' });
      const error = user.validateSync();
      expect(error).toBeUndefined();
    });

    test('should handle special characters in fullName', () => {
      const user = new User({ fullName: "O'Brien-Smith", email: 'test@example.com', password: '123456' });
      const error = user.validateSync();
      expect(error).toBeUndefined();
    });
  });
});