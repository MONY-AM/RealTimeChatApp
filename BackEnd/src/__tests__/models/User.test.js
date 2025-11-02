import mongoose from 'mongoose';
import User from '../../models/User.js';

describe('User Model', () => {
  describe('Schema Definition', () => {
    it('should have fullName field with correct properties', () => {
      const fullNamePath = User.schema.path('fullName');
      
      expect(fullNamePath).toBeDefined();
      expect(fullNamePath.instance).toBe('String');
      expect(fullNamePath.isRequired).toBe(true);
    });

    it('should have email field with correct properties', () => {
      const emailPath = User.schema.path('email');
      
      expect(emailPath).toBeDefined();
      expect(emailPath.instance).toBe('String');
      expect(emailPath.isRequired).toBe(true);
    });

    it('should have password field with correct properties', () => {
      const passwordPath = User.schema.path('password');
      
      expect(passwordPath).toBeDefined();
      expect(passwordPath.instance).toBe('String');
      expect(passwordPath.isRequired).toBe(true);
    });

    it('should have email field with unique constraint', () => {
      const emailPath = User.schema.path('email');
      
      expect(emailPath.options.unique).toBe(true);
    });

    it('should have email field with regex validation', () => {
      const emailPath = User.schema.path('email');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailPath.options.match).toEqual(emailRegex);
    });

    it('should have timestamps enabled', () => {
      expect(User.schema.options.timestamps).toBe(true);
    });
  });

  describe('Schema Validation - Email', () => {
    it('should validate correct email format', () => {
      const emailPath = User.schema.path('email');
      const validEmails = [
        'user@example.com',
        'test.user@domain.co.uk',
        'name+tag@subdomain.example.com',
        'user123@test123.com'
      ];

      validEmails.forEach(email => {
        expect(emailPath.options.match.test(email)).toBe(true);
      });
    });

    it('should reject invalid email formats', () => {
      const emailPath = User.schema.path('email');
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user name@example.com',
        'user@@example.com',
        'user@domain',
        ''
      ];

      invalidEmails.forEach(email => {
        expect(emailPath.options.match.test(email)).toBe(false);
      });
    });

    it('should have email regex that matches the controller validation', () => {
      const emailPath = User.schema.path('email');
      const controllerRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailPath.options.match.toString()).toBe(controllerRegex.toString());
    });
  });

  describe('Model Properties', () => {
    it('should be a Mongoose model', () => {
      expect(User).toBeInstanceOf(Function);
      expect(User.modelName).toBe('User');
    });

    it('should have correct model name', () => {
      expect(User.modelName).toBe('User');
    });

    it('should have a schema', () => {
      expect(User.schema).toBeDefined();
      expect(User.schema).toBeInstanceOf(mongoose.Schema);
    });
  });

  describe('Field Constraints', () => {
    it('should have min constraint of 2 for fullName', () => {
      const fullNamePath = User.schema.path('fullName');
      expect(fullNamePath.options.min).toBe(2);
    });

    it('should have max constraint of 50 for fullName', () => {
      const fullNamePath = User.schema.path('fullName');
      expect(fullNamePath.options.max).toBe(50);
    });

    it('should have min constraint of 6 for password', () => {
      const passwordPath = User.schema.path('password');
      expect(passwordPath.options.min).toBe(6);
    });
  });

  describe('Schema Structure', () => {
    it('should have exactly 3 defined paths (excluding timestamps)', () => {
      const paths = User.schema.paths;
      const definedPaths = Object.keys(paths).filter(
        key => !['_id', '__v', 'createdAt', 'updatedAt'].includes(key)
      );
      
      expect(definedPaths).toEqual(['fullName', 'email', 'password']);
    });

    it('should not have profilePic field defined (it is commented out)', () => {
      const profilePicPath = User.schema.path('profilePic');
      expect(profilePicPath).toBeUndefined();
    });

    it('should have timestamps fields when document is created', () => {
      // Note: This tests the schema configuration, not actual document creation
      expect(User.schema.options.timestamps).toBe(true);
      expect(User.schema.path('createdAt')).toBeDefined();
      expect(User.schema.path('updatedAt')).toBeDefined();
    });
  });

  describe('Required Fields', () => {
    it('should have all three fields as required', () => {
      const fullNamePath = User.schema.path('fullName');
      const emailPath = User.schema.path('email');
      const passwordPath = User.schema.path('password');
      
      expect(fullNamePath.isRequired).toBe(true);
      expect(emailPath.isRequired).toBe(true);
      expect(passwordPath.isRequired).toBe(true);
    });
  });

  describe('Data Types', () => {
    it('should have String type for fullName', () => {
      const fullNamePath = User.schema.path('fullName');
      expect(fullNamePath.instance).toBe('String');
    });

    it('should have String type for email', () => {
      const emailPath = User.schema.path('email');
      expect(emailPath.instance).toBe('String');
    });

    it('should have String type for password', () => {
      const passwordPath = User.schema.path('password');
      expect(passwordPath.instance).toBe('String');
    });

    it('should have Date type for createdAt (from timestamps)', () => {
      const createdAtPath = User.schema.path('createdAt');
      expect(createdAtPath.instance).toBe('Date');
    });

    it('should have Date type for updatedAt (from timestamps)', () => {
      const updatedAtPath = User.schema.path('updatedAt');
      expect(updatedAtPath.instance).toBe('Date');
    });
  });

  describe('Schema Options', () => {
    it('should have timestamps option set to true', () => {
      expect(User.schema.options.timestamps).toBe(true);
    });

    it('should have proper versionKey configuration', () => {
      // Default versionKey is '__v'
      expect(User.schema.options.versionKey).toBeUndefined();
      expect(User.schema.path('__v')).toBeDefined();
    });
  });

  describe('Email Regex Edge Cases', () => {
    it('should reject email with leading space', () => {
      const emailPath = User.schema.path('email');
      expect(emailPath.options.match.test(' user@example.com')).toBe(false);
    });

    it('should reject email with trailing space', () => {
      const emailPath = User.schema.path('email');
      expect(emailPath.options.match.test('user@example.com ')).toBe(false);
    });

    it('should reject email with space in middle', () => {
      const emailPath = User.schema.path('email');
      expect(emailPath.options.match.test('user @example.com')).toBe(false);
    });

    it('should accept email with dots in local part', () => {
      const emailPath = User.schema.path('email');
      expect(emailPath.options.match.test('user.name@example.com')).toBe(true);
    });

    it('should accept email with plus sign', () => {
      const emailPath = User.schema.path('email');
      expect(emailPath.options.match.test('user+tag@example.com')).toBe(true);
    });

    it('should accept email with hyphen in domain', () => {
      const emailPath = User.schema.path('email');
      expect(emailPath.options.match.test('user@my-domain.com')).toBe(true);
    });

    it('should accept email with numbers', () => {
      const emailPath = User.schema.path('email');
      expect(emailPath.options.match.test('user123@example123.com')).toBe(true);
    });

    it('should accept email with subdomain', () => {
      const emailPath = User.schema.path('email');
      expect(emailPath.options.match.test('user@mail.example.com')).toBe(true);
    });

    it('should accept email with long TLD', () => {
      const emailPath = User.schema.path('email');
      expect(emailPath.options.match.test('user@example.photography')).toBe(true);
    });
  });

  describe('Model Export', () => {
    it('should export a valid Mongoose model', () => {
      expect(typeof User).toBe('function');
      expect(User.prototype).toBeDefined();
    });

    it('should be the default export', () => {
      // This test verifies the model is exported as default
      expect(User).toBeDefined();
      expect(User.modelName).toBe('User');
    });
  });
});