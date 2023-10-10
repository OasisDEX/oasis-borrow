import { ethers } from 'ethers'

import type { AjnaEarnFormState } from './ajnaEarnFormReducto.types'

export const ajnaEarnReset = {
  depositAmount: undefined,
  depositAmountUSD: undefined,
  withdrawAmount: undefined,
  withdrawAmountUSD: undefined,
}

export const ajnaEarnDefault: AjnaEarnFormState = {
  ...ajnaEarnReset,
  dpmAddress: ethers.constants.AddressZero,
  uiDropdown: 'adjust',
  uiPill: 'deposit-earn',
}
