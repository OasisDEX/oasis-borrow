import { ethers } from 'ethers'
import type { OmniEarnFormState } from 'features/omni-kit/state/earn'
import { OmniEarnFormAction, OmniSidebarEarnPanel } from 'features/omni-kit/types'

export const omniEarnFormReset = {
  depositAmount: undefined,
  depositAmountUSD: undefined,
  withdrawAmount: undefined,
  withdrawAmountUSD: undefined,
}

export const omniEarnFormDefault: OmniEarnFormState = {
  ...omniEarnFormReset,
  dpmAddress: ethers.constants.AddressZero,
  uiDropdown: OmniSidebarEarnPanel.Adjust,
  uiPill: OmniEarnFormAction.DepositEarn,
}
