import { TxStatus } from '@oasisdex/transactions'
import type BigNumber from 'bignumber.js'
import { addAutomationBotTrigger } from 'blockchain/calls/automationBot.constants'
import type { AutomationBotAddTriggerData } from 'blockchain/calls/automationBot.types'
import { prepareAddStopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import type { CloseVaultTo } from 'features/multiply/manage/pipes/CloseVaultTo.types'
import type { AddStopLossChange } from 'features/shared/transactions'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import { transactionToX } from 'helpers/form'
import { of } from 'rxjs'

export function applyStopLossOpenFlowTransaction<S>(state: S, change: AddStopLossChange) {
  if (change.kind === 'stopLossTxWaitingForConfirmation') {
    return {
      ...state,
      stage: 'stopLossTxWaitingForConfirmation',
      id: change.id,
    }
  }

  if (change.kind === 'stopLossTxWaitingForApproval') {
    return {
      ...state,
      stage: 'stopLossTxWaitingForApproval',
    }
  }

  if (change.kind === 'stopLossTxInProgress') {
    const { stopLossTxHash } = change
    return {
      ...state,
      stopLossTxHash,
      stage: 'stopLossTxInProgress',
    }
  }

  if (change.kind === 'stopLossTxFailure') {
    const { txError } = change
    return {
      ...state,
      stage: 'stopLossTxFailure',
      txError,
    }
  }

  if (change.kind === 'stopLossTxSuccess') {
    return { ...state, stage: 'stopLossTxSuccess' }
  }

  return state
}

export function addStopLossTrigger<C extends AddStopLossChange>(
  { sendWithGasEstimation }: TxHelpers,
  change: (ch: C) => void,
  state: {
    stopLossCloseType: CloseVaultTo
    stopLossLevel: BigNumber
    id?: BigNumber
    proxyAddress?: string
  },
) {
  const { id, stopLossCloseType, stopLossLevel, proxyAddress } = state
  sendWithGasEstimation(
    addAutomationBotTrigger,
    prepareAddStopLossTriggerData({
      id: id!,
      owner: proxyAddress!,
      isCloseToCollateral: stopLossCloseType === 'collateral',
      replacedTriggerId: 0,
      stopLossLevel,
    }),
  )
    .pipe(
      transactionToX<AddStopLossChange, AutomationBotAddTriggerData>(
        { kind: 'stopLossTxWaitingForApproval' },
        (txState) =>
          of({ kind: 'stopLossTxInProgress', stopLossTxHash: (txState as any).txHash as string }),
        (txState) =>
          of({
            kind: 'stopLossTxFailure',
            txError:
              txState.status === TxStatus.Error || txState.status === TxStatus.CancelledByTheUser
                ? txState.error
                : undefined,
          }),
        () => {
          return of({
            kind: 'stopLossTxSuccess',
          })
        },
        6,
      ),
    )
    .subscribe((ch) => change(ch as C))
}
