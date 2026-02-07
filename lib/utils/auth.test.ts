import { vi } from 'vitest';

// Ensure env vars for code that may read them at import-time
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY = 'test_anon_key';
process.env.JWT_SECRET = 'test_jwt_secret';

// Test-level mock functions
const mockSelect = vi.fn();
const mockInsert = vi.fn();

// Global mock for @supabase/supabase-js so auth.ts doesn't attempt real initialization
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: (_table: string) => ({
      select: (..._args: any[]) => ({
        eq: (..._a: any[]) => ({
          single: async () => mockSelect(),
        }),
      }),
      insert: async (..._args: any[]) => mockInsert(),
    }),
  }),
}));

import { describe, it, expect, beforeEach } from 'vitest';
import * as auth from './auth';

// Mock jsonwebtoken with both default and named exports
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(() => 'mocked.jwt.token'),
    verify: vi.fn(() => ({ username: 'testuser' })),
  },
  sign: vi.fn(() => 'mocked.jwt.token'),
  verify: vi.fn(() => ({ username: 'testuser' })),
}));

function resetMocks() {
  mockSelect.mockReset();
  mockInsert.mockReset();
}

describe('auth utils', () => {
  beforeEach(() => {
    resetMocks();
  });

  describe('registerUser', () => {
    it('registers a new user successfully', async () => {
      // Simulate user does not exist
      mockSelect.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
      // Simulate successful insert
      mockInsert.mockResolvedValue({ data: { id: 'user_id', username: 'testuser' }, error: null });

      const result = await auth.registerUser('testuser', 'password');
      expect(result.success).toBe(true);
      expect(result.token).toBe('mocked.jwt.token');
    });

    it('fails if user already exists', async () => {
      // Simulate user exists
      mockSelect.mockResolvedValue({ data: { id: 'user_id', username: 'testuser' }, error: null });
      // If insert is called unexpectedly, return an error
      mockInsert.mockResolvedValue({ data: null, error: { message: 'Should not insert' } });

      const result = await auth.registerUser('testuser', 'password');
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/Username already exists/);
    });
  });

  describe('loginUser', () => {
    it('logs in a user successfully', async () => {
      const hashed = await auth.hashPassword('password');
      mockSelect.mockResolvedValue({ data: { id: 'user_id', username: 'testuser', password: hashed }, error: null });

      const result = await auth.loginUser('testuser', 'password');
      expect(result.success).toBe(true);
      expect(result.token).toBe('mocked.jwt.token');
    });

    it('fails with wrong password', async () => {
      const hashed = await auth.hashPassword('other');
      mockSelect.mockResolvedValue({ data: { id: 'user_id', username: 'testuser', password: hashed }, error: null });

      const result = await auth.loginUser('testuser', 'password');
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/Invalid username or password/);
    });

    it('fails if user does not exist', async () => {
      mockSelect.mockResolvedValue({ data: null, error: null });

      const result = await auth.loginUser('nouser', 'password');
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/Invalid username or password/);
    });
  });
});
