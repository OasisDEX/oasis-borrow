import axios from 'axios'
import type { DebankNetworkNames } from 'blockchain/networks/debank-network-names'
import { DebankNetworkNameToOurs } from 'blockchain/networks/debank-network-names'
import { portfolioAPIUrl } from 'features/portfolio/constants'
import type { DebankTokensReply, PortfolioAssetsReply } from 'features/portfolio/types'
import type { NextApiRequest, NextApiResponse } from 'next'
import { object, string } from 'zod'

const portfolioWalletAddressSchema = object({
  address: string(),
})

export default async function (req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      const params = portfolioWalletAddressSchema.parse(req.query)
      if (!params.address) {
        return res.status(500).json({
          error: 'Missing address query parameter',
        })
      }
      const reqUrl = new URL(`/v1/user/all_token_list?id=${params.address}`, portfolioAPIUrl)
      const response = await axios.get<DebankTokensReply>(reqUrl.toString(), {
        headers: {
          AccessKey: `${process.env.DEBANK_API_KEY}`,
        },
      })
      const tokensData = response.data.filter((token) => token.price > 0)
      const preparedTokenData = tokensData
        .filter((token) => token.is_wallet)
        .map((token) => ({
          name: token.name,
          network: DebankNetworkNameToOurs[token.chain as DebankNetworkNames],
          priceUSD: token.price,
          price24hChange: token.price_24h_change,
          balance: token.amount,
          balanceUSD: token.amount * token.price,
        }))

      const walletAssetsResponse: PortfolioAssetsReply = {
        totalUSDAssets: preparedTokenData.reduce((acc, token) => acc + token.balanceUSD, 0),
        totalUSDAssets24hChange:
          preparedTokenData.reduce((acc, token) => acc + token.price24hChange, 0) /
          preparedTokenData.length,
        assets: preparedTokenData,
      }

      return res.status(response.status).json(walletAssetsResponse)
    default:
      return res.status(500).json({
        error: 'Cannot handle this request method',
      })
  }
}
