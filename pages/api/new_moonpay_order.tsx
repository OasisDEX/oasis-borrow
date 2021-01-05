import crypto from 'crypto'
import { NextApiRequest, NextApiResponse } from 'next'
import * as z from 'zod'

const bodySchema = z.object({
  currencyCode: z.string(),
  baseCurrencyAmount: z.string(),
  baseCurrencyCode: z.string(),
  recipient: z.string().refine((val) => /^0x[0-9a-f]{40}$/i.test(val), 'Invalid Ethereum address'),
  network: z.union([z.literal('kovan'), z.literal('main')]),
  redirectURL: z.string(),
})

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const fields = bodySchema.parse(req.query)

  const { network, currencyCode, redirectURL, baseCurrencyAmount, recipient } = fields

  const {
    PROD_MOON_PAY_HOST,
    TEST_MOON_PAY_HOST,
    PROD_MOON_PAY_KEY,
    TEST_MOON_PAY_KEY,
    PROD_MOON_PAY_SECRET_KEY,
    TEST_MOON_PAY_SECRET_KEY,
  } = process.env
  const moonPayHost = network === 'main' ? PROD_MOON_PAY_HOST : TEST_MOON_PAY_HOST
  const moonPayKey = network === 'main' ? PROD_MOON_PAY_KEY : TEST_MOON_PAY_KEY
  const moonPaySecretKey =
    network === 'main' ? (PROD_MOON_PAY_SECRET_KEY as string) : (TEST_MOON_PAY_SECRET_KEY as string)
  const url = `https://${moonPayHost}?apiKey=${moonPayKey}&walletAddress=${recipient.toLowerCase()}&currencyCode=${currencyCode}&redirectURL=${encodeURIComponent(
    redirectURL,
  )}&baseCurrencyCode=usd&baseCurrencyAmount=${baseCurrencyAmount}`

  const signature = crypto
    .createHmac('sha256', moonPaySecretKey)
    .update(new URL(url).search)
    .digest('base64')

  const urlWithSignature = `${url}&signature=${encodeURIComponent(signature)}`

  res.writeHead(302, { Location: urlWithSignature })
  res.end()
}
