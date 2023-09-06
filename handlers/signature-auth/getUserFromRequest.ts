import { UserJwtPayload } from 'handlers/signature-auth/signin'
import { NextApiRequest } from 'next'
import { assert } from 'ts-essentials'

export function getUserFromRequest(req: NextApiRequest): UserJwtPayload {
  const user = (req as any).auth as UserJwtPayload

  assert(user, 'User not defined on request. Did you forget to attach jwt validation middleware?')

  return user
}
