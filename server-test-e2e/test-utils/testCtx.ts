import { PrismaClient } from '@prisma/client'
import express from 'express'
import fs from 'fs'
import { join } from 'path'
import pgPromise from 'pg-promise'
import { migrate } from 'postgres-migrations'
import { Config } from 'server/config'
import { prisma } from 'server/prisma'
import { assert } from 'ts-essentials'

import { setupServer } from './setupServer'

export type DB = pgPromise.IDatabase<{}>

export interface TestCtx {
  db: DB
  prisma: PrismaClient
  app: express.Application
}

export async function setupTestCtx(customConfig?: Partial<Config>): Promise<TestCtx> {
  assert(process.env.DATABASE_URL, 'DATABASE_URL not set!')

  const db = createDB(process.env.DATABASE_URL)
  await cleanupDB(db)
  await migrateDB(db)
  await seedDB(db)

  const app = setupServer(customConfig)

  return { db, prisma, app }
}

export async function destroyTestCtx(ctx: TestCtx) {
  await cleanupDB(ctx.db)
  await ctx.db.$pool.end()
  await ctx.prisma.$disconnect()
}

export function createDB(connString: string): DB {
  const PgClient = pgPromise()
  const db = PgClient(connString)
  return db
}

export async function cleanupDB(db: DB): Promise<void> {
  await db.task(async (c) => {
    const schemasWrapped: { name: string }[] = await c.many(
      'SELECT schema_name as name FROM information_schema.schemata;',
    )
    const schemasToDelete = schemasWrapped
      .map((s) => s.name)
      .filter((n) => !n.startsWith('pg_') && n !== 'information_schema')

    await c.none(`
    DROP SCHEMA IF EXISTS ${schemasToDelete.join(',')} CASCADE;
    CREATE SCHEMA public;
    GRANT ALL ON SCHEMA public TO public;
    `)
  })
}

export async function migrateDB(db: DB): Promise<void> {
  await migrate({ client: db.$pool }, join(__dirname, '../../server/database/migrations'))
}

export async function seedDB(db: DB) {
  const seedSql = fs.readFileSync(join(__dirname, '../fixtures/db/seed.sql')).toString()
  await db.none(seedSql)
}
