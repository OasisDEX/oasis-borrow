import { lambdaPercentageDenomination } from 'features/aave/constants'

import type { GetYieldsParams } from './get-yields-types'

export const getYieldsConfig = ({
  network,
  protocol,
  ltv,
  quoteToken,
  collateralToken,
}: GetYieldsParams) => {
  const ltvQuery = ltv.times(lambdaPercentageDenomination).toFixed(4).toString()
  return {
    url: `/api/apy/${network}/${protocol}/${quoteToken}-${collateralToken}/${ltvQuery}`,
  }
}
