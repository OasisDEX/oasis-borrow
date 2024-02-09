import { negativeToZero } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'

interface AjnaEarnWithdrawMaxParams {
  quoteTokenAmount: BigNumber
  digits: number
}

export function getAjnaEarnWithdrawMax({ quoteTokenAmount, digits }: AjnaEarnWithdrawMaxParams) {
  return negativeToZero(quoteTokenAmount.decimalPlaces(digits))
}
