import { useAppContext } from 'components/AppContextProvider'
import { useAutomationContext } from 'components/AutomationContextProvider'
import { AutomationAddTriggerData } from 'features/automation/common/txDefinitions'
import {
  STOP_LOSS_FORM_CHANGE,
  StopLossFormChange,
} from 'features/automation/protection/stopLoss/state/StopLossFormChange'
import { zero } from 'helpers/zero'
import { useMemo } from 'react'

interface GetStopLossTxHandlersParams {
  stopLossState: StopLossFormChange
  isAddForm: boolean
}

interface StopLossTxHandlers {
  addTxData: AutomationAddTriggerData
  textButtonHandlerExtension: () => void
}

export function getStopLossTxHandlers({
  stopLossState,
  isAddForm,
}: GetStopLossTxHandlersParams): StopLossTxHandlers {
  const { uiChanges } = useAppContext()
  const {
    metadata: {
      stopLossMetadata: {
        methods: { prepareAddStopLossTriggerData },
      },
    },
    triggerData: { stopLossTriggerData },
  } = useAutomationContext()

  const addTxData = useMemo(
    () => prepareAddStopLossTriggerData(stopLossState),
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
