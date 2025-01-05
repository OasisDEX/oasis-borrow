import type { UserJwtPayload } from 'handlers/signature-auth/signin'
import jwt from 'jsonwebtoken'
import type { NextApiRequest, NextApiResponse } from 'next'
import { config } from 'server/config'
import * as z from 'zod'

export function verifyAccessToken(token: string): UserJwtPayload | null {
  try {
    return jwt.verify(token, config.userJWTSecret) as UserJwtPayload
  } catch (error) {
    return null
  }
}

const paramsSchema = z.object({
  walletAddress: z.string(),
})

export default function checkAuthHandler(req: NextApiRequest, res: NextApiResponse) {
  const { walletAddress } = paramsSchema.parse(req.query)

  const token = req.cookies[`token-${walletAddress.toLowerCase()}`]

  if (!token) {
    return res.status(401).json({ authenticated: false })
  }

  const decoded = verifyAccessToken(token)

  if (!decoded) {
    return res.status(401).json({ authenticated: false })
  }

  if (decoded.address.toLowerCase() !== walletAddress.toLowerCase()) {
    return res.status(401).json({ authenticated: false })
  }

  return res.status(200).json({ authenticated: true })
}
