import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { assert } from 'ts-essentials'

import { DB } from './testCtx'

export async function executeSQL(db: DB, sql: string): Promise<void> {
  await db.any(sql)
}

export function loadSQL(name: string): string {
  const path = join(__dirname, '../db/sql', name)

  assert(existsSync(path), `SQL ${name} doesn't exist!`)

  return readFileSync(path, 'utf8')
}
