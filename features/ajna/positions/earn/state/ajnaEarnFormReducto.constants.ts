import { ethers } from 'ethers'
import type { EarnFormState } from 'features/ajna/positions/earn/state/earnFormReducto.types'

export const earnFormReset = {
  depositAmount: undefined,
  depositAmountUSD: undefined,
  withdrawAmount: undefined,
  withdrawAmountUSD: undefined,
}

export const earnFormDefault: EarnFormState = {
  ...earnFormReset,
  dpmAddress: ethers.constants.AddressZero,
  uiDropdown: 'adjust',
  uiPill: 'deposit-earn',
}
