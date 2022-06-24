import { TxStatus } from '@oasisdex/transactions'
import { BigNumber } from 'bignumber.js'
import {
  addAutomationBotTrigger,
  AutomationBotAddTriggerData,
} from 'blockchain/calls/automationBot'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { AddBasicBuyChange } from 'features/shared/transactions'
import { transactionToX } from 'helpers/form'
import { of } from 'rxjs'

import { prepareBasicBuyTriggerCreationData } from '../common/BasicBuyTriggerExtractor'

export function addBasicBuyTrigger<C extends AddBasicBuyChange>(
  { sendWithGasEstimation }: TxHelpers,
  change: (ch: C) => void,
  state: {
    execCollRatio: BigNumber
    targetCollRatio: BigNumber
    maxBuyPrice: BigNumber
    continuous: boolean
    deviation: BigNumber
    vaultData: Vault
    // replacedTriggerId: number
  },
) {
  const { execCollRatio, targetCollRatio, maxBuyPrice, continuous, deviation, vaultData } = state
  const replacedTriggerId = 0 //TODO ŁW move to state get from extract...

  sendWithGasEstimation(
    addAutomationBotTrigger,
    prepareBasicBuyTriggerCreationData(
      vaultData,
      execCollRatio,
      targetCollRatio,
      maxBuyPrice,
      continuous,
      deviation,
      replacedTriggerId,
    ),
  )
    .pipe(
      transactionToX<AddBasicBuyChange, AutomationBotAddTriggerData>(
        { kind: 'basicBuyTxWaitingForApproval' },
        (txState) =>
          of({ kind: 'basicBuyTxInProgress', basicBuyTxHash: (txState as any).txHash as string }),
        (txState) =>
          of({
            kind: 'basicBuyTxFailure',
            txError:
              txState.status === TxStatus.Error || txState.status === TxStatus.CancelledByTheUser
                ? txState.error
                : undefined,
          }),
        () => {
          return of({
            kind: 'basicBuyTxSuccess',
          })
        },
      ),
    )
    .subscribe((ch) => change(ch as C))
}
