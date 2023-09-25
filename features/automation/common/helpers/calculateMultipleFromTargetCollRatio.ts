import type BigNumber from 'bignumber.js'
import { one } from 'helpers/zero'

export function calculateMultipleFromTargetCollRatio(targetCollRatio: BigNumber) {
  return one.div(targetCollRatio.div(100).minus(one)).plus(one)
}
