import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('Missing DATABASE_URL environment variable. Please add it to .env or .env.local')
  process.exit(2)
}

const pool = new Pool({ connectionString })

try {
  const res = await pool.query('SELECT NOW()')
  console.log('Connected — server time:', res.rows[0])
  await pool.end()
  process.exit(0)
} catch (err) {
  console.error('Connection failed:', err.message || err)
  process.exit(3)
}
