import type { NetworkIds } from 'blockchain/networks'
import dayjs from 'dayjs'
import { lambdaPercentageDenomination } from 'features/aave/constants'
import { morphoMarkets } from 'features/omni-kit/protocols/morpho-blue/settings'
import { LendingProtocol } from 'lendingProtocols'

import type { GetYieldsParams } from './get-yields-types'

export const getYieldsConfig = ({
  networkId,
  protocol,
  ltv,
  quoteTokenAddress,
  collateralTokenAddress,
  collateralToken,
  quoteToken,
  referenceDate,
  actionSource,
}: GetYieldsParams) => {
  const debugGetYieldsConfig = true
  const protocolQuery = {
    [LendingProtocol.AaveV2]: 'aave-v2',
    [LendingProtocol.AaveV3]: 'aave-v3',
    [LendingProtocol.SparkV3]: 'spark',
    [LendingProtocol.Ajna]: 'ajna',
    [LendingProtocol.Maker]: 'maker', // shouldnt happen
    [LendingProtocol.MorphoBlue]: 'morpho-blue',
  }[protocol]
  // optional data
  const morphoMarketId =
    morphoMarkets[networkId as NetworkIds.MAINNET]?.[`${collateralToken}-${quoteToken}`]?.[0]

  // query params
  const quoteTokenQuery = `&debt=${quoteTokenAddress}`
  const collateralTokenQuery = `&collateral=${collateralTokenAddress}`
  const ltvQuery = `&ltv=${ltv
    .times(lambdaPercentageDenomination * lambdaPercentageDenomination)
    .toFixed(0)
    .toString()}`
  const referenceDateQuery = `&referenceDate=${dayjs(referenceDate).format('YYYY-MM-DD')}`
  const morphoMarketIdQuery = morphoMarketId ? `&marketId=${morphoMarketId}` : ''
  const modeQuery = morphoMarketId ? `&mode=borrow` : ''

  if (actionSource && debugGetYieldsConfig) {
    console.info(
      'getYieldsConfig',
      JSON.stringify(
        {
          quoteTokenQuery,
          collateralTokenQuery,
          ltvQuery,
          referenceDateQuery,
          morphoMarketIdQuery,
          modeQuery,
          actionSource,
        },
        null,
        2,
      ),
    )
  }
  return {
    url: `/api/apy/${networkId}/${protocolQuery}?${[
      quoteTokenQuery,
      collateralTokenQuery,
      ltvQuery,
      referenceDateQuery,
      morphoMarketIdQuery,
      modeQuery,
    ].join('')}`,
  }
}
