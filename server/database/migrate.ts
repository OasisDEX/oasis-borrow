import dotenv from 'dotenv'
import { join } from 'path'
import pg from 'pg'
import { migrate } from 'postgres-migrations'
dotenv.config()

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not set!')
  }

  const dbConfig = {
    connectionString: process.env.DATABASE_URL,
  }
  const client = new pg.Client(dbConfig)
  await client.connect()
  console.info('Running migrations')
  await migrate({ client }, join(__dirname, '../database/migrations'))
  console.info('Migrations DONE')

  await client.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
