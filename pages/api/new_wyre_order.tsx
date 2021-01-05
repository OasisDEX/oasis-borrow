import { createHmac } from 'crypto'
import moment from 'moment'
import { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch'
import { prisma } from 'server/prisma'
import { assert } from 'ts-essentials'
import * as z from 'zod'

const bodySchema = z.object({
  amount: z.string(),
  recipient: z.string().refine((val) => /^0x[0-9a-f]{40}$/i.test(val), 'Invalid Ethereum address'),
  sourceCurrency: z.union([
    z.literal('USD'),
    z.literal('GBP'),
    z.literal('EUR'),
    z.literal('CAD'),
    z.literal('AUD'),
  ]),
  destCurrency: z.union([z.literal('ETH'), z.literal('DAI')]),
  network: z.union([z.literal('kovan'), z.literal('main')]),
  redirectUrl: z.string(),
  failureRedirectUrl: z.string(),
})

const reserveOrderResultSchema = z.object({
  url: z.string(),
  reservation: z.string(),
})

async function wyreAuthenticatedRequest(
  credentials: { api_key: string; secret_key: string },
  url: string,
  method: string,
  body?: any,
) {
  url = `${url}${url.indexOf('?') === -1 ? '?' : '&'}timestamp=${moment.now()}`
  body = body === undefined ? '' : JSON.stringify(body)

  const result = await fetch(url, {
    method,
    body: body || undefined,
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': credentials.api_key,
      'X-Api-Signature': createHmac('sha256', credentials.secret_key)
        .update(`${url}${body}`)
        .digest('hex'),
    },
  })
  assert(result.status === 200, `Error querying ${url}: ${result.status} ${result.statusText}`)
  return await result.json()
}

export default async function (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(404).end()

  let fields
  try {
    fields = bodySchema.parse(req.body)
  } catch (err) {
    return res.status(500).end()
  }
  const wyreAccountId = {
    kovan: process.env.TESTWYRE_ACCOUNT_ID!,
    main: process.env.SENDWYRE_ACCOUNT_ID!,
  }[fields.network]

  const wyreApiHost = {
    kovan: process.env.TESTWYRE_API_HOST!,
    main: process.env.SENDWYRE_API_HOST!,
  }[fields.network]

  const wyreCredentials = {
    api_key: {
      kovan: process.env.TESTWYRE_API_KEY!,
      main: process.env.SENDWYRE_API_KEY!,
    }[fields.network],
    secret_key: {
      kovan: process.env.TESTWYRE_SECRET_KEY!,
      main: process.env.SENDWYRE_SECRET_KEY!,
    }[fields.network],
  }

  let result
  try {
    result = reserveOrderResultSchema.parse(
      await wyreAuthenticatedRequest(
        wyreCredentials,
        `https://${wyreApiHost}/v3/orders/reserve`,
        'POST',
        {
          referrerAccountId: wyreAccountId,
          amount: fields.amount,
          dest: `ethereum:${fields.recipient.toLowerCase()}`,
          sourceCurrency: fields.sourceCurrency,
          destCurrency: fields.destCurrency,
          lockFields: ['dest'],
        },
      ),
    )
  } catch (e) {
    return res.status(500).end()
  }

  const url = `${result.url}&redirectUrl=${encodeURIComponent(
    fields.redirectUrl,
  )}&hideTrackBtn=1&failureRedirectUrl=${encodeURIComponent(fields.failureRedirectUrl)}`

  await prisma.wyreReservation.create({
    data: {
      reservation: result.reservation,
      pay_url: url,
      wyre_account: wyreAccountId,
      amount: Number(fields.amount),
      recipient: fields.recipient.toLowerCase(),
      source_currency: fields.sourceCurrency,
      dest_currency: fields.destCurrency,
      network: fields.network,
      redirect_url: fields.redirectUrl,
      failure_redirect_url: fields.failureRedirectUrl,
    },
  })

  return res.status(201).json({ url, reservation: result.reservation })
}

export const config = { api: { bodyParser: false } }
