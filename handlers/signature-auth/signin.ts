import { recoverPersonalSignature } from 'eth-sig-util'
import jwt from 'jsonwebtoken'
import { NextApiHandler } from 'next'
import Web3 from 'web3'
import * as z from 'zod'

import { isArgentWallet, isValidSignature } from './argent'
import { ChallengeJWT } from './challenge'

export interface signInOptions {
  challengeJWTSecret: string
  userJWTSecret: string
}

export interface UserJwtPayload {
  address: string
}

class SignatureAuthError {
  constructor(public readonly reason: string) {}
}

const inputSchema = z.object({
  challenge: z.string(),
  signature: z.string(),
})

export function makeSignIn(options: signInOptions): NextApiHandler {
  return async (req, res) => {
    const body = inputSchema.parse(req.body)

    let challenge: ChallengeJWT

    try {
      challenge = jwt.verify(body.challenge, options.challengeJWTSecret, {
        algorithms: ['HS512'],
      }) as any
    } catch (e) {
      throw new SignatureAuthError('Challenge not correct')
    }

    const infuraUrlBackend = `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID_BACKEND}`
    const web3 = new Web3(new Web3.providers.HttpProvider(infuraUrlBackend))
    const message = recreateSignedMessage(challenge)

    if (await isArgentWallet(web3, challenge.address)) {
      if (!(await isValidSignature(web3, challenge.address, message, body.signature))) {
        throw new SignatureAuthError('Signature not correct')
      }
    } else {
      const signedAddress = recoverPersonalSignature({ data: message, sig: body.signature })

      if (signedAddress.toLowerCase() !== challenge.address) {
        throw new SignatureAuthError('Signature not correct')
      }
    }

    const userJwtPayload: UserJwtPayload = { address: challenge.address }
    const token = jwt.sign(userJwtPayload, options.userJWTSecret, { algorithm: 'HS512' })

    res.status(200).json({ jwt: token })
  }
}

export function recreateSignedMessage(challenge: ChallengeJWT): string {
  // This function needs to be in sync with frontend getDataToSignFromChallenge() function
  return `Sign to verify your wallet ${challenge.address} (${challenge.randomChallenge})`
}
