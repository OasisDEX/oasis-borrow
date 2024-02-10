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

export function has7daysYield(
  yields: AaveLikeYieldsResponse,
  withOffset: boolean = true,
): yields is Required<
  Pick<AaveLikeYieldsResponse, 'annualisedYield7days' | 'annualisedYield7daysOffset'>
> {
  if (withOffset) {
    return (
      yields.annualisedYield7days !== undefined && yields.annualisedYield7daysOffset !== undefined
    )
  }
  return yields.annualisedYield7days !== undefined
}

export function has90daysYield(
  yields: AaveLikeYieldsResponse,
): yields is Required<
  Pick<AaveLikeYieldsResponse, 'annualisedYield90days' | 'annualisedYield90daysOffset'>
> {
  return (
    yields.annualisedYield90days !== undefined && yields.annualisedYield90daysOffset !== undefined
  )
}
