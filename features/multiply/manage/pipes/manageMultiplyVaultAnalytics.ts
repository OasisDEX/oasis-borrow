import type { Tracker } from 'analytics/trackingEvents'
import BigNumber from 'bignumber.js'
import type { Context } from 'blockchain/network.types'
import { networkSetById } from 'blockchain/networks'
import { formatOazoFee } from 'features/multiply/manage/utils'
import { zero } from 'helpers/zero'
import { isEqual } from 'lodash'
import type { Observable } from 'rxjs'
import { merge } from 'rxjs'
import { distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators'

import type {
  AdjustPositionConfirm,
  AdjustPositionConfirmTransaction,
  CloseVaultConfirm,
  CloseVaultConfirmTransaction,
  ManageMultiplyConfirm,
  ManageMultiplyConfirmTransaction,
  OtherActionsConfirm,
  OtherActionsConfirmTransaction,
} from './manageMultiplyVaultAnalytics.types'
import type { ManageMultiplyVaultState } from './ManageMultiplyVaultState.types'

export function createManageMultiplyVaultAnalytics$(
  manageMultiplyVaultState$: Observable<ManageMultiplyVaultState>,
  context$: Observable<Context>,
  tracker: Tracker,
) {
  const manageMultiplyConfirmTransaction: Observable<ManageMultiplyConfirmTransaction> =
    manageMultiplyVaultState$.pipe(
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
          oazoFee,
        }) => {
          if (originalEditingStage === 'adjustPosition') {
            return {
              kind: 'adjustPositionConfirmTransaction',
              value: {
                ilk,
                multiply: afterMultiply.minus(multiply).toFixed(3),
                txHash: manageTxHash,
                oasisFee: formatOazoFee(oazoFee),
              },
            } as AdjustPositionConfirmTransaction
          } else if (otherAction !== 'closeVault') {
            return {
              kind: 'otherActionsConfirmTransaction',
              value: {
                ilk,
                collateralAmount:
                  depositAmount ||
                  (withdrawAmount ? withdrawAmount.times(new BigNumber(-1)) : zero),
                daiAmount:
                  generateAmount || (paybackAmount ? paybackAmount.times(new BigNumber(-1)) : zero),
                txHash: manageTxHash,
                oasisFee: formatOazoFee(oazoFee),
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
                oasisFee: formatOazoFee(oazoFee),
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
          const network = networkSetById[context.id].name
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
                event.value.oasisFee,
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
                event.value.oasisFee,
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
                event.value.oasisFee,
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
