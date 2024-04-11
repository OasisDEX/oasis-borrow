import { lambdaPercentageDenomination } from 'features/aave/constants'

import type { GetYieldsParams } from './get-yields-types'

export const getYieldsConfig = ({
  network,
  protocol,
  ltv,
  quoteToken,
  collateralToken,
}: GetYieldsParams) => {
  return {
    url: `/api/yields/${network}/${protocol}`,
    body: JSON.stringify({
      ltv: ltv.times(lambdaPercentageDenomination).toFixed(4).toString(),
      quoteToken,
      collateralToken,
    }),
  }
}
