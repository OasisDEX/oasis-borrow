import { calculateAjnaApyPerDays } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds, NetworkNames } from 'blockchain/networks'
import { getTokenPrice, Tickers } from 'blockchain/prices'
import { getTokenSymbolFromAddress } from 'blockchain/tokensMetadata'
import {
  AjnaPoolsTableData,
  getAjnaPoolsTableData,
} from 'features/ajna/positions/common/helpers/getAjnaPoolsTableData'
import { isShortPosition } from 'features/ajna/positions/common/helpers/isShortPosition'
import { ProductHubItem, ProductHubProductType } from 'features/productHub/types'
import { getTokenGroup } from 'handlers/product-hub/helpers'
import { ProductHubHandlerResponse } from 'handlers/product-hub/types'
import { one, zero } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'
import { uniq } from 'lodash'
import getConfig from 'next/config'

export default async function (): ProductHubHandlerResponse {
  // TODO: replace this with loading data for both mainnet and testnet
  const networkId = NetworkIds.GOERLI
  const networkName = NetworkNames.ethereumGoerli

  const supportedPairs = Object.keys(getNetworkContracts(networkId).ajnaPoolPairs)
  const tokens = uniq(supportedPairs.flatMap((pair) => pair.split('-')))
  const tickers = (await (
    await fetch(`${getConfig()?.publicRuntimeConfig?.basePath}/api/tokensPrices`)
  ).json()) as Tickers
  const prices = tokens.reduce<{ [key: string]: BigNumber }>(
    (v, token) => ({ ...v, [token]: new BigNumber(getTokenPrice(token, tickers)) }),
    {},
  )

  return (await getAjnaPoolsTableData(networkName))
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
    .reduce<ProductHubItem[]>(
      (
        v,
        {
          pair: [collateralToken, quoteToken],
          pool: {
            dailyPercentageRate30dAverage,
            debt,
            depositSize,
            interestRate,
            lowestUtilizedPrice,
          },
        },
      ) => {
        const isShort = isShortPosition({ collateralToken })
        const collateralPrice = prices[collateralToken]
        const quotePrice = prices[quoteToken]
        const marketPrice = collateralPrice.div(quotePrice)
        const label = `${collateralToken}/${quoteToken}`
        const maxLtv = lowestUtilizedPrice.div(marketPrice).toString()
        const liquidity = depositSize.minus(debt).times(prices[quoteToken]).toString()
        const fee = interestRate.toString()
        const multiplyStrategy = isShort ? `Short ${quoteToken}` : `Long ${collateralToken}`
        const multiplyStrategyType = isShort ? 'short' : 'long'
        const maxMultiply = BigNumber.max(
          one.plus(one.div(one.div(maxLtv).minus(one))),
          zero,
        ).toString()
        const earnStrategy = `${collateralToken}/${quoteToken} LP`
        const managementType = 'active'
        const weeklyNetApy = calculateAjnaApyPerDays(
          depositSize,
          dailyPercentageRate30dAverage,
          7,
        ).toString()

        return [
          ...v,
          {
            label,
            network: NetworkNames.ethereumMainnet,
            primaryToken: collateralToken,
            ...getTokenGroup(collateralToken, 'primary'),
            product: [ProductHubProductType.Borrow, ProductHubProductType.Multiply],
            protocol: LendingProtocol.Ajna,
            secondaryToken: quoteToken,
            ...getTokenGroup(quoteToken, 'secondary'),
            fee,
            liquidity,
            maxLtv,
            maxMultiply,
            multiplyStrategy,
            multiplyStrategyType,
          },
          {
            label,
            network: NetworkNames.ethereumMainnet,
            primaryToken: quoteToken,
            ...getTokenGroup(quoteToken, 'primary'),
            product: [ProductHubProductType.Earn],
            protocol: LendingProtocol.Ajna,
            secondaryToken: collateralToken,
            ...getTokenGroup(collateralToken, 'secondary'),
            earnStrategy,
            liquidity,
            managementType,
            weeklyNetApy,
            reverseTokens: true,
          },
        ]
      },
      [],
    )
}
