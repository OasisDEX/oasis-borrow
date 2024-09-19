import { type NetworkIds, networkSetById } from 'blockchain/networks'
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
  poolAddress,
}: GetYieldsParams) => {
  const debugGetYieldsConfig = process.env.NEXT_PUBLIC_DEBUG_YIELDS
  const protocolQuery = {
    [LendingProtocol.AaveV2]: 'aave-v2',
    [LendingProtocol.AaveV3]: 'aave-v3',
    [LendingProtocol.SparkV3]: 'spark',
    [LendingProtocol.Ajna]: 'ajna',
    [LendingProtocol.Maker]: 'maker', // shouldnt happen
    [LendingProtocol.Sky]: 'sky', // shouldnt happen
    [LendingProtocol.MorphoBlue]: 'morpho-blue',
  }[protocol]
  const morphoMarketId =
    protocol === LendingProtocol.MorphoBlue &&
    morphoMarkets[networkId as NetworkIds.MAINNET]?.[`${collateralToken}-${quoteToken}`]?.[0]

  const queryParams = new URLSearchParams()
  quoteTokenAddress && queryParams.append('debt', quoteTokenAddress)
  collateralTokenAddress && queryParams.append('collateral', collateralTokenAddress)
  queryParams.append(
    'ltv',
    ltv
      .times(lambdaPercentageDenomination * lambdaPercentageDenomination)
      .toFixed(0)
      .toString(),
  )
  queryParams.append('referenceDate', dayjs(referenceDate || new Date()).format('YYYY-MM-DD'))
  if (morphoMarketId) {
    queryParams.append('marketId', morphoMarketId)
    queryParams.append('mode', 'borrow')
  }
  if (poolAddress) {
    queryParams.append('poolAddress', poolAddress)
    queryParams.append('mode', 'borrow')
  }

  if (actionSource && debugGetYieldsConfig) {
    console.info(
      'getYieldsConfig',
      JSON.stringify(
        {
          actionSource,
          quoteToken,
          collateralToken,
          network: networkSetById[networkId].name,
          ltv: ltv
            .times(lambdaPercentageDenomination * lambdaPercentageDenomination)
            .toFixed(0)
            .toString(),
          url: `/api/apy/${networkId}/${protocolQuery}?${queryParams.toString()}`,
        },
        null,
        2,
      ),
    )
  }
  return {
    url: `/api/apy/${networkId}/${protocolQuery}?${queryParams.toString()}`,
  }
}
