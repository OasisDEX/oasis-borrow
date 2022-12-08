import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { AutomationBotAddTriggerData } from 'blockchain/calls/automationBot'
import { useAutomationContext } from 'components/AutomationContextProvider'
import {
  prepareAddStopLossTriggerData,
  StopLossTriggerData,
} from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { StopLossState } from 'features/automation/protection/stopLoss/state/useStopLossReducer'
import { zero } from 'helpers/zero'
import { useMemo } from 'react'

interface GetStopLossTxHandlersParams {
  id: BigNumber
  owner: string
  stopLossTriggerData: StopLossTriggerData
  stopLossState: StopLossState
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
  const {
    reducers: {
      stopLossReducer: { dispatch },
    },
  } = useAutomationContext()

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
      dispatch({
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
