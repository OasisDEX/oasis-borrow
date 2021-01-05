import { Request } from 'express'
import { assert } from 'ts-essentials'

import { UserJwtPayload } from './signin'

export function getUserFromRequest(req: Request): UserJwtPayload {
  const user = (req as any).user as UserJwtPayload

  assert(user, 'User not defined on request. Did you forget to attach jwt validation middleware?')

  return user
}
