import { OnrampOrder } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'server/prisma'
import { Dictionary } from 'ts-essentials'
import * as z from 'zod'

const paramsSchema = z.object({
  address: z.string(),
})

const { LATAMEX_API_HOST, LATAMEX_API_USER, LATAMEX_API_PASSWORD } = process.env

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const params = paramsSchema.parse(req.query)

  await updateLatamexUserOrders(params.address)

  const orders: OnrampOrder[] = await prisma.raw`
    SELECT order_ref, order_status, dest_amount, created, onramp_provider.provider_type, dest_currency
    FROM onramp_order
    INNER JOIN onramp_provider ON onramp_order.onramp_provider_id = onramp_provider.id
    WHERE recipient = ${params.address} and order_status <> 'initialised'  order by created DESC`

  orders
    ? res.json(
        orders.map((order: OnrampOrder) => ({
          id: order.order_ref,
          status: order.order_status,
          amount: order.dest_amount,
          type: (order as any).provider_type,
          date: order.created,
          token: order.dest_currency,
        })),
      )
    : res.json([])
}

async function LatamexAuth() {
  const body = JSON.stringify({
    email: LATAMEX_API_USER,
    password: LATAMEX_API_PASSWORD,
  })

  const authRes = await fetch(`${LATAMEX_API_HOST}/api/auth/login`, {
    method: 'POST',
    body: body || undefined,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const auth = await authRes.json()

  return auth.token
}

async function updateLatamexUserOrders(address: string) {
  const orders: OnrampOrder[] = await prisma.raw`
    SELECT order_ref, order_status, dest_amount, created, onramp_provider.provider_type, dest_currency
    FROM onramp_order
    INNER JOIN onramp_provider ON onramp_order.onramp_provider_id = onramp_provider.id
    WHERE onramp_provider_id = 3 and recipient = ${address} 
    and (order_status = 'initialised' or order_status = 'pending' or order_status = 'incomplete')
    and (created + interval '7 day') >= NOW()`

  if (orders.length) {
    const authToken = await LatamexAuth()

    await Promise.all(
      orders.map(async (order: any) => {
        const orderURL = `${LATAMEX_API_HOST}/api/transaction/${order.order_ref}`

        const res = await fetch(orderURL, {
          method: 'GET',
          headers: {
            Authorization: `Token ${authToken}`,
          },
        })

        if (res.status !== 200) {
          return false
        }

        const result = await res.json()
        const { data } = result

        if (data.status !== 'Incomplete') {
          const update: Dictionary<any> = {
            order_ref: data.transactionRef,
            updated: data.lastUpdateTimeStamp,
            order_status: data.status.toLowerCase(),
          }

          if (data.paidAmount && data.paidAmount > 0) {
            update['dest_amount'] = Math.floor(data.paidAmount * 100) / 100
          }

          return prisma.onrampOrder.upsert({
            update,
            where: { order_ref: data.transactionRef },
            create: {
              order_ref: data.transactionRef,
              account_ref: 'LM',
              onramp_provider: { connect: { id: 3 } },
              order_status: data.status.toLowerCase(),
              recipient: data.destinationWalletAddress.toLowerCase(),
              created: data.createdTimestamp,
              updated: data.lastUpdateTimeStamp,
              source_amount: data.checkoutAmount,
              source_currency: data.originAsset,
              dest_currency: data.destinationAsset,
            },
          })
        }

        return null
      }),
    )
  }
}
