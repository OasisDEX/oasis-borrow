import { OrderStatus } from '@prisma/client'
import moment from 'moment'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'server/prisma'
import * as z from 'zod'

const bodySchema = z.object({
  id: z.string(),
  returnUrl: z.string(),
  type: z.string().optional(),
  baseCurrencyId: z.string().optional(),
  currencyId: z.string().optional(),
  customerId: z.string().optional(),
  cardId: z.string().optional(),
  failureReason: z.union([z.string(), z.null()]),
  status: z.union([z.literal('pending'), z.literal('completed')]),
  walletAddress: z
    .string()
    .refine((val) => /^0x[0-9a-f]{40}$/i.test(val), 'Invalid Ethereum address'),
})

export default async function (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(404).end()

  const bodySchemaNonStrict = bodySchema.nonstrict()
  const fields = bodySchemaNonStrict.parse(req.body.data)

  const type = fields.returnUrl.includes('buy.moonpay.io') ? 'prod' : 'test'

  await prisma.moonpayWebhookRequestLog.create({
    data: {
      moonpay_order_id: fields.id,
      moonpay_order_status: fields.status,
      moonpay_base_currency_id: fields.baseCurrencyId,
      moonpay_currency_id: fields.currencyId,
      moonpay_customer_id: fields.customerId,
      moonpay_card_id: fields.cardId,
      moonpay_environment: type,
      moonpay_failed_reason: fields.failureReason,
      moonpay_type: fields.type,
    },
  })

  const network = {
    prod: 'mainnet',
    test: 'kovan',
  }[type]

  const status: any = {
    pending: OrderStatus.pending,
    completed: OrderStatus.complete,
  }[fields.status]

  const existingOrder = await prisma.onrampOrder.findOne({
    where: { order_ref: fields.id },
  })

  const destAmount = fields.quoteCurrencyAmount || 0

  if (existingOrder) {
    await prisma.onrampOrder.update({
      data: {
        order_status: status,
        order_message: fields.failedReason,
        updated: moment.utc().toDate(),
        dest_amount: destAmount,
      },
      where: {
        order_ref: fields.id,
      },
    })
  } else {
    await prisma.onrampOrder.create({
      data: {
        onramp_provider: { connect: { id: 2 } },
        order_ref: fields.id,
        account_ref: '',
        order_status: status,
        recipient: fields.walletAddress,
        source_amount: fields.baseCurrencyAmount,
        source_currency: fields.baseCurrency.code,
        dest_amount: destAmount,
        dest_currency: fields.currency.code,
        network,
      },
    })
  }

  res.status(201).end()
}

export const config = { api: { bodyParser: false } }
