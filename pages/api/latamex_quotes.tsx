import { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch'
import { forkJoin } from 'rxjs'
import { mergeMap } from 'rxjs/operators'

function fetchPairQuote(asset: string, originAsset: string, url: string, authToken: string) {
  return fetch(
    `${url}/api/quotes?` +
      new URLSearchParams({
        fromAsset: asset,
        toAsset: originAsset,
        type: 'Buy',
      }).toString(),
    {
      method: 'GET',
      headers: {
        Authorization: `Token ${authToken}`,
      },
    },
  )
}

export const latamexFiats = ['ARS', 'BRL', 'MXN']

export default async function latamexQuotes(req: NextApiRequest, res: NextApiResponse) {
  const crypto = ['ETH', 'DAI']

  const { LATAMEX_API_HOST, LATAMEX_API_USER, LATAMEX_API_PASSWORD } = process.env

  const url = LATAMEX_API_HOST

  const body = JSON.stringify({
    email: LATAMEX_API_USER,
    password: LATAMEX_API_PASSWORD,
  })

  const authRes = await fetch(`${url}/api/auth/login`, {
    method: 'POST',
    body: body || undefined,
  })
  const auth = await authRes.json()
  if (!auth.token) {
    return res.status(401).end()
  }

  const quotes: any = []
  const pairs: any = []
  latamexFiats.forEach((f: string) =>
    crypto.forEach((c: string) => {
      quotes.push(fetchPairQuote(c, f, url!, auth.token))
      pairs.push(c + f)
    }),
  )

  const result = await forkJoin(quotes)
    .pipe(
      mergeMap((items: any) => {
        return forkJoin(
          items.map((item: any) => {
            return item.json()
          }),
        )
      }),
    )
    .toPromise()

  const pairQuotes: any = {}

  pairs.forEach((pair: string, index: number) => {
    pairQuotes[pair] = result[index]
  })

  res.status(201).json(pairQuotes)
}
