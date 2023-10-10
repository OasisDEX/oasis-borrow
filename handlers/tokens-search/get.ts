import { getTokensList } from 'handlers/getTokensList'
import { cacheObject } from 'helpers/api/cacheObject'
import type { NextApiRequest, NextApiResponse } from 'next'
import * as z from 'zod'

const getTokens = cacheObject(getTokensList, 60 * 60, 'tokens-list')

const paramsSchema = z.object({
  query: z.array(z.string()),
})

export async function get(req: NextApiRequest, res: NextApiResponse) {
  const { query } = paramsSchema.parse(req.body)

  const caseSensitiveQuery = query.map((item) => item.toLowerCase())
  const tokensList = await getTokens()

  const response = tokensList?.data.tokens
    .filter(({ name, symbol }) =>
      caseSensitiveQuery.find(
        (item) => name.toLowerCase().includes(item) || symbol.toLowerCase().includes(item),
      ),
    )
    .map(({ symbol, address }) => ({
      symbol,
      address,
    }))

  return res.status(200).json(response)
}
