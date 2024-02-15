import { getPoolLiquidity } from '@oasisdex/dma-library'
import { EarnStrategies } from '@prisma/client'
import BigNumber from 'bignumber.js'
import type { IdentifiedTokens } from 'blockchain/identifyTokens.types'
import type { Tickers } from 'blockchain/prices.types'
import { NEGATIVE_WAD_PRECISION, WAD_PRECISION } from 'components/constants'
import type { SearchAjnaPoolData } from 'features/ajna/pool-finder/helpers'
import type { OraclessPoolResult } from 'features/ajna/pool-finder/types'
import { isPoolOracless, isPoolWithRewards } from 'features/omni-kit/protocols/ajna/helpers'
import type { AjnaSupportedNetworkIds } from 'features/omni-kit/protocols/ajna/types'
import {
  productHubAjnaRewardsTooltip,
  productHubEmptyPoolMaxLtvTooltip,
  productHubEmptyPoolWeeklyApyTooltip,
  productHubOraclessLtvTooltip,
} from 'features/productHub/content'
import { formatCryptoBalance, shortenTokenSymbol } from 'helpers/formatters/format'
import { one } from 'helpers/zero'

export function parsePoolResponse(
  networkId: AjnaSupportedNetworkIds,
  identifiedTokens: IdentifiedTokens,
  pools: SearchAjnaPoolData[],
  prices: Tickers,
): OraclessPoolResult[] {
  return pools
    .filter(
      ({ collateralAddress, quoteTokenAddress }) =>
        Object.keys(identifiedTokens).includes(collateralAddress) &&
        Object.keys(identifiedTokens).includes(quoteTokenAddress),
    )
    .map(
      ({
        buckets,
        collateralAddress,
        debt,
        interestRate,
        lendApr,
        lowestUtilizedPrice,
        lowestUtilizedPriceIndex,
        quoteTokenAddress,
      }) => {
        const collateralToken = identifiedTokens[collateralAddress.toLowerCase()].symbol
        const quoteToken = identifiedTokens[quoteTokenAddress.toLowerCase()].symbol
        const isPoolNotEmpty = lowestUtilizedPriceIndex > 0
        const isOracless = isPoolOracless({ networkId, collateralToken, quoteToken })
        const collateralPrice = isOracless ? one : prices[collateralToken]
        const quotePrice = isOracless ? one : prices[quoteToken]
        const marketPrice = collateralPrice.div(quotePrice)
        const maxLtv = lowestUtilizedPrice.div(marketPrice).toString()
        const liquidity = formatCryptoBalance(
          getPoolLiquidity({
            buckets: buckets.map((bucket) => ({
              ...bucket,
              index: new BigNumber(bucket.index),
              quoteTokens: new BigNumber(bucket.quoteTokens),
            })),
            debt: debt.shiftedBy(WAD_PRECISION),
          }).shiftedBy(NEGATIVE_WAD_PRECISION),
        )
        const fee = interestRate.toString()
        const weeklyNetApy = lendApr.toString()

        const resolvedCollateralToken = shortenTokenSymbol({ token: collateralToken })
        const resolvedQuoteToken = shortenTokenSymbol({ token: collateralToken })

        return {
          ...(isPoolNotEmpty &&
            !isOracless && {
              maxLtv,
            }),
          ...(isPoolNotEmpty && {
            weeklyNetApy,
          }),
          liquidity,
          earnStrategy: EarnStrategies.liquidity_provision,
          earnStrategyDescription: `${resolvedCollateralToken}/${resolvedQuoteToken} LP`,
          fee,
          managementType: 'active',
          networkId,
          collateralAddress: collateralAddress,
          collateralToken: identifiedTokens[collateralAddress.toLowerCase()].symbol,
          collateralIcon:
            identifiedTokens[collateralAddress.toLowerCase()].source === 'blockchain'
              ? collateralAddress
              : collateralToken,
          quoteAddress: quoteTokenAddress,
          quoteToken: identifiedTokens[quoteTokenAddress.toLowerCase()].symbol,
          quoteIcon:
            identifiedTokens[quoteTokenAddress.toLowerCase()].source === 'blockchain'
              ? quoteTokenAddress
              : quoteToken,
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
              }),
            ...(!isPoolNotEmpty && {
              weeklyNetApy: productHubEmptyPoolWeeklyApyTooltip,
            }),
            ...(isOracless && {
              maxLtv: productHubOraclessLtvTooltip,
            }),
          },
        }
      },
    )
}
