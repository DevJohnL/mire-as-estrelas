import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

export async function runMigrations(): Promise<void> {
  const migrationsDir = path.join(__dirname, 'migrations')
  const files = fs.readdirSync(migrationsDir).sort()

  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      filename VARCHAR(255) PRIMARY KEY,
      ran_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  for (const file of files) {
    if (!file.endsWith('.sql')) continue

    const { rows } = await pool.query('SELECT 1 FROM _migrations WHERE filename = $1', [file])
    if (rows.length > 0) continue

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
    await pool.query(sql)
    await pool.query('INSERT INTO _migrations (filename) VALUES ($1)', [file])
    console.log(`Migration applied: ${file}`)
  }
}
