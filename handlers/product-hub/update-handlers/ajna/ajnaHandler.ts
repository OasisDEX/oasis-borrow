import { calculateAjnaApyPerDays } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds, networksById } from 'blockchain/networks'
import { getTokenPrice, Tickers } from 'blockchain/prices'
import { getTokenSymbolFromAddress } from 'blockchain/tokensMetadata'
import { WAD_PRECISION } from 'components/constants'
import {
  AjnaPoolsTableData,
  getAjnaPoolsTableData,
} from 'features/ajna/positions/common/helpers/getAjnaPoolsTableData'
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
import getConfig from 'next/config'

async function getAjnaPoolData(
  networkId: NetworkIds.MAINNET | NetworkIds.GOERLI,
): Promise<ProductHubHandlerResponseData> {
  const supportedPairs = Object.keys(getNetworkContracts(networkId).ajnaPoolPairs)
  const tokens = uniq(supportedPairs.flatMap((pair) => pair.split('-')))
  const tickers = (await (
    await fetch(`${getConfig()?.publicRuntimeConfig?.basePath}/api/tokensPrices`)
  ).json()) as Tickers
  const prices = tokens.reduce<{ [key: string]: BigNumber }>(
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
              dailyPercentageRate30dAverage,
              debt,
              depositSize,
              interestRate,
              highestThresholdPriceIndex,
              lowestUtilizedPrice,
              lowestUtilizedPriceIndex,
            },
          },
        ) => {
          const negativeWadPrecision = WAD_PRECISION * -1
          const isShort = isShortPosition({ collateralToken })
          const isYieldLoop = isYieldLoopPool({ collateralToken, quoteToken })
          const collateralPrice = prices[collateralToken]
          const quotePrice = prices[quoteToken]
          const marketPrice = collateralPrice.div(quotePrice)
          const label = `${collateralToken}/${quoteToken}`
          const network = networksById[networkId].name as ProductHubSupportedNetworks
          const protocol = LendingProtocol.Ajna
          const maxLtv = lowestUtilizedPrice.div(marketPrice).toString()
          const liquidity = buckets
            .filter((bucket) => new BigNumber(bucket.index).lte(highestThresholdPriceIndex))
            .reduce((acc, bucket) => acc.plus(bucket.quoteTokens), zero)
            .minus(debt)
            .times(prices[quoteToken])
            .shiftedBy(negativeWadPrecision)
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
          const weeklyNetApy = calculateAjnaApyPerDays(
            depositSize,
            dailyPercentageRate30dAverage,
            7,
          ).toString()

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
                ...(lowestUtilizedPriceIndex > 0 && {
                  maxLtv,
                  maxMultiply,
                }),
                multiplyStrategy,
                multiplyStrategyType,
                ...(isYieldLoop && {
                  earnStrategy: earnYieldLoopStrategy,
                  managementType,
                  weeklyNetApy,
                }),
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
                weeklyNetApy,
                reverseTokens: true,
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

export default async function (): ProductHubHandlerResponse {
  return Promise.all([
    getAjnaPoolData(NetworkIds.MAINNET),
    getAjnaPoolData(NetworkIds.GOERLI),
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
