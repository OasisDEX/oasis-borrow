import BigNumber from 'bignumber.js'
import { one } from 'helpers/zero'

interface GetMorphoLiquidationPenaltyParams {
  maxLtv: BigNumber
}

const M = new BigNumber(1.15)
const BETA = new BigNumber(0.3)

export const getMorphoLiquidationPenalty = ({ maxLtv }: GetMorphoLiquidationPenaltyParams) => {
  return BigNumber.min(M, one.div(BETA.times(maxLtv).plus(one.minus(BETA)))).minus(one)
}
