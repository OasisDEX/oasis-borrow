import type { NextApiRequest } from 'next'
import { assert } from 'ts-essentials'

import type { UserJwtPayload } from './signin'

export function getUserFromRequest(req: NextApiRequest): UserJwtPayload {
  const user = (req as any).auth as UserJwtPayload

  assert(user, 'User not defined on request. Did you forget to attach jwt validation middleware?')

  return user
}
