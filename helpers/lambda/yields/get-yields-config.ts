import dayjs from 'dayjs'
import { lambdaPercentageDenomination } from 'features/aave/constants'
import { LendingProtocol } from 'lendingProtocols'

import type { GetYieldsParams } from './get-yields-types'

export const getYieldsConfig = ({
  networkId,
  protocol,
  ltv,
  quoteTokenAddress,
  collateralTokenAddress,
  referenceDate,
  actionSource,
}: GetYieldsParams) => {
  const debugGetYieldsConfig = false
  const protocolQuery = {
    [LendingProtocol.AaveV2]: 'aave-v2',
    [LendingProtocol.AaveV3]: 'aave-v3',
    [LendingProtocol.SparkV3]: 'spark',
    [LendingProtocol.Ajna]: 'ajna',
    [LendingProtocol.Maker]: 'maker', // shouldnt happen
    [LendingProtocol.MorphoBlue]: 'morpho-blue',
  }[protocol]
  const quoteTokenQuery = `&debt=${quoteTokenAddress}`
  const collateralTokenQuery = `&collateral=${collateralTokenAddress}`
  const ltvQuery = `&ltv=${ltv
    .times(lambdaPercentageDenomination * lambdaPercentageDenomination)
    .toFixed(0)
    .toString()}`
  const referenceDateQuery = `&referenceDate=${dayjs(referenceDate).format('YYYY-MM-DD')}`
  if (actionSource && debugGetYieldsConfig) {
    console.info(
      'actionSource getYieldsConfig',
      JSON.stringify(
        {
          quoteTokenQuery,
          collateralTokenQuery,
          ltvQuery,
          referenceDateQuery,
          actionSource,
        },
        null,
        2,
      ),
    )
  }
  return {
    url: `/api/apy/${networkId}/${protocolQuery}?${[quoteTokenQuery, collateralTokenQuery, ltvQuery, referenceDateQuery].join('')}`,
  }
}
