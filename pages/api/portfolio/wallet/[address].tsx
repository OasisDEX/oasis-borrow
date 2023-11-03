import axios from 'axios'
import { NetworkNames } from 'blockchain/networks'
import type { DebankNetworkNames } from 'blockchain/networks/debank-network-names'
import { DebankNetworkNameToOurs } from 'blockchain/networks/debank-network-names'
import type { DebankTokensReply, PortfolioAssetsReply } from 'features/portfolio/types'
import type { NextApiRequest, NextApiResponse } from 'next'
import { object, string } from 'zod'

const portfolioWalletAddressSchema = object({
  address: string(),
})

export default async function (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(500).json({
      error: 'Cannot handle this request method',
    })
  }
  const params = portfolioWalletAddressSchema.parse(req.query)
  if (!process.env.DEBANK_API_URL) {
    return res.status(500).json({
      error: 'Missing DEBANK_API_URL env variable',
    })
  }
  if (!params.address) {
    return res.status(500).json({
      error: 'Missing address query parameter',
    })
  }

  const portfolioAPIUrl = new URL(process.env.DEBANK_API_URL)
  const reqUrl = new URL(`/v1/user/all_token_list?id=${params.address}`, portfolioAPIUrl)
  const response = await axios.get<DebankTokensReply>(reqUrl.toString(), {
    headers: {
      AccessKey: `${process.env.DEBANK_API_KEY}`,
    },
  })
  const tokensData = response.data
  const preparedTokenData = tokensData
    .filter(({ chain, is_wallet }) => is_wallet && chain !== undefined)
    .map((token) => ({
      name: token.name,
      symbol: token.symbol,
      network: DebankNetworkNameToOurs[token.chain as DebankNetworkNames],
      priceUSD: token.price,
      price24hChange: token.price_24h_change,
      balance: token.amount,
      balanceUSD: token.amount * token.price,
    }))
    .filter(({ network }) => Object.values(NetworkNames).includes(network))
    .sort((a, b) => b.balanceUSD - a.balanceUSD)

  const walletAssetsResponse: PortfolioAssetsReply = {
    assets: preparedTokenData,
  }

  return res.status(response.status).json(walletAssetsResponse)
}
