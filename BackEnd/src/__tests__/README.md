# Backend Unit Tests

This directory contains comprehensive unit tests for the backend application.

## Test Structure

- `controllers/` - Tests for API controllers
- `lib/` - Tests for utility libraries and database connections
- `models/` - Tests for Mongoose models
- `setup.js` - Global test configuration

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Coverage

The test suite covers:
- Input validation
- Authentication and authorization logic
- Password hashing and security
- Database connections
- Error handling
- Edge cases and boundary conditions

## Dependencies

Tests use Jest with ES modules support. Required packages:
- `jest` - Testing framework
- `@jest/globals` - Jest globals for ES modules

## Notes

- All tests use mocks to avoid external dependencies
- Tests are isolated and can run in any order
- Environment variables are set in `setup.js`