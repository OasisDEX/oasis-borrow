import { ethers } from 'ethers'
import type { OmniMultiplyFormState } from 'features/omni-kit/state/multiply'
import { OmniMultiplyFormAction } from 'features/omni-kit/types'

export const omniMultiplyFormReset = {
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

export const omniMultiplyFormDefault: OmniMultiplyFormState = {
  ...omniMultiplyFormReset,
  closeTo: 'collateral',
  dpmAddress: ethers.constants.AddressZero,
  uiDropdown: 'adjust',
  uiPill: OmniMultiplyFormAction.DepositCollateralMultiply,
}
