import { OrderStatus } from '@prisma/client'
import moment from 'moment'
import { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch'
import { prisma } from 'server/prisma'
import { assert } from 'ts-essentials'
import * as z from 'zod'

const querySchema = z.object({
  key: z.string(),
  type: z.union([z.literal('testwyre'), z.literal('sendwyre')]),
})
const bodySchema = z.object({
  accountId: z.string(),
  orderId: z.string(),
  orderStatus: z.union([z.literal('PROCESSING'), z.literal('COMPLETE'), z.literal('FAILED')]),
  referenceId: z.string().optional().nullable(),
  transferId: z.string().optional().nullable(),
  failedReason: z.string().optional().nullable(),
  reservation: z.string(),
  error: z.string().optional().nullable(),
})

const transferSchema = z.object({
  recipient: z.string(),
  sourceAmount: z.number(),
  sourceCurrency: z.string(),
  destAmount: z.number(),
  destCurrency: z.string(),
})

export default async function (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(404).end()
  if (req.query.key !== process.env.WYRE_WEBHOOK_KEY) return res.status(401).end()

  let query
  try {
    query = querySchema.parse(req.query)
  } catch (e) {
    return res.status(500).end()
  }

  await prisma.wyreWebhookRequestLog.create({
    data: {
      wyre_account_id: req.body.accountId,
      wyre_order_id: req.body.orderId,
      wyre_order_status: req.body.orderStatus,
      wyre_reference_id: req.body.referenceId,
      wyre_transfer_id: req.body.transferId,
      wyre_failed_reason: req.body.failedReason,
      wyre_reservation: req.body.reservation,
      wyre_environment: query.type,
    },
  })

  if (req.body.orderStatus === 'RUNNING_CHECKS') return res.status(200).end()

  const fields = bodySchema.parse(req.body)
  const status = {
    PROCESSING: OrderStatus.pending,
    COMPLETE: OrderStatus.complete,
    FAILED: OrderStatus.failed,
  }[fields.orderStatus]
  const network = {
    testwyre: 'kovan',
    sendwyre: 'mainnet',
  }[query.type]

  const reservation = await prisma.wyreReservation.findOne({
    where: { reservation: fields.reservation },
  })
  assert(reservation, 'No existing reservation found')

  const existingOrder = await prisma.onrampOrder.findOne({
    where: { order_ref: fields.reservation },
  })

  if (status === OrderStatus.pending) {
    assert(!existingOrder, `Order for reservation ${fields.reservation} already exists`)
    assert(fields.transferId, 'No transferId in webhook request')

    const wyreAccountId = {
      testwyre: process.env.TESTWYRE_ACCOUNT_ID!,
      sendwyre: process.env.SENDWYRE_ACCOUNT_ID!,
    }[query.type]
    const wyreApiHost = {
      testwyre: process.env.TESTWYRE_API_HOST!,
      sendwyre: process.env.SENDWYRE_API_HOST!,
    }[query.type]

    const url = `https://${wyreApiHost}/v2/transfer/${fields.transferId}/track`
    const res = await fetch(url)
    assert(res.status === 200, `Error querying ${url}: ${res.status} ${res.statusText}`)
    const json = await res.json()

    const transfer = transferSchema.parse({
      sourceAmount: json.sourceAmount,
      sourceCurrency: json.sourceCurrency,
      destAmount: json.destAmount,
      destCurrency: json.destCurrency,
      recipient: json.destSrn?.replace(/^ethereum:/i, '').toLowerCase(),
    })
    const order = await prisma.onrampOrder.create({
      data: {
        order_ref: fields.reservation,
        account_ref: wyreAccountId,
        onramp_provider: { connect: { id: 1 } },
        order_status: status,
        recipient: transfer.recipient,
        source_amount: transfer.sourceAmount,
        source_currency: transfer.sourceCurrency,
        dest_amount: transfer.destAmount,
        dest_currency: transfer.destCurrency,
        network,
      },
    })
    await prisma.raw`UPDATE wyre_reservation SET onramp_order_id = ${order.id} WHERE reservation = ${order.order_ref};`
  } else {
    assert(existingOrder?.order_status === OrderStatus.pending, 'No existing pending order')

    await prisma.onrampOrder.update({
      data: {
        order_status: status,
        order_message: fields.failedReason,
        updated: moment.utc().toDate(),
      },
      where: {
        order_ref: fields.reservation,
      },
    })
  }

  res.status(201).end()
}

export const config = { api: { bodyParser: false } }
