import { getPoolLiquidity } from '@oasisdex/dma-library'
import { EarnStrategies } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds, networksById } from 'blockchain/networks'
import { getTokenPrice } from 'blockchain/prices'
import type { Tickers } from 'blockchain/prices.types'
import { NEGATIVE_WAD_PRECISION, WAD_PRECISION } from 'components/constants'
import { lambdaPercentageDenomination } from 'features/aave/constants'
import { isShortPosition } from 'features/omni-kit/helpers'
import { isYieldLoopPair } from 'features/omni-kit/helpers/isYieldLoopPair'
import type { AjnaPoolsTableData } from 'features/omni-kit/protocols/ajna/helpers'
import {
  ajnaWeeklyRewards,
  getAjnaPoolsData,
  isPoolOracless,
  isPoolSupportingMultiply,
  isPoolWithRewards,
} from 'features/omni-kit/protocols/ajna/helpers'
import { settings as ajnaSettings, settings } from 'features/omni-kit/protocols/ajna/settings'
import { OmniProductType } from 'features/omni-kit/types'
import {
  productHubAjnaEmptyPoolMaxLtvTooltip,
  productHubAjnaEmptyPoolMaxMultipleTooltip,
  productHubAjnaEmptyPoolWeeklyApyTooltip,
  productHubAjnaOraclessLtvTooltip,
} from 'features/productHub/content'
import type { ProductHubSupportedNetworks } from 'features/productHub/types'
import { getTokenGroup } from 'handlers/product-hub/helpers'
import type {
  ProductHubHandlerResponse,
  ProductHubHandlerResponseData,
} from 'handlers/product-hub/types'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { getYieldsRequest } from 'helpers/lambda/yields'
import { one, zero } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'
import { isNull, uniq } from 'lodash'

