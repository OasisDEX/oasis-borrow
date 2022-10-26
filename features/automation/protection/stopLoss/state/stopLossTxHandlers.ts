import { TxStatus } from '@oasisdex/transactions'
import { useActor } from '@xstate/react'
import { AutomationBotAddTriggerData } from 'blockchain/calls/automationBot'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import {
  STOP_LOSS_FORM_CHANGE,
  StopLossFormChange,
} from 'features/automation/protection/stopLoss/state/StopLossFormChange'
import {
  prepareAddStopLossTriggerData,
  StopLossTriggerData,
} from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { useStopLossContext } from 'features/automation/protection/stopLoss/StopLossContextProvider'
import { zero } from 'helpers/zero'
import { useMemo } from 'react'

interface GetStopLossTxHandlersParams {
  stopLossTriggerData: StopLossTriggerData
  vault: Vault
  stopLossState: StopLossFormChange
  isAddForm: boolean
}

interface StopLossTxHandlers {
  addTxData: AutomationBotAddTriggerData
  textButtonHandlerExtension: () => void
  txStatus?: TxStatus
}

export function getStopLossTxHandlers({
  vault,
  stopLossState,
  stopLossTriggerData,
  isAddForm,
}: GetStopLossTxHandlersParams): StopLossTxHandlers {
  const { uiChanges } = useAppContext()
  const { stateMachine } = useStopLossContext()
  const [, send] = useActor(stateMachine)

  const addTxData = useMemo(
    () =>
      prepareAddStopLossTriggerData(
        vault,
        stopLossState.collateralActive,
        stopLossState.stopLossLevel,
        stopLossTriggerData.triggerId.toNumber(),
      ),
    [
      stopLossState.collateralActive,
      stopLossState.stopLossLevel,
      stopLossTriggerData.triggerId.toNumber(),
    ],
  )

  function textButtonHandlerExtension() {
    if (isAddForm) {
      uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
        type: 'stop-loss-level',
        stopLossLevel: zero,
      })
    }
    send({ type: 'switchForm', value: isAddForm ? 'remove' : 'add' })
  }

  return {
    addTxData,
    textButtonHandlerExtension,
  }
}
