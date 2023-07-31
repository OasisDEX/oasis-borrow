import { SimplifiedTokenConfig } from 'blockchain/tokensMetadata'
import { DEFAULT_TOKEN_DIGITS } from 'components/constants'
import { NextApiHandler } from 'next'
import NodeCache from 'node-cache'

const cache = new NodeCache({ stdTTL: 60 * 60 })

interface TokensListResponse {
  name: string
  timestamp: string
  tokens: {
    chainId: number
    address: string
    name: string
    symbol: string
    decimals: number
  }[]
}

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'GET':
      if (!req.query.token) {
        return res.status(500).json({
          errorMessage: 'Invalid GET parameters',
          error: 'Missing tokens list',
        })
      }
      const tokens = Array.isArray(req.query.token) ? req.query.token : [req.query.token]

      try {
        const cached = cache.get('tokensList')
        const response = (cached ||
          (await (
            await fetch('https://tokens.coingecko.com/uniswap/all.json')
          ).json())) as TokensListResponse
        const tokensList = response.tokens.reduce<{ [key: string]: SimplifiedTokenConfig }>(
          (total, { address, decimals, name, symbol }) =>
            tokens.includes(address)
              ? {
                  ...total,
                  [address]: {
                    symbol: symbol.toUpperCase(),
                    name,
                    precision: decimals,
                    digits: DEFAULT_TOKEN_DIGITS,
                  },
                }
              : total,
          {},
        )

        if (!cached) cache.set('tokensList', response)

        return res.status(200).json(tokensList)
      } catch (error) {
        return res.status(500).json({
          errorMessage: 'Unknown error occured',
          error: String(error),
        })
      }
    default:
      return res.status(405).end()
  }
}
export default handler
