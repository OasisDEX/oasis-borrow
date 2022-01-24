import { Tracker } from 'analytics/analytics'
import BigNumber from 'bignumber.js'
import { networksById } from 'blockchain/config'
import { Context } from 'blockchain/network'
import { zero } from 'helpers/zero'
import { isEqual } from 'lodash'
import { merge, Observable } from 'rxjs'
import { distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators'

import { CloseVaultTo, ManageMultiplyVaultState } from './manageMultiplyVault'

type AdjustPositionConfirm = {
  kind: 'adjustPositionConfirm'
  value: {
    ilk: string
    multiply: string
  }
}

type AdjustPositionConfirmTransaction = {
  kind: 'adjustPositionConfirmTransaction'
  value: {
    ilk: string
    multiply: string
    txHash: string
  }
}

type OtherActionsConfirm = {
  kind: 'otherActionsConfirm'
  value: {
    ilk: string
    collateralAmount: BigNumber
    daiAmount: BigNumber
  }
}

type OtherActionsConfirmTransaction = {
  kind: 'otherActionsConfirmTransaction'
  value: {
    ilk: string
    collateralAmount: BigNumber
    daiAmount: BigNumber
    txHash: string
  }
}

type CloseVaultConfirm = {
  kind: 'closeVaultConfirm'
  value: {
    ilk: string
    debt: string
    closeTo: CloseVaultTo
    txHash: string
  }
}

type CloseVaultConfirmTransaction = {
  kind: 'closeVaultConfirmTransaction'
  value: {
    ilk: string
    debt: string
    closeTo: CloseVaultTo
    txHash: string
  }
}

type ManageMultiplyConfirmTransaction =
  | AdjustPositionConfirmTransaction
  | OtherActionsConfirmTransaction
  | CloseVaultConfirmTransaction

type ManageMultiplyConfirm = AdjustPositionConfirm | OtherActionsConfirm | CloseVaultConfirm

export function createManageMultiplyVaultAnalytics$(
  manageMultiplyVaultState$: Observable<ManageMultiplyVaultState>,
  context$: Observable<Context>,
  tracker: Tracker,
) {
  const manageMultiplyConfirmTransaction: Observable<ManageMultiplyConfirmTransaction> = manageMultiplyVaultState$.pipe(
    filter((state) => state.stage === 'manageInProgress'),
    map(
      ({
        vault: { ilk, debt },
        manageTxHash,
        multiply,
        afterMultiply,
        originalEditingStage,
        otherAction,
        depositAmount,
        withdrawAmount,
        generateAmount,
        paybackAmount,
        closeVaultTo,
      }) => {
        if (originalEditingStage === 'adjustPosition') {
          return {
            kind: 'adjustPositionConfirmTransaction',
            value: {
              ilk,
              multiply: afterMultiply.minus(multiply).toFixed(3),
              txHash: manageTxHash,
            },
          } as AdjustPositionConfirmTransaction
        } else if (otherAction !== 'closeVault') {
          return {
            kind: 'otherActionsConfirmTransaction',
            value: {
              ilk,
              collateralAmount:
                depositAmount || (withdrawAmount ? withdrawAmount.times(new BigNumber(-1)) : zero),
              daiAmount:
                generateAmount || (paybackAmount ? paybackAmount.times(new BigNumber(-1)) : zero),
              txHash: manageTxHash,
            },
          } as OtherActionsConfirmTransaction
        } else {
          return {
            kind: 'closeVaultConfirmTransaction',
            value: {
              ilk,
              debt: debt.toFixed(3),
              closeTo: closeVaultTo,
              txHash: manageTxHash,
            },
          } as CloseVaultConfirmTransaction
        }
      },
    ),
    distinctUntilChanged(isEqual),
  )

  const manageMultiplyConfirm: Observable<ManageMultiplyConfirm> = manageMultiplyVaultState$.pipe(
    filter((state) => state.stage === 'manageWaitingForApproval'),
    map(
      ({
        vault: { ilk, debt },
        multiply,
        afterMultiply,
        originalEditingStage,
        otherAction,
        depositAmount,
        withdrawAmount,
        generateAmount,
        paybackAmount,
        closeVaultTo,
      }) => {
        if (originalEditingStage === 'adjustPosition') {
          return {
            kind: 'adjustPositionConfirm',
            value: {
              ilk,
              multiply: afterMultiply.minus(multiply).toFixed(3),
            },
          } as AdjustPositionConfirm
        } else if (otherAction !== 'closeVault') {
          return {
            kind: 'otherActionsConfirm',
            value: {
              ilk,
              collateralAmount:
                depositAmount || (withdrawAmount ? withdrawAmount.times(new BigNumber(-1)) : zero),
              daiAmount:
                generateAmount || (paybackAmount ? paybackAmount.times(new BigNumber(-1)) : zero),
            },
          } as OtherActionsConfirm
        } else {
          return {
            kind: 'closeVaultConfirm',
            value: {
              ilk,
              debt: debt.toFixed(3),
              closeTo: closeVaultTo,
            },
          } as CloseVaultConfirm
        }
      },
    ),
    distinctUntilChanged(isEqual),
  )

  return context$.pipe(
    switchMap((context) =>
      merge(merge(manageMultiplyConfirm, manageMultiplyConfirmTransaction)).pipe(
        tap((event) => {
          const network = networksById[context.chainId].name
          const walletType = context.connectionKind

          switch (event.kind) {
            case 'adjustPositionConfirm':
              tracker.multiply.adjustPositionConfirm(event.value.ilk, event.value.multiply)
              break
            case 'adjustPositionConfirmTransaction':
              tracker.multiply.adjustPositionConfirmTransaction(
                event.value.ilk,
                event.value.multiply,
                event.value.txHash,
                network,
                walletType,
              )
              break
            case 'otherActionsConfirm':
              tracker.multiply.otherActionsConfirm(
                event.value.ilk,
                event.value.collateralAmount.toString(),
                event.value.daiAmount.toString(),
              )
              break
            case 'otherActionsConfirmTransaction':
              tracker.multiply.otherActionsConfirmTransaction(
                event.value.ilk,
                event.value.collateralAmount.toString(),
                event.value.daiAmount.toString(),
                event.value.txHash,
                network,
                walletType,
              )
              break
            case 'closeVaultConfirm':
              tracker.multiply.closeVaultConfirm(
                event.value.ilk,
                event.value.debt,
                event.value.closeTo,
              )
              break
            case 'closeVaultConfirmTransaction':
              tracker.multiply.closeVaultConfirmTransaction(
                event.value.ilk,
                event.value.debt,
                event.value.closeTo,
                event.value.txHash,
                network,
                walletType,
              )
              break
            default:
              throw new Error('Unhandled Scenario')
          }
        }),
      ),
    ),
  )
}