async function getAjnaPoolData(
  networkId:
    | NetworkIds.MAINNET
    | NetworkIds.BASEMAINNET
    | NetworkIds.ARBITRUMMAINNET
    | NetworkIds.OPTIMISMMAINNET,
  tickers: Tickers,
): Promise<ProductHubHandlerResponseData> {
  const poolContracts = {
    ...getNetworkContracts(networkId).ajnaPoolPairs,
    ...getNetworkContracts(networkId).ajnaOraclessPoolPairs,
  }
  const poolsTokenPairs = Object.keys(poolContracts).map((pair) => pair.split('-'))
  const poolAddresses = [
    ...Object.values(getNetworkContracts(networkId).ajnaPoolPairs),
    ...Object.values(getNetworkContracts(networkId).ajnaOraclessPoolPairs),
  ].map((contract) => contract.address.toLowerCase())

  const prices = uniq([
    'AJNA',
    ...Object.keys(getNetworkContracts(networkId).ajnaPoolPairs).flatMap((pair) => pair.split('-')),
  ]).reduce<Tickers>(
    (v, token) => ({
      ...v,
      [token]: new BigNumber(getTokenPrice(token, tickers, 'ajnaHandler')),
    }),
    {},
  )
  const ajnaPoolsData = await getAjnaPoolsData(networkId)

  const yieldLoopPoolPairs = poolsTokenPairs.filter((pair) =>
    isYieldLoopPair({ collateralToken: pair[0], debtToken: pair[1] }),
  )

  const yieldLoopApysCalls = await Promise.all(
    yieldLoopPoolPairs.map(async ([collateralToken, quoteToken]) => {
      const poolData = ajnaPoolsData.find(
        ({ quoteToken: poolQuoteToken, collateralToken: poolCollateralToken }) => {
          return (
            poolQuoteToken?.toLocaleLowerCase() === quoteToken?.toLocaleLowerCase() &&
            poolCollateralToken?.toLocaleLowerCase() === collateralToken?.toLocaleLowerCase()
          )
        },
      )
      if (!poolData) {
        console.error('Pool data not found for', collateralToken, quoteToken)
        return null
      }
      const { lowestUtilizedPrice, address } = poolData
      const isOracless = isPoolOracless({ networkId, collateralToken, quoteToken })
      const collateralPrice = isOracless ? one : prices[collateralToken]
      const quotePrice = isOracless ? one : prices[quoteToken]
      const marketPrice = collateralPrice.div(quotePrice)
      const maxLtv = lowestUtilizedPrice.div(marketPrice)

      const response = await getYieldsRequest(
        {
          actionSource: 'product-hub handler ajna',
          networkId,
          protocol: LendingProtocol.Ajna,
          ltv: maxLtv,
          poolAddress: address,
        },
        process.env.FUNCTIONS_API_URL,
      )

      if (!response?.results) {
        console.warn('No Ajna APY data for request: ', {
          networkId,
          protocol: LendingProtocol.Ajna,
          ltv: maxLtv,
          poolAddress: address,
          response,
        })
      }

      return response
    }),
  )
  const yieldLoopApys = yieldLoopApysCalls.filter((apy) => !isNull(apy))

  try {
    return ajnaPoolsData
      .reduce<{ pair: [string, string]; pool: AjnaPoolsTableData }[]>(
        (v, pool) =>
          poolAddresses.includes(pool.address.toLowerCase())
            ? [
                ...v,
                {
                  pair: (
                    Object.keys(poolContracts).find(
                      (key) =>
                        poolContracts[key as keyof typeof poolContracts].address.toLowerCase() ===
                        pool.address.toLowerCase(),
                    ) as string
                  ).split('-') as [string, string],
                  pool,
                },
              ]
            : v,
        [],
      )
      .reduce<ProductHubHandlerResponseData>(
        (
          v,
          {
            pair: [collateralToken, quoteToken],
            pool: {
              address,
              collateralTokenAddress,
              buckets,
              debt,
              interestRate,
              lendApr,
              lowestUtilizedPrice,
              lowestUtilizedPriceIndex,
              quoteTokenAddress,
              summerDepositAmountEarningInterest,
            },
          },
        ) => {
          const isPoolNotEmpty = lowestUtilizedPriceIndex > 0
          const isOracless = isPoolOracless({ networkId, collateralToken, quoteToken })
          const isShort = isShortPosition({ collateralToken })
          const isYieldLoop = isYieldLoopPair({ collateralToken, debtToken: quoteToken })
          const isWithMultiply = isPoolSupportingMultiply({
            collateralToken,
            quoteToken,
            supportedTokens: ajnaSettings.supportedMultiplyTokens[networkId],
          })
          const collateralPrice = isOracless ? one : prices[collateralToken]
          const quotePrice = isOracless ? one : prices[quoteToken]
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
          const weeklyNetApy = isYieldLoop
            ? new BigNumber(
                yieldLoopApys.find((yields) => {
                  return yields?.position?.poolAddress?.toLocaleLowerCase() === address
                })?.results.apy7d || zero,
              )
                .div(lambdaPercentageDenomination)
                .toString()
            : lendApr.toString()

          const primaryTokenGroup = getTokenGroup(collateralToken)
          const secondaryTokenGroup = getTokenGroup(quoteToken)

          const weeklyRewards = ajnaWeeklyRewards[networkId]?.[`${collateralToken}-${quoteToken}`]
          const borrowRewardsApy = weeklyRewards
            ? weeklyRewards.amount
                .times(weeklyRewards.borrowShare)
                .times(prices.AJNA)
                .div(debt.times(quotePrice))
                .div(7)
                .times(365)
            : zero
          const earnRewardsApy = weeklyRewards
            ? weeklyRewards.amount
                .times(weeklyRewards.earnShare)
                .times(prices.AJNA)
                .div(summerDepositAmountEarningInterest.times(quotePrice))
                .div(7)
                .times(365)
            : zero

          return {
            table: [
              ...v.table,
              {
                label,
                network,
                primaryToken: collateralToken,
                ...(primaryTokenGroup !== collateralToken && { primaryTokenGroup }),
                product: [
                  OmniProductType.Borrow,
                  ...(!isYieldLoop && isWithMultiply ? [OmniProductType.Multiply] : []),
                  ...(isYieldLoop && isWithMultiply ? [OmniProductType.Earn] : []),
                ],
                protocol,
                secondaryToken: quoteToken,
                ...(secondaryTokenGroup !== quoteToken && { secondaryTokenGroup }),
                depositToken: collateralToken,
                fee,
                liquidity,
                ...(isPoolNotEmpty &&
                  !isOracless && {
                    maxLtv,
                    maxMultiply,
                  }),
                multiplyStrategy,
                multiplyStrategyType,
                ...(isYieldLoop && {
                  earnStrategy: EarnStrategies.yield_loop,
                  earnStrategyDescription: earnYieldLoopStrategy,
                  managementType,
                  weeklyNetApy,
                }),
                primaryTokenAddress: collateralTokenAddress.toLowerCase(),
                secondaryTokenAddress: quoteTokenAddress.toLowerCase(),
                hasRewards: isPoolWithRewards({ collateralToken, networkId, quoteToken }),
                automationFeatures: settings.availableAutomations[networkId],
                tooltips: {
                  ...(weeklyRewards && {
                    fee: {
                      content: {
                        title: {
                          key: 'ajna.product-hub-tooltips.ajna-rewards-title',
                        },
                        description: {
                          key: isOracless
                            ? 'ajna.product-hub-tooltips.ajna-rewards-oracless'
                            : 'ajna.product-hub-tooltips.ajna-rewards-description',
                          props: {
                            weekly: weeklyRewards.amount.toString(),
                            apy: formatDecimalAsPercent(borrowRewardsApy),
                          },
                        },
                      },
                      icon: 'sparks',
                    },
                    ...(isPoolNotEmpty && {
                      weeklyNetApy: {
                        content: {
                          title: {
                            key: 'ajna.product-hub-tooltips.ajna-rewards-title',
                          },
                          description: {
                            key: isOracless
                              ? 'ajna.product-hub-tooltips.ajna-rewards-oracless'
                              : 'ajna.product-hub-tooltips.ajna-rewards-description',
                            props: {
                              weekly: weeklyRewards.amount.toString(),
                              apy: formatDecimalAsPercent(earnRewardsApy),
                            },
                          },
                        },
                        icon: 'sparks',
                      },
                    }),
                  }),
                  ...(!isOracless &&
                    !isPoolNotEmpty && {
                      maxLtv: productHubAjnaEmptyPoolMaxLtvTooltip,
                      maxMultiply: productHubAjnaEmptyPoolMaxMultipleTooltip,
                    }),
                  ...(!isPoolNotEmpty && {
                    weeklyNetApy: productHubAjnaEmptyPoolWeeklyApyTooltip,
                  }),
                  ...(isOracless && {
                    maxLtv: productHubAjnaOraclessLtvTooltip,
                  }),
                },
              },
              {
                label,
                network,
                primaryToken: quoteToken,
                ...(secondaryTokenGroup !== quoteToken && {
                  primaryTokenGroup: secondaryTokenGroup,
                }),
                product: [OmniProductType.Earn],
                protocol,
                secondaryToken: collateralToken,
                ...(primaryTokenGroup !== collateralToken && {
                  secondaryTokenGroup: primaryTokenGroup,
                }),
                depositToken: quoteToken,
                earnStrategy: EarnStrategies.liquidity_provision,
                earnStrategyDescription: earnLPStrategy,
                liquidity,
                managementType,
                ...(isPoolNotEmpty && {
                  weeklyNetApy,
                }),
                reverseTokens: true,
                primaryTokenAddress: quoteTokenAddress.toLowerCase(),
                secondaryTokenAddress: collateralTokenAddress.toLowerCase(),
                hasRewards: isPoolWithRewards({ collateralToken, networkId, quoteToken }),
                tooltips: {
                  ...(!isPoolNotEmpty && {
                    weeklyNetApy: productHubAjnaEmptyPoolWeeklyApyTooltip,
                  }),
                  ...(weeklyRewards && {
                    weeklyNetApy: {
                      content: {
                        title: {
                          key: 'ajna.product-hub-tooltips.ajna-rewards-title',
                        },
                        description: {
                          key: isOracless
                            ? 'ajna.product-hub-tooltips.ajna-rewards-oracless'
                            : 'ajna.product-hub-tooltips.ajna-rewards-description',
                          props: {
                            weekly: weeklyRewards.amount.toString(),
                            apy: formatDecimalAsPercent(earnRewardsApy),
                          },
                        },
                      },
                      icon: 'sparks',
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
    getAjnaPoolData(NetworkIds.BASEMAINNET, tickers),
    getAjnaPoolData(NetworkIds.ARBITRUMMAINNET, tickers),
    getAjnaPoolData(NetworkIds.OPTIMISMMAINNET, tickers),
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
