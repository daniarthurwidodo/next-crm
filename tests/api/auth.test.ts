import { describe, it, expect, beforeEach, vi } from 'vitest'

process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service_role_test_key'
process.env.JWT_SECRET = 'test_jwt_secret'

function mockListUsers() {
	return mockListUsers.fn.apply(this, arguments);
}
mockListUsers.fn = vi.fn();

function mockVerifyPassword() {
	return mockVerifyPassword.fn.apply(this, arguments);
}
mockVerifyPassword.fn = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
	createClient: () => ({
		auth: {
			admin: {
				listUsers: async () => mockListUsers(),
			},
		},
	}),
}))

vi.mock('../../lib/utils/auth', () => ({
	verifyPassword: mockVerifyPassword,
}))

vi.mock('jsonwebtoken', () => ({
	default: {
		sign: vi.fn(() => 'mocked.jwt.token'),
	},
	sign: vi.fn(() => 'mocked.jwt.token'),
}))

import { POST } from '../../app/api/login/route'

describe('/api/login', () => {
	beforeEach(() => resetMocks())

	it('logs in user and returns token', async () => {
		mockListUsers.fn.mockResolvedValue({ users: [{ user_metadata: { password_hash: 'hashed' } }], error: null })
		mockVerifyPassword.fn.mockResolvedValue(true)
		const req: Request = { json: async () => ({ username: 'anomali', password: 'secret' }) } as unknown as Request
		const res = await POST(req)
		expect(res.status).toBe(200)
		const body = await res.json()
		expect(body.success).toBe(true)
		expect(body.token).toBe('mocked.jwt.token')
	})

	it('returns 404 if user not found', async () => {
		mockListUsers.fn.mockResolvedValue({ users: [], error: null })
		const req: Request = { json: async () => ({ username: 'nouser', password: 'secret' }) } as unknown as Request
		const res = await POST(req)
		expect(res.status).toBe(404)
		const body = await res.json()
		expect(body.error).toMatch(/User not found/)
	})

	it('returns 401 if password invalid', async () => {
		mockListUsers.fn.mockResolvedValue({ users: [{ user_metadata: { password_hash: 'hashed' } }], error: null })
		mockVerifyPassword.fn.mockResolvedValue(false)
		const req: Request = { json: async () => ({ username: 'anomali', password: 'wrong' }) } as unknown as Request
		const res = await POST(req)
		expect(res.status).toBe(401)
		const body = await res.json()
		expect(body.error).toMatch(/Invalid password/)
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

	it('returns 500 if listUsers throws', async () => {
		mockListUsers.fn.mockImplementation(() => { throw new Error('Unexpected failure') })
		const req: Request = { json: async () => ({ username: 'anomali', password: 'secret' }) } as unknown as Request
		const res = await POST(req)
		expect(res.status).toBe(500)
		const body = await res.json()
		expect(body.error).toMatch(/Unexpected failure/)
	})

	it('returns 500 if error in user lookup', async () => {
		mockListUsers.fn.mockResolvedValue({ users: null, error: { message: 'User lookup failed' } })
		const req: Request = { json: async () => ({ username: 'anomali', password: 'secret' }) } as unknown as Request
		const res = await POST(req)
		expect(res.status).toBe(500)
		const body = await res.json()
		expect(body.error).toMatch(/User lookup failed/)
	})
})

function resetMocks() {
	mockListUsers.fn.mockReset()
	mockVerifyPassword.fn.mockReset()
}
// ...existing code...
