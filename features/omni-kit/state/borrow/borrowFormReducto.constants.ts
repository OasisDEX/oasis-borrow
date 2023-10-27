import { ethers } from 'ethers'
import type { OmniBorrowFormState } from 'features/omni-kit/state/borrow'
import {
  OmniBorrowFormAction,
  OmniProductType,
  OmniSidebarBorrowPanel,
} from 'features/omni-kit/types'

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
  productType: OmniProductType.Borrow,
  dpmAddress: ethers.constants.AddressZero,
  uiDropdown: OmniSidebarBorrowPanel.Collateral,
  uiPill: OmniBorrowFormAction.DepositBorrow,
  closeTo: 'collateral',
}
