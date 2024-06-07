import { recoverPersonalSignature } from '@metamask/eth-sig-util'
import jwt from 'jsonwebtoken'
import type { NextApiHandler } from 'next'
import Web3 from 'web3'
import * as z from 'zod'

import { checkIfArgentWallet } from './argent'
import type { ChallengeJWT } from './challenge'
import { isValidSignature } from './eip1271'
import { checkIfGnosisOwner } from './gnosis'

export interface signInOptions {
  challengeJWTSecret: string
  userJWTSecret: string
}

export interface UserJwtPayload {
  address: string
  signature: string
  challenge: string
  chainId: number
}

class SignatureAuthError {
  constructor(public readonly reason: string) {}
}

const inputSchema = z.object({
  challenge: z.string(),
  signature: z.string(),
  chainId: z.number(),
  isGnosisSafe: z.boolean(),
})

const networkMap: Record<number, string> = {
  1: 'mainnet',
  5: 'goerli',
}

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

    const infuraUrlBackend = `https://${networkMap[body.chainId]}.infura.io/v3/${
      process.env.INFURA_PROJECT_ID_BACKEND
    }`
    const web3 = new Web3(new Web3.providers.HttpProvider(infuraUrlBackend))
    const message = recreateSignedMessage(challenge)

    const isGnosisSafe = body.isGnosisSafe
    let isArgentWallet = false
    try {
      isArgentWallet = await checkIfArgentWallet(web3, challenge.address)
    } catch {
      console.error('Check if argent wallet failed')
    }

    if (isGnosisSafe || isArgentWallet) {
      if (!(await isValidSignature(web3, challenge.address, message, body.signature))) {
        throw new SignatureAuthError('Signature not correct - eip1271')
      }
    } else {
      const signedAddress = recoverPersonalSignature({ data: message, signature: body.signature })
      if (signedAddress.toLowerCase() !== challenge.address) {
        const isOwner = await checkIfGnosisOwner(web3, challenge, signedAddress)

        if (!isOwner) {
          throw new SignatureAuthError('Signature not correct - personal sign')
        }
      }
    }

    const userJwtPayload: UserJwtPayload = {
      address: challenge.address,
      signature: body.signature,
      challenge: body.challenge,
      chainId: body.chainId,
    }
    const token = jwt.sign(userJwtPayload, options.userJWTSecret, { algorithm: 'HS512' })

    res.status(200).json({ jwt: token })
  }
}

export function recreateSignedMessage(challenge: ChallengeJWT): string {
  // This function needs to be in sync with frontend getDataToSignFromChallenge() function
  return `Sign to verify your wallet ${challenge.address} (${challenge.randomChallenge})`
}
