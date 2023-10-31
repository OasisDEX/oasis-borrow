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
          openDate: 1697124880,
          tokens: {
            supply: {
              symbol: 'ETH',
              amount: 1,
              amountUSD: 1816.33,
            },
            borrow: {
              symbol: 'DAI',
              amount: 1000,
              amountUSD: 1000,
            },
          },
          details: [
            {
              type: 'earnings',
              value: '1234.56',
            },
          ],
          automations: {
            stopLoss: {
              enabled: true,
              price: 0.8,
            },
            autoBuy: {
              enabled: true,
              price: 1450,
            },
            autoSell: {
              enabled: true,
              price: 2100,
            },
            takeProfit: {
              enabled: false,
              price: 0,
            },
          },
        },
        {
          positionId: 12,
          type: ProductType.Borrow,
          network: NetworkNames.optimismMainnet,
          protocol: LendingProtocol.AaveV3,
          strategyType: StrategyType.Short,
          openDate: 1696174480,
          tokens: {
            supply: {
              symbol: 'DAI',
              amount: 390100,
              amountUSD: 390100,
            },
            borrow: {
              symbol: 'WBTC',
              amount: 1,
              amountUSD: 34642.8,
            },
          },
          details: [
            {
              type: 'earnings',
              value: '1234.56',
            },
          ],
          automations: {
            stopLoss: {
              enabled: false,
              price: 0,
            },
          },
        },
      ],
    },
  }

  return res.status(mockPositionsResponse.status).json(mockPositionsResponse.response)
}
