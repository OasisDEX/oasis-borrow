import type BigNumber from 'bignumber.js'

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
