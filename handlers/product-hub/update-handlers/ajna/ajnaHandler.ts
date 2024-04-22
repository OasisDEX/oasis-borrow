import { getPoolLiquidity } from '@oasisdex/dma-library'
import { EarnStrategies } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds, networksById } from 'blockchain/networks'
import { getTokenPrice } from 'blockchain/prices'
import type { Tickers } from 'blockchain/prices.types'
import { NEGATIVE_WAD_PRECISION, WAD_PRECISION } from 'components/constants'
import { isShortPosition } from 'features/omni-kit/helpers'
import { isYieldLoopPair } from 'features/omni-kit/helpers/isYieldLoopPair'
import type { AjnaPoolsTableData } from 'features/omni-kit/protocols/ajna/helpers'
import {
  getAjnaPoolsData,
  isPoolOracless,
  isPoolSupportingMultiply,
  isPoolWithRewards,
} from 'features/omni-kit/protocols/ajna/helpers'
import { settings as ajnaSettings } from 'features/omni-kit/protocols/ajna/settings'
import {
  productHubAjnaRewardsTooltip,
  productHubEmptyPoolMaxLtvTooltip,
  productHubEmptyPoolMaxMultipleTooltip,
  productHubEmptyPoolWeeklyApyTooltip,
  productHubOraclessLtvTooltip,
} from 'features/productHub/content'
import type { ProductHubSupportedNetworks } from 'features/productHub/types'
import { ProductHubProductType } from 'features/productHub/types'
import { getTokenGroup } from 'handlers/product-hub/helpers'
import type {
  ProductHubHandlerResponse,
  ProductHubHandlerResponseData,
} from 'handlers/product-hub/types'
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

  const prices = uniq(
    Object.keys(getNetworkContracts(networkId).ajnaPoolPairs).flatMap((pair) => pair.split('-')),
  ).reduce<Tickers>(
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
      const { lowestUtilizedPrice, quoteTokenAddress, collateralTokenAddress, address } = poolData
      const isOracless = isPoolOracless({ networkId, collateralToken, quoteToken })
      const collateralPrice = isOracless ? one : prices[collateralToken]
      const quotePrice = isOracless ? one : prices[quoteToken]
      const marketPrice = collateralPrice.div(quotePrice)
      const maxLtv = lowestUtilizedPrice.div(marketPrice)

      return await getYieldsRequest(
        {
          collateralTokenAddress,
          quoteTokenAddress,
          quoteToken,
          collateralToken,
          networkId,
          protocol: LendingProtocol.Ajna,
          referenceDate: new Date(),
          ltv: maxLtv,
          poolAddress: address,
        },
        process.env.FUNCTIONS_API_URL,
      )
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
              lowestUtilizedPrice,
              lowestUtilizedPriceIndex,
              lendApr,
              quoteTokenAddress,
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
            ? yieldLoopApys
                .find((yields) => {
                  return yields?.position.poolAddress?.toLocaleLowerCase() === address
                })
                ?.results.apy7d.toString()
            : lendApr.toString()

          const primaryTokenGroup = getTokenGroup(collateralToken)
          const secondaryTokenGroup = getTokenGroup(quoteToken)

          return {
            table: [
              ...v.table,
              {
                label,
                network,
                primaryToken: collateralToken,
                ...(primaryTokenGroup !== collateralToken && { primaryTokenGroup }),
                product: [
                  ProductHubProductType.Borrow,
                  ...(!isYieldLoop && isWithMultiply ? [ProductHubProductType.Multiply] : []),
                  ...(isYieldLoop && isWithMultiply ? [ProductHubProductType.Earn] : []),
                ],
                protocol,
                secondaryToken: quoteToken,
                ...(secondaryTokenGroup !== quoteToken && { secondaryTokenGroup }),
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
                  ...(isPoolNotEmpty && {
                    weeklyNetApy,
                  }),
                }),
                primaryTokenAddress: collateralTokenAddress.toLowerCase(),
                secondaryTokenAddress: quoteTokenAddress.toLowerCase(),
                hasRewards: isPoolWithRewards({ collateralToken, networkId, quoteToken }),
                tooltips: {
                  ...(isPoolWithRewards({ collateralToken, networkId, quoteToken }) && {
                    fee: productHubAjnaRewardsTooltip,
                    ...(isPoolNotEmpty && {
                      weeklyNetApy: productHubAjnaRewardsTooltip,
                    }),
                  }),
                  ...(!isOracless &&
                    !isPoolNotEmpty && {
                      maxLtv: productHubEmptyPoolMaxLtvTooltip,
                      maxMultiply: productHubEmptyPoolMaxMultipleTooltip,
                    }),
                  ...(!isPoolNotEmpty && {
                    weeklyNetApy: productHubEmptyPoolWeeklyApyTooltip,
                  }),
                  ...(isOracless && {
                    maxLtv: productHubOraclessLtvTooltip,
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
                product: [ProductHubProductType.Earn],
                protocol,
                secondaryToken: collateralToken,
                ...(primaryTokenGroup !== collateralToken && {
                  secondaryTokenGroup: primaryTokenGroup,
                }),
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
                    weeklyNetApy: productHubEmptyPoolWeeklyApyTooltip,
                  }),
                  ...(isPoolWithRewards({ collateralToken, networkId, quoteToken }) && {
                    weeklyNetApy: productHubAjnaRewardsTooltip,
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
    // getAjnaPoolData(NetworkIds.BASEMAINNET, tickers),
    // getAjnaPoolData(NetworkIds.ARBITRUMMAINNET, tickers),
    // getAjnaPoolData(NetworkIds.OPTIMISMMAINNET, tickers),
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
