# Test Suite Documentation

## Overview
This test suite provides comprehensive coverage for the authentication and database functionality of the backend application.

## Test Structure

### Controllers Tests
- `controllers/auth.controller.test.js`: Tests for the signup controller
  - Happy path scenarios
  - Validation tests (missing fields, password length, email format)
  - Business logic tests (user existence checks)
  - Error handling
  - Edge cases
  - Response format validation

### Library Tests
- `lib/utils.test.js`: Tests for token generation utility
  - Token generation with JWT
  - Cookie configuration (httpOnly, sameSite, secure)
  - Environment-based security settings
  - Edge cases

- `lib/db.test.js`: Tests for database connection
  - Successful connection scenarios
  - Error handling and process exit behavior
  - Environment variable handling
  - Edge cases

### Model Tests
- `models/User.test.js`: Tests for User model schema
  - Schema definition validation
  - Field constraints
  - Email regex validation
  - Required fields
  - Data types

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with verbose output
npm run test:verbose
```

## Test Coverage Goals
- Controllers: 100% coverage of all functions and branches
- Utilities: 100% coverage including edge cases
- Models: Complete schema validation coverage
- Database: Full error path coverage

## Mocking Strategy
- External dependencies (bcryptjs, jsonwebtoken, mongoose) are mocked
- Process.exit is mocked to prevent test termination
- Console methods are mocked to keep test output clean

## Best Practices
- Each test is isolated and independent
- Descriptive test names follow the pattern: "should [expected behavior] when [condition]"
- Setup and teardown ensure clean state between tests
- Edge cases and error scenarios are thoroughly covered