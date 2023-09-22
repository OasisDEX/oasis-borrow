import type BigNumber from 'bignumber.js'

import type { MutableOpenVaultState } from './openVault.types'

export type GenerateAmountChange = {
  kind: 'generateAmountChange'
  value: BigNumber
}
export type DepositAmountChange = {
  kind: 'depositAmountChange'
  value: BigNumber
}
export type AllowanceChange = {
  kind: 'allowanceChange'
  value: {
    type: Pick<MutableOpenVaultState, 'selectedAllowanceRadio'>
    amount: BigNumber
  }
}
export type OpenVaultConfirm = {
  kind: 'openVaultConfirm'
  value: {
    ilk: string
    collateralAmount: BigNumber
    daiAmount: BigNumber
  }
}
export type OpenVaultConfirmTransaction = {
  kind: 'openVaultConfirmTransaction'
  value: {
    ilk: string
    collateralAmount: BigNumber
    daiAmount: BigNumber
    txHash: string
  }
}
