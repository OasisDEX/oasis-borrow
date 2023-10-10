import { recoverPersonalSignature } from '@metamask/eth-sig-util'
import { utils } from 'ethers'
import jwt from 'jsonwebtoken'
import type { NextApiHandler } from 'next'
import Web3 from 'web3'
import * as z from 'zod'

import { checkIfArgentWallet, isValidSignature } from './argent'
import type { ChallengeJWT } from './challenge'
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

    let isArgentWallet = false
    try {
      isArgentWallet = await checkIfArgentWallet(web3, challenge.address)
    } catch {
      console.error('Check if argent wallet failed')
    }

    if (body.isGnosisSafe) {
      try {
        const toHash = utils.defaultAbiCoder.encode(
          ['bytes32', 'uint256'],
          [
            await getMessageHash(web3, utils.hashMessage(message), challenge.address),
            7 /* signedMessages slot */,
          ],
        )
        const valueSlot = utils.keccak256(toHash).replace(/0x0/g, '0x')
        const slot = await web3.eth.getStorageAt(challenge.address, valueSlot as any)
        const [signed] = utils.defaultAbiCoder.decode(['uint256'], slot)

        if (!signed.eq(1)) {
          throw new SignatureAuthError('Signature not correct')
        }
      } catch (e) {
        return res.status(400).json({ error: (e as Error).message })
      }
    } else if (isArgentWallet) {
      if (!(await isValidSignature(web3, challenge.address, message, body.signature))) {
        throw new SignatureAuthError('Signature not correct')
      }
    } else {
      const signedAddress = recoverPersonalSignature({ data: message, signature: body.signature })
      if (signedAddress.toLowerCase() !== challenge.address) {
        const isOwner = await checkIfGnosisOwner(web3, challenge, signedAddress)

        if (!isOwner) {
          throw new SignatureAuthError('Signature not correct')
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

const GnosisSafeABI = [
  {
    name: 'domainSeparator',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
]

async function getMessageHash(web3: Web3, message: string, safe: string) {
  const SAFE_MSG_TYPESHASH = '0x60b3cbf8b4a223d68d641b3b6ddf9a298e7f33710cf3d3a9d1146b5a6150fbca'
  const safeMessageHash = utils.keccak256(
    utils.defaultAbiCoder.encode(
      ['bytes32', 'bytes32'],
      [SAFE_MSG_TYPESHASH, utils.keccak256(message)],
    ),
  )

  const contract = new web3.eth.Contract(GnosisSafeABI as any, safe)
  const domainSeparator = await contract.methods.domainSeparator().call()
  return utils.solidityKeccak256(
    ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
    [0x19, 0x01, domainSeparator, safeMessageHash],
  )
}

export function recreateSignedMessage(challenge: ChallengeJWT): string {
  // This function needs to be in sync with frontend getDataToSignFromChallenge() function
  return `Sign to verify your wallet ${challenge.address} (${challenge.randomChallenge})`
}
