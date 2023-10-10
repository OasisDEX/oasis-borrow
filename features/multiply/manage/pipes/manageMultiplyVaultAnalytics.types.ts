import type BigNumber from 'bignumber.js'

import type { CloseVaultTo } from './CloseVaultTo.types'

export type AdjustPositionConfirm = {
  kind: 'adjustPositionConfirm'
  value: {
    ilk: string
    multiply: string
  }
}
export type AdjustPositionConfirmTransaction = {
  kind: 'adjustPositionConfirmTransaction'
  value: {
    ilk: string
    multiply: string
    txHash: string
    oasisFee: string
  }
}
export type OtherActionsConfirm = {
  kind: 'otherActionsConfirm'
  value: {
    ilk: string
    collateralAmount: BigNumber
    daiAmount: BigNumber
  }
}
export type OtherActionsConfirmTransaction = {
  kind: 'otherActionsConfirmTransaction'
  value: {
    ilk: string
    collateralAmount: BigNumber
    daiAmount: BigNumber
    txHash: string
    oasisFee: string
  }
}
export type CloseVaultConfirm = {
  kind: 'closeVaultConfirm'
  value: {
    ilk: string
    debt: string
    closeTo: CloseVaultTo
    txHash: string
  }
}
export type CloseVaultConfirmTransaction = {
  kind: 'closeVaultConfirmTransaction'
  value: {
    ilk: string
    debt: string
    closeTo: CloseVaultTo
    txHash: string
    oasisFee: string
  }
}
export type ManageMultiplyConfirmTransaction =
  | AdjustPositionConfirmTransaction
  | OtherActionsConfirmTransaction
  | CloseVaultConfirmTransaction
export type ManageMultiplyConfirm = AdjustPositionConfirm | OtherActionsConfirm | CloseVaultConfirm
