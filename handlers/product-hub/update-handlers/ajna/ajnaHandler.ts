import { getPoolLiquidity } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds, networksById } from 'blockchain/networks'
import { getTokenPrice, Tickers } from 'blockchain/prices'
import { getTokenSymbolFromAddress } from 'blockchain/tokensMetadata'
import { NEGATIVE_WAD_PRECISION, WAD_PRECISION } from 'components/constants'
import {
  AjnaPoolsTableData,
  getAjnaPoolsTableData,
} from 'features/ajna/positions/common/helpers/getAjnaPoolsTableData'
import { isPoolWithRewards } from 'features/ajna/positions/common/helpers/isPoolWithRewards'
import { isShortPosition } from 'features/ajna/positions/common/helpers/isShortPosition'
import { isYieldLoopPool } from 'features/ajna/positions/common/helpers/isYieldLoopPool'
import { ProductHubProductType, ProductHubSupportedNetworks } from 'features/productHub/types'
import { getTokenGroup } from 'handlers/product-hub/helpers'
import {
  ProductHubHandlerResponse,
  ProductHubHandlerResponseData,
} from 'handlers/product-hub/types'
import { one, zero } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'
import { uniq } from 'lodash'

async function getAjnaPoolData(
  networkId: NetworkIds.MAINNET | NetworkIds.GOERLI,
  tickers: Tickers,
): Promise<ProductHubHandlerResponseData> {
  const supportedPairs = Object.keys(getNetworkContracts(networkId).ajnaPoolPairs)
  const tokens = uniq(supportedPairs.flatMap((pair) => pair.split('-')))
  const prices = tokens.reduce<Tickers>(
    (v, token) => ({ ...v, [token]: new BigNumber(getTokenPrice(token, tickers)) }),
    {},
  )

  try {
    return (await getAjnaPoolsTableData(networkId))
      .reduce<{ pair: [string, string]; pool: AjnaPoolsTableData }[]>((v, pool) => {
        try {
          return [
            ...v,
            {
              pair: [
                getTokenSymbolFromAddress(networkId, pool.collateralAddress),
                getTokenSymbolFromAddress(networkId, pool.quoteTokenAddress),
              ],
              pool,
            },
          ]
        } catch (e) {
          console.warn('Token address not found within context', e)

          return v
        }
      }, [])
      .filter(({ pair: [collateralToken, quoteToken] }) =>
        supportedPairs.includes(`${collateralToken}-${quoteToken}`),
      )
      .sort((a, b) => (`${a.pair[0]}-${a.pair[1]}` > `${b.pair[0]}-${b.pair[1]}` ? 1 : -1))
      .reduce<ProductHubHandlerResponseData>(
        (
          v,
          {
            pair: [collateralToken, quoteToken],
            pool: {
              buckets,
              debt,
              interestRate,
              lowestUtilizedPrice,
              lowestUtilizedPriceIndex,
              lendApr,
            },
          },
        ) => {
          const isPoolNotEmpty = lowestUtilizedPriceIndex > 0
          const isShort = isShortPosition({ collateralToken })
          const isYieldLoop = isYieldLoopPool({ collateralToken, quoteToken })
          const collateralPrice = prices[collateralToken]
          const quotePrice = prices[quoteToken]
          const marketPrice = collateralPrice.div(quotePrice)
          const label = `${collateralToken}/${quoteToken}`
          const network = networksById[networkId].name as ProductHubSupportedNetworks
          const protocol = LendingProtocol.Ajna
          const maxLtv = lowestUtilizedPrice.div(marketPrice).toString()
          const liquidity = getPoolLiquidity({
            buckets: buckets.map((bucket) => ({
              ...bucket,
              index: new BigNumber(bucket.index),
              quoteTokens: new BigNumber(bucket.quoteTokens),
            })),
            debt: debt.shiftedBy(WAD_PRECISION),
          })
            .shiftedBy(NEGATIVE_WAD_PRECISION)
            .times(prices[quoteToken])
            .toString()
          const fee = interestRate.toString()
          const multiplyStrategy = isShort ? `Short ${quoteToken}` : `Long ${collateralToken}`
          const multiplyStrategyType = isShort ? 'short' : 'long'
          const maxMultiply = BigNumber.max(
            one.plus(one.div(one.div(maxLtv).minus(one))),
            zero,
          ).toString()
          const earnLPStrategy = `${collateralToken}/${quoteToken} LP`
          const earnYieldLoopStrategy = `${collateralToken}/${quoteToken} Yield Loop`
          const managementType = 'active'
          const weeklyNetApy = lendApr.toString()

          const ajnaRewardsTooltip = {
            content: {
              title: {
                key: 'ajna.product-hub-tooltips.this-pool-is-earning-ajna-tokens',
              },
              description: {
                key: 'ajna.product-hub-tooltips.rewards-available-soon',
              },
            },
            icon: 'sparks',
          }

          return {
            table: [
              ...v.table,
              {
                label,
                network,
                primaryToken: collateralToken,
                ...getTokenGroup(collateralToken, 'primary'),
                product: [
                  ProductHubProductType.Borrow,
                  ProductHubProductType.Multiply,
                  ...(isYieldLoop ? [ProductHubProductType.Earn] : []),
                ],
                protocol,
                secondaryToken: quoteToken,
                ...getTokenGroup(quoteToken, 'secondary'),
                fee,
                liquidity,
                ...(isPoolNotEmpty && {
                  maxLtv,
                  maxMultiply,
                }),
                multiplyStrategy,
                multiplyStrategyType,
                ...(isYieldLoop && {
                  earnStrategy: earnYieldLoopStrategy,
                  managementType,
                  ...(isPoolNotEmpty && {
                    weeklyNetApy,
                  }),
                }),
                tooltips: {
                  ...(isPoolWithRewards({ collateralToken, quoteToken }) && {
                    fee: ajnaRewardsTooltip,
                    ...(isPoolNotEmpty && {
                      weeklyNetApy: ajnaRewardsTooltip,
                    }),
                  }),
                  ...(!isPoolNotEmpty && {
                    maxLtv: {
                      content: {
                        description: {
                          key: 'ajna.product-hub-tooltips.no-max-ltv',
                        },
                      },
                      icon: 'question_o',
                      iconColor: 'neutral80',
                    },
                    maxMultiply: {
                      content: {
                        description: {
                          key: 'ajna.product-hub-tooltips.no-max-multiple',
                        },
                      },
                      icon: 'question_o',
                      iconColor: 'neutral80',
                    },
                    weeklyNetApy: {
                      content: {
                        description: {
                          key: 'ajna.product-hub-tooltips.no-weekly-apy',
                        },
                      },
                      icon: 'question_o',
                      iconColor: 'neutral80',
                    },
                  }),
                },
              },
              {
                label,
                network,
                primaryToken: quoteToken,
                ...getTokenGroup(quoteToken, 'primary'),
                product: [ProductHubProductType.Earn],
                protocol,
                secondaryToken: collateralToken,
                ...getTokenGroup(collateralToken, 'secondary'),
                earnStrategy: earnLPStrategy,
                liquidity,
                managementType,
                ...(isPoolNotEmpty && {
                  weeklyNetApy,
                }),
                reverseTokens: true,
                tooltips: {
                  ...(isPoolNotEmpty &&
                    isPoolWithRewards({ collateralToken, quoteToken }) && {
                      weeklyNetApy: ajnaRewardsTooltip,
                    }),
                  ...(!isPoolNotEmpty && {
                    weeklyNetApy: {
                      content: {
                        description: {
                          key: 'ajna.product-hub-tooltips.no-weekly-apy',
                        },
                      },
                      icon: 'question_o',
                      iconColor: 'neutral80',
                    },
                  }),
                },
              },
            ],
            warnings: [],
          }
        },
        { table: [], warnings: [] },
      )
  } catch (e) {
    // @ts-ignore
    return { table: [], warnings: [e.toString()] }
  }
}

export default async function (tickers: Tickers): ProductHubHandlerResponse {
  return Promise.all([
    getAjnaPoolData(NetworkIds.MAINNET, tickers),
    getAjnaPoolData(NetworkIds.GOERLI, tickers),
  ]).then((responses) => {
    return responses.reduce<ProductHubHandlerResponseData>(
      (v, response) => {
        return {
          table: [...v.table, ...response.table],
          warnings: [...v.warnings, ...response.warnings],
        }
      },
      { table: [], warnings: [] },
    )
  })
}
