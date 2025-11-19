// Test setup file
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_EXPIRE = '7d';
process.env.MONGODB_URI = 'mongodb://localhost:27017/lafactoria-test';

// Increase timeout for database operations
jest.setTimeout(10000);
