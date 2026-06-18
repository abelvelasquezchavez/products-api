// Deterministic environment for the test run. Set before any application
// module (which validates env at import time) is loaded.
process.env.NODE_ENV = 'test';
process.env.PORT = '3000';
process.env.DATABASE_URL = 'mysql://test:test@localhost:3306/test_db';
process.env.JWT_SECRET = 'test-secret-key-used-only-during-vitest-runs';
process.env.JWT_EXPIRES_IN = '1h';
