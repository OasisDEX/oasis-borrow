import { recoverPersonalSignature } from '@metamask/eth-sig-util'
import { getBackendRpcUrl } from 'blockchain/networks'
import type { CookieSerializeOptions } from 'cookie'
import { serialize } from 'cookie'
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

    const rpcUrl = getBackendRpcUrl(body.chainId)
    const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl))
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
          // it might be a wallet connect + safe, no way to check
          // that during connect/sign so im checking that here
          if (!(await isValidSignature(web3, challenge.address, message, body.signature))) {
            throw new SignatureAuthError('Signature not correct - personal sign')
          }
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

    const commonPayload: CookieSerializeOptions = {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24 * 365 * 2, // 2 years
      sameSite: 'none',
      path: '/',
    }

    res.setHeader('Set-Cookie', [
      serialize(`token-${challenge.address.toLowerCase()}`, token, {
        ...commonPayload,
      }),
      ...(isGnosisSafe
        ? [
            serialize(`token-${challenge.address.toLowerCase()}`, token, {
              ...commonPayload,
              domain: '.safe.global',
            }),
          ]
        : []),
    ])

    res.status(200).json({ jwt: token })
  }
}

export function recreateSignedMessage(challenge: ChallengeJWT): string {
  // This function needs to be in sync with frontend getDataToSignFromChallenge() function
  return `Sign to verify your wallet ${challenge.address} (${challenge.randomChallenge})`
}
