/* eslint-disable no-console */
import { join } from 'path'
import pg from 'pg'
import { migrate } from 'postgres-migrations'

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
require('dotenv-flow').config({ path: __dirname })

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not set!')
  }

  const dbConfig = {
    connectionString: process.env.DATABASE_URL,
  }
  const client = new pg.Client(dbConfig)

  await client.connect()
  console.log('Running migrations')
  await migrate({ client }, join(__dirname, '../database/migrations'))
  console.log('Migrations DONE')

  await client.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
