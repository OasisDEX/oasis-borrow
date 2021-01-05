import express from 'express'
import jwt from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'
import * as z from 'zod'

export interface ChallengeJWT {
  randomChallenge: string
  address: string
}

const CHALLENGE_JWT_EXPIRATION = '5m' // 5 minutes should be more than enough to sign the challenge on a signer

const address = z
  .string()
  .refine(
    (a) => a.toLowerCase() === a && a.length === 42,
    'Address has to be lowercased and be 42 characters string',
  )

const inputSchema = z.object({
  address: address,
})

export function makeChallenge(options: { challengeJWTSecret: string }): express.Handler {
  return (req, res) => {
    const body = inputSchema.parse(req.body)

    const payload: ChallengeJWT = {
      address: body.address,
      randomChallenge: uuid(),
    }

    const challenge = jwt.sign(payload, options.challengeJWTSecret, {
      algorithm: 'HS512',
      expiresIn: CHALLENGE_JWT_EXPIRATION,
    })

    res.status(200).json({ challenge })
  }
}
