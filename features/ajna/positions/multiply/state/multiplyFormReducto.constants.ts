import { ethers } from 'ethers'
import type { MultiplyFormState } from 'features/ajna/positions/multiply/state/multiplyFormReducto.types'

export const multiplyReset = {
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

export const multiplyFormDefault: MultiplyFormState = {
  ...multiplyReset,
  closeTo: 'collateral',
  dpmAddress: ethers.constants.AddressZero,
  uiDropdown: 'adjust',
  uiPill: 'deposit-collateral-multiply',
}
