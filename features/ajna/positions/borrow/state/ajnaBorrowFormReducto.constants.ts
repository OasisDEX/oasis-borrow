import { ethers } from 'ethers'

import type { AjnaBorrowFormState } from './ajnaBorrowFormReducto.types'

export const ajnaBorrowReset = {
  depositAmount: undefined,
  depositAmountUSD: undefined,
  generateAmount: undefined,
  generateAmountUSD: undefined,
  paybackAmount: undefined,
  paybackAmountUSD: undefined,
  paybackAmountMax: false,
  withdrawAmount: undefined,
  withdrawAmountUSD: undefined,
}

export const ajnaBorrowDefault: AjnaBorrowFormState = {
  ...ajnaBorrowReset,
  dpmAddress: ethers.constants.AddressZero,
  uiDropdown: 'collateral',
  uiPill: 'deposit-borrow',
  closeTo: 'collateral',
}
