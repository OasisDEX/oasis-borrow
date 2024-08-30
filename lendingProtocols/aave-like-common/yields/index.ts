import type BigNumber from 'bignumber.js'
import type { GetYieldsResponseMapped } from 'helpers/lambda/yields'

export type FilterYieldFieldsType =
  | '7Days'
  | '7DaysOffset'
  | '30Days'
  | '90Days'
  | '90DaysOffset'
  | '1Year'
  | 'Inception'
export const yieldsDateFormat = 'YYYY-MM-DD'

export interface AaveLikeYieldsResponse {
  annualisedYield7days?: BigNumber
  annualisedYield7daysOffset?: BigNumber
  annualisedYield30days?: BigNumber
  annualisedYield90days?: BigNumber
  annualisedYield90daysOffset?: BigNumber
  annualisedYield1Year?: BigNumber
  annualisedYieldSinceInception?: BigNumber
}

export function has7daysYield(
  yields: GetYieldsResponseMapped,
): yields is Required<Pick<GetYieldsResponseMapped, 'apy1d' | 'apy7d'>> {
  return !!yields.apy7d
}

export function has90daysYield(
  yields: GetYieldsResponseMapped,
): yields is Required<Pick<GetYieldsResponseMapped, 'apy1d' | 'apy7d' | 'apy90d'>> {
  return !!yields.apy90d
}
