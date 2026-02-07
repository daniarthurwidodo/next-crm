import { describe, it, expect, beforeEach, vi } from 'vitest'

// Ensure env vars for service client
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service_role_test_key'
process.env.JWT_SECRET = 'test_jwt_secret'

const mockCreateUser = vi.fn()

// Mock @supabase/supabase-js so lib/supabase/service creates a test client
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      admin: {
        createUser: async () => mockCreateUser(),
      },
    },
  }),
}))

// Mock jsonwebtoken sign
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(() => 'mocked.jwt.token'),
  },
  sign: vi.fn(() => 'mocked.jwt.token'),
}))

import { POST } from '../../app/api/register/route'

describe('/api/register', () => {
  beforeEach(() => resetMocks())

  it('creates a user and returns a token', async () => {
    mockCreateUser.mockResolvedValue({ data: { user: { id: 'user_1' } }, error: null })
    const req: Request = { json: async () => ({ username: 'anomali', password: 'secret' }) } as unknown as Request
    const res = await POST(req)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.token).toBe('mocked.jwt.token')
  })

  it('returns 409 if username exists', async () => {
    mockCreateUser.mockResolvedValue({ data: null, error: { message: 'duplicate key value violates unique constraint' } })
    const req: Request = { json: async () => ({ username: 'exists', password: 'secret' }) } as unknown as Request
    const res = await POST(req)
    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body.error).toMatch(/Username already exists/)
  })

  it('returns 400 if missing username', async () => {
    const req: Request = { json: async () => ({ password: 'secret' }) } as unknown as Request
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/Missing username or password/)
  })

  it('returns 400 if missing password', async () => {
    const req: Request = { json: async () => ({ username: 'anomali' }) } as unknown as Request
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/Missing username or password/)
  })

  it('returns 500 if createUser throws', async () => {
    mockCreateUser.mockImplementation(() => { throw new Error('Unexpected failure') })
    const req: Request = { json: async () => ({ username: 'anomali', password: 'secret' }) } as unknown as Request
    const res = await POST(req)
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toMatch(/Unexpected failure/)
  })

  it('returns 500 for weak password', async () => {
    mockCreateUser.mockResolvedValue({ data: null, error: { message: 'Password is too weak' } })
    const req: Request = { json: async () => ({ username: 'anomali', password: '123' }) } as unknown as Request
    const res = await POST(req)
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toMatch(/Password is too weak/)
  })
})

function resetMocks() {
  mockCreateUser.mockReset()
}
