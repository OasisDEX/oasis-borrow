import { OnrampOrder } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'server/prisma'
import { Dictionary } from 'ts-essentials'

const { LATAMEX_API_HOST, LATAMEX_API_USER, LATAMEX_API_PASSWORD } = process.env

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

const LATAM500_USERS_LIMIT = 500

async function checkNewLatam500Users() {
  const count = await prisma.raw<any>('SELECT count(recipient) FROM latam500_distribution')
  const existingUsersCount = count[0].count
  const usersLeft = LATAM500_USERS_LIMIT - existingUsersCount

  if (usersLeft > 0) {
    await prisma.raw<any>(
      `INSERT INTO latam500_distribution(recipient) SELECT DISTINCT recipient FROM onramp_order WHERE order_status = 'accepted' and onramp_provider_id = 3 and recipient NOT IN (SELECT recipient FROM latam500_distribution) LIMIT ${usersLeft}`,
    )
  }
}

export async function updateLatamexUserOrders(authToken: string) {
  const orders: OnrampOrder[] = await prisma.raw`
SELECT order_ref, order_status, dest_amount, created, onramp_provider.provider_type, dest_currency
FROM onramp_order
INNER JOIN onramp_provider ON onramp_order.onramp_provider_id = onramp_provider.id
WHERE (order_status = 'initialised' or order_status = 'pending' or order_status = 'incomplete')
and (created + interval '7 day') >= NOW()`

  if (orders.length) {
    await Promise.all(
      orders.map(async (order: any) => {
        const orderURL = `${LATAMEX_API_HOST}/api/transaction/${order.order_ref}`

        const res = await fetch(orderURL, {
          method: 'GET',
          headers: {
            Authorization: `Token ${authToken}`,
          },
        })
        const { data } = await res.json()

        if (data && data.status !== 'Incomplete') {
          const update: Dictionary<any> = {
            order_ref: data.transactionRef,
            updated: data.lastUpdateTimeStamp,
            order_status: data.status.toLowerCase(),
          }

          if (data.paidAmount && data.paidAmount > 0) {
            update['dest_amount'] = Math.floor(data.paidAmount * 100) / 100
          }

          await prisma.onrampOrder.upsert({
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
      }),
    )
  }
}

export default async function (req: NextApiRequest, res: NextApiResponse) {
  if (req.query.auth !== 'A86675D54C68E044DC0959EF0722D94B') return res.status(401).end()

  const authToken = await LatamexAuth()

  if (!authToken) {
    return res.status(401).end()
  }

  await updateLatamexUserOrders(authToken)
  await checkNewLatam500Users()

  return res.status(201).json({ done: true })
}
