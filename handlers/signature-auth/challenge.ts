import { getRandomString } from 'helpers/getRandomString'
import jwt from 'jsonwebtoken'
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import * as z from 'zod'

export interface ChallengeJWT {
  randomChallenge: string
  address: string
}

const CHALLENGE_JWT_EXPIRATION = '5m' // 5 minutes should be more than enough to sign the challenge on a signer
const GNOSIS_SAFE_CHALLENGE_JWT_EXPIRATION = '1d'

const address = z
  .string()
  .refine(
    (a) => a.toLowerCase() === a && a.length === 42,
    'Address has to be lowercased and be 42 characters string',
  )

const inputSchema = z.object({
  address: address,
  isGnosisSafe: z.boolean(),
})

export function makeChallenge(options: { challengeJWTSecret: string }): NextApiHandler {
  return (req: NextApiRequest, res: NextApiResponse) => {
    const body = inputSchema.parse(req.body)

    const payload: ChallengeJWT = {
      address: body.address,
      randomChallenge: getRandomString(),
    }

    const challenge = jwt.sign(payload, options.challengeJWTSecret, {
      algorithm: 'HS512',
      expiresIn: body.isGnosisSafe
        ? GNOSIS_SAFE_CHALLENGE_JWT_EXPIRATION
        : CHALLENGE_JWT_EXPIRATION,
    })

    res.status(200).json({ challenge })
  }
}
