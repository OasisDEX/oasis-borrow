import BigNumber from 'bignumber.js'

interface AjnaEarnWithdrawMaxParams {
  quoteTokenAmount: BigNumber
  digits: number
}

export function getAjnaEarnWithdrawMax({ quoteTokenAmount, digits }: AjnaEarnWithdrawMaxParams) {
  return quoteTokenAmount.decimalPlaces(digits, BigNumber.ROUND_UP)
}
