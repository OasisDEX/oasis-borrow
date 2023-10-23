import { ethers } from 'ethers'
import type { OmniBorrowFormState } from 'features/omni-kit/state/borrow'

export const omniBorrowFormReset = {
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

export const omniBorrowFormDefault: OmniBorrowFormState = {
  ...omniBorrowFormReset,
  dpmAddress: ethers.constants.AddressZero,
  uiDropdown: 'collateral',
  uiPill: 'deposit-borrow',
  closeTo: 'collateral',
}
