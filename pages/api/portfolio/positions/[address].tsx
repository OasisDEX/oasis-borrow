import { NetworkNames } from 'blockchain/networks'
import { ProductType, StrategyType } from 'features/aave/types'
import { LendingProtocol } from 'lendingProtocols'
import type { NextApiRequest, NextApiResponse } from 'next'

import type { PortfolioPositionsResponse } from 'lambdas/src/portfolio-positions/types'

export default async function (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(500).json({
      error: 'Cannot handle this request method',
    })
  }

  const mockPositionsResponse: {
    status: number
    response: PortfolioPositionsResponse
  } = {
    status: 200,
    response: {
      positions: [
        {
          positionId: 2137,
          type: ProductType.Multiply,
          network: NetworkNames.ethereumMainnet,
          protocol: LendingProtocol.Maker,
          strategyType: StrategyType.Short,
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
              type: 'netValue',
              value: '1.32M',
            },
            {
              type: 'pnl',
              value: '2.32%',
              accent: 'positive',
            },
            {
              type: 'liquidationPrice',
              value: '$1,234',
              subvalue: 'Now: $1,420',
            },
            {
              type: 'ltv',
              value: '72%',
              subvalue: 'Max 76%',
            },
            {
              type: 'multiple',
              value: '4x',
              subvalue: 'Max 5.1x',
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
            },
          },
        },
        {
          positionId: 12,
          type: ProductType.Borrow,
          network: NetworkNames.ethereumMainnet,
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
              type: 'collateralLocked',
              value: '423M',
            },
            {
              type: 'totalDebt',
              value: '32.2M',
            },
            {
              type: 'liquidationPrice',
              value: '$453',
              subvalue: 'Now: $953.26',
            },
            {
              type: 'ltv',
              value: '72%',
              subvalue: 'Max 76%',
            },
            {
              type: 'multiple',
              value: '4x',
              subvalue: 'Max 5.1x',
            },
          ],
          automations: {
            stopLoss: {
              enabled: false,
            },
          },
        },
        {
          positionId: 333,
          type: ProductType.Earn,
          network: NetworkNames.ethereumMainnet,
          protocol: LendingProtocol.Ajna,
          strategyType: StrategyType.Long,
          lendingType: 'active',
          openDate: 1692174480,
          tokens: {
            supply: {
              symbol: 'ETH',
              amount: 50,
              amountUSD: 390100,
            },
            borrow: {
              symbol: 'DAI',
              amount: 1,
              amountUSD: 89967,
            },
          },
          details: [
            {
              type: 'netValue',
              value: '232,345 DAI',
            },
            {
              type: 'lendingRange',
              value: 'active',
            },
            {
              type: 'earnings',
              value: '232,345 DAI',
            },
            {
              type: 'apy',
              value: '8.3%',
            },
            {
              type: '90dApy',
              value: '4.15%',
            },
          ],
          automations: {},
        },
        {
          positionId: 434,
          type: ProductType.Earn,
          network: NetworkNames.ethereumMainnet,
          protocol: LendingProtocol.Maker,
          lendingType: 'passive',
          openDate: 1697574480,
          tokens: {
            supply: {
              symbol: 'DAI',
              amount: 232123,
              amountUSD: 232123,
            },
          },
          details: [
            {
              type: 'netValue',
              value: '232,345 DAI',
            },
            {
              type: 'earnings',
              value: '232,345 DAI',
            },
            {
              type: 'apy',
              value: '8.3%',
              subvalue: '90d: Avg 4.15%',
            },
          ],
          automations: {},
        },
        {
          positionId: 6254,
          type: ProductType.Earn,
          network: NetworkNames.ethereumMainnet,
          protocol: LendingProtocol.Ajna,
          lendingType: 'loop',
          openDate: 1698514480,
          tokens: {
            supply: {
              symbol: 'DAI',
              amount: 232123,
              amountUSD: 232123,
            },
          },
          details: [
            {
              type: 'netValue',
              value: '232,345 DAI',
            },
            {
              type: 'earnings',
              value: '232,345 DAI',
            },
            {
              type: 'apy',
              value: '8.3%',
              subvalue: '90d: Avg 4.15%',
            },
            {
              type: 'ltv',
              value: '72%',
              subvalue: '76%',
            },
          ],
          automations: {},
        },
        {
          positionId: 123123,
          type: ProductType.Earn,
          network: NetworkNames.ethereumMainnet,
          protocol: LendingProtocol.Ajna,
          lendingType: 'loop',
          openDate: 1678414480,
          tokens: {
            supply: {
              symbol: 'DAI',
              amount: 0,
              amountUSD: 0,
            },
          },
          details: [
            {
              type: 'netValue',
              value: '0 DAI',
            },
            {
              type: 'earnings',
              value: '1,4 DAI',
            },
            {
              type: 'apy',
              value: '8.3%',
              subvalue: '90d: Avg 4.15%',
            },
            {
              type: 'ltv',
              value: '72%',
              subvalue: '76%',
            },
          ],
          automations: {},
        },
        {
          positionId: 6543,
          network: NetworkNames.ethereumMainnet,
          protocol: LendingProtocol.AaveV3,
          openDate: 1698514480,
          availableToMigrate: true,
          tokens: {
            supply: {
              symbol: 'DAI',
              amount: 232123,
              amountUSD: 232123,
            },
            borrow: {
              symbol: 'ETH',
              amount: 232123,
              amountUSD: 232123,
            },
          },
          details: [
            {
              type: 'suppliedToken',
              value: 'DAI',
            },
            {
              type: 'suppliedTokenBalance',
              value: '1.1M',
            },
            {
              type: 'borrowedToken',
              value: 'ETH',
            },
            {
              type: 'borrowedTokenBalance',
              value: '150',
            },
          ],
          automations: {
            autoBuy: {
              enabled: false,
            },
            autoSell: {
              enabled: false,
            },
            takeProfit: {
              enabled: false,
            },
            stopLoss: {
              enabled: false,
            },
          },
        },
      ],
    },
  }

  return res.status(mockPositionsResponse.status).json(mockPositionsResponse.response)
}
