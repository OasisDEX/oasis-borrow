import { OnrampOrder } from '@prisma/client'
import { LatamexUser } from '@prisma/client'
import { OrderStatus } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'server/prisma'
import { v4 as uuidv4 } from 'uuid'
import * as z from 'zod'

const crypto = require('crypto')
const RSA = require('node-rsa')

const algorithm = 'aes-256-ecb'

const bodySchema = z.object({
  email: z.string(),
  country: z.union([z.literal('AR'), z.literal('BR'), z.literal('MX')]),
  originCurrency: z.union([z.literal('ARS'), z.literal('BRL'), z.literal('MXN')]),
  originAmount: z.string(),
  destCurrency: z.string(),
  destAmount: z.string(),
  feeAmount: z.string(),
  recipient: z.string().refine((val) => /^0x[0-9a-f]{40}$/i.test(val), 'Invalid Ethereum address'),
})

function encrypt(text: string, keyBase64: string, ivBase64 = '') {
  const key = Buffer.from(keyBase64, 'base64')

  const cipher = crypto.createCipheriv(algorithm, key, ivBase64)
  let encrypted = cipher.update('' + text, 'utf-8', 'base64')
  encrypted += cipher.final('base64')
  return encrypted
}

function encryptPayload(payload: any) {
  const settlePrivateKey = new RSA(process.env.LATAMEX_ENCRYPTION_PRIVATE_KEY)
  const AESKey = 'Vfs7yNI5SiUmG9dBSbXiWyiLax1GKI1Uo9hYJMumoRQ='
  const encryptedAESKey = settlePrivateKey.encryptPrivate(AESKey, 'base64')

  const transactionSign = {
    consumerUserEmail: payload.consumerUserEmail,
    consumerUserId: payload.consumerUserId,
    destinationWalletAddress: payload.destinationWalletAddress,
    checkoutAmount: payload.checkoutAmount,
    feeAmount: payload.feeAmount,
    destinationWalletAddressTag: '',
  }

  return {
    ...payload,
    consumerUserEmail: encrypt(payload.consumerUserEmail, AESKey),
    consumerUserId: encrypt(payload.consumerUserId, AESKey),
    destinationWalletAddress: encrypt(payload.destinationWalletAddress, AESKey),
    checkoutAmount: encrypt(payload.checkoutAmount, AESKey),
    feeAmount: encrypt(payload.feeAmount, AESKey),
    destinationWalletAddressTag: '',
    transactionSign: encrypt(JSON.stringify(transactionSign), AESKey),
    kk: encryptedAESKey,
  }
}

export default async function (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(404).end()

  const latamexOnrampId = 3
  const fields = bodySchema.parse(req.body)
  const {
    country,
    email,
    recipient,
    originAmount,
    originCurrency,
    destCurrency,
    destAmount,
    feeAmount,
  } = fields

  let user: LatamexUser | null = await prisma.latamexUser.findOne({ where: { email } })

  if (!user) {
    const userUuid = uuidv4()
    user = await prisma.latamexUser.upsert({
      where: { email },
      update: { email },
      create: { email, country, uuid: userUuid },
    })
  }

  const orderUuid = uuidv4()
  const newOrder: OnrampOrder = await prisma.onrampOrder.create({
    data: {
      recipient: recipient.toLowerCase(),
      onramp_provider: { connect: { id: latamexOnrampId } },
      account_ref: 'LM',
      order_ref: orderUuid,
      order_status: OrderStatus.initialised,
      source_amount: parseFloat(originAmount),
      source_currency: originCurrency,
      dest_currency: destCurrency,
      dest_amount: parseFloat(destAmount),
      network: 'mainnet',
    },
  })

  if (newOrder.order_ref && user.uuid) {
    const encryptedPayload = encryptPayload({
      consumerUserEmail: email,
      consumerUserId: user.uuid,
      destinationWalletAddress: recipient,
      checkoutAmount: parseFloat(originAmount),
      feeAmount: parseFloat(feeAmount),
    })

    return res.status(201).json({ ...encryptedPayload, transactionRef: orderUuid })
  }

  return res.status(404).end()
}

export const config = { api: { bodyParser: false } }
