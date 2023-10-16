import { ethers } from 'ethers'
import type { BorrowFormState } from 'features/ajna/positions/borrow/state/borrowFormReducto.types'

export const borrowFormReset = {
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

export const borrowFormDefault: BorrowFormState = {
  ...borrowFormReset,
  dpmAddress: ethers.constants.AddressZero,
  uiDropdown: 'collateral',
  uiPill: 'deposit-borrow',
  closeTo: 'collateral',
}
