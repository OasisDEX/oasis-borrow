import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import {
  addAutomationBotTrigger,
  AutomationBotAddTriggerData,
} from 'blockchain/calls/automationBot'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { prepareAddStopLossTriggerData } from 'features/automation/protection/common/stopLossTriggerData'
import { CloseVaultTo } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { AddStopLossChange } from 'features/shared/transactions'
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
    prepareAddStopLossTriggerData(
      { id, owner: proxyAddress } as Vault,
      stopLossCloseType === 'collateral',
      stopLossLevel,
      0,
    ),
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
