import { NetworkNames } from 'blockchain/networks'
import { ProductType, StrategyType } from 'features/aave/types'
import type { PortfolioPositionsReply } from 'features/portfolio/types'
import { LendingProtocol } from 'lendingProtocols'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(500).json({
      error: 'Cannot handle this request method',
    })
  }

  const mockPositionsResponse: {
    status: number
    response: {
      positions: PortfolioPositionsReply
    }
  } = {
    status: 200,
    response: {
      positions: [
        {
          positionId: 2137,
          type: ProductType.Multiply,
          network: NetworkNames.ethereumMainnet,
          protocol: LendingProtocol.Maker,
          strategyType: StrategyType.Long,
          tokens: {
            collateral: {
              symbol: 'ETH',
              amount: 1,
              amountUSD: 1816.33,
            },
            debt: {
              symbol: 'DAI',
              amount: 1000,
              amountUSD: 1000,
            },
          },
          liquidationTokenPrice: 1614,
          currentTokenPrice: 1816.33,
          loanToValue: 0.5,
          maxLoanToValue: 0.8,
          collateralizationRatio: 0.5,
          multiple: 2,
          maxMultiple: 2.5,
          automations: {},
        },
      ],
    },
  }

  return res.status(mockPositionsResponse.status).json(mockPositionsResponse.response)
}
