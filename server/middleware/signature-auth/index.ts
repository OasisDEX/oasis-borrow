import { Handler, Router } from 'express'
import asyncHandler from 'express-async-handler'

import { makeChallenge } from './challenge'
import { makeSignIn } from './signin'

export interface JwtAuthMiddleware {
  challengeJWTSecret: string
  userJWTSecret: string
}

export function jwtAuthMiddleware(options: JwtAuthMiddleware): Handler {
  return Router()
    .post('/challenge', asyncHandler(makeChallenge(options)))
    .post('/signin', asyncHandler(makeSignIn(options)))
}
