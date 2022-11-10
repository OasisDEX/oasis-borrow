import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { AutomationBotAddTriggerData } from 'blockchain/calls/automationBot'
import { useAppContext } from 'components/AppContextProvider'
import {
  STOP_LOSS_FORM_CHANGE,
  StopLossFormChange,
} from 'features/automation/protection/stopLoss/state/StopLossFormChange'
import {
  prepareAddStopLossTriggerData,
  StopLossTriggerData,
} from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { zero } from 'helpers/zero'
import { useMemo } from 'react'

interface GetStopLossTxHandlersParams {
  id: BigNumber
  owner: string
  stopLossTriggerData: StopLossTriggerData
  stopLossState: StopLossFormChange
  isAddForm: boolean
}

interface StopLossTxHandlers {
  addTxData: AutomationBotAddTriggerData
  textButtonHandlerExtension: () => void
  txStatus?: TxStatus
}

export function getStopLossTxHandlers({
  id,
  owner,
  stopLossState,
  stopLossTriggerData,
  isAddForm,
}: GetStopLossTxHandlersParams): StopLossTxHandlers {
  const { uiChanges } = useAppContext()

  const addTxData = useMemo(
    () =>
      prepareAddStopLossTriggerData({
        id,
        owner,
        isCloseToCollateral: stopLossState.collateralActive,
        stopLossLevel: stopLossState.stopLossLevel,
        replacedTriggerId: stopLossTriggerData.triggerId.toNumber(),
      }),
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
  }

  return {
    addTxData,
    textButtonHandlerExtension,
  }
}
