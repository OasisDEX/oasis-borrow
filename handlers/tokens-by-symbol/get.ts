import { getTokensList } from 'handlers/getTokensList'
import { cacheObject } from 'helpers/api/cacheObject'
import { NextApiRequest, NextApiResponse } from 'next'
import * as z from 'zod'

const getTokens = cacheObject(getTokensList, 60 * 60, 'tokens-list')

const paramsSchema = z.object({
  query: z.string(),
})

export async function get(req: NextApiRequest, res: NextApiResponse) {
  const { query } = paramsSchema.parse(req.body)

  const tokensList = await getTokens()

  const response = tokensList?.data.tokens
    .filter(({ name, symbol }) => name.includes(query) || symbol.includes(query))
    .reduce<{ [key: string]: string }>(
      (total, { address, symbol }) => ({
        ...total,
        [symbol]: address,
      }),
      {},
    )

  return res.status(200).json(response)
}
