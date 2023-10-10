import { ethers } from 'ethers'

import type { AjnaMultiplyFormState } from './ajnaMultiplyFormReducto.types'

export const ajnaMultiplyReset = {
  depositAmount: undefined,
  depositAmountUSD: undefined,
  generateAmount: undefined,
  generateAmountUSD: undefined,
  paybackAmount: undefined,
  paybackAmountUSD: undefined,
  paybackAmountMax: false,
  withdrawAmount: undefined,
  withdrawAmountUSD: undefined,
  loanToValue: undefined,
}

export const ajnaMultiplyDefault: AjnaMultiplyFormState = {
  ...ajnaMultiplyReset,
  closeTo: 'collateral',
  dpmAddress: ethers.constants.AddressZero,
  uiDropdown: 'adjust',
  uiPill: 'deposit-collateral-multiply',
}
