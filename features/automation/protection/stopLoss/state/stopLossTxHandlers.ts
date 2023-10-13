import { useAutomationContext } from 'components/context/AutomationContextProvider'
import type { AutomationAddTriggerData } from 'features/automation/common/txDefinitions.types'
import { uiChanges } from 'helpers/uiChanges'
import { zero } from 'helpers/zero'
import { useMemo } from 'react'

import { STOP_LOSS_FORM_CHANGE } from './StopLossFormChange.constants'
import type { StopLossFormChange } from './StopLossFormChange.types'

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
