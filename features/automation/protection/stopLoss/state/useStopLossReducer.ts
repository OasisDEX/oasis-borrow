import BigNumber from 'bignumber.js'
import {
  AutomationCommonState,
  AutomationFormType,
  AutomationTxDetails,
} from 'features/automation/common/state/automationFeatureChange'
import { StopLossMetadata } from 'features/automation/metadata/types'
import { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { ReductoActions, useReducto } from 'helpers/useReducto'
import { useEffect } from 'react'

export type StopLossResetData = Pick<
  StopLossState,
  'stopLossLevel' | 'collateralActive' | 'txDetails'
>
export const STOP_LOSS_PUBLISH_KEY = 'STOP_LOSS_PUBLISH_KEY' // it could be moved to single enum with all publish keys

export interface StopLossState extends AutomationCommonState {
  collateralActive: boolean
  stopLossLevel: BigNumber
}

export interface StopLossReducerProps {
  metadata: StopLossMetadata
  positionRatio: BigNumber
  stopLossTriggerData: StopLossTriggerData
}

interface StopLosssActionTxDetails {
  type: 'tx-details'
  txDetails: AutomationTxDetails
}

export type StopLossAction = ReductoActions<StopLossState, StopLosssActionTxDetails>

function stopLossReducer(state: StopLossState, action: StopLossAction) {
  switch (action.type) {
    case 'tx-details':
      return { ...state, txDetails: { ...state.txDetails, ...action.txDetails } }
    default:
      return state
  }
}

export function useStopLossReducer({
  metadata: {
    values: { initialSlRatioWhenTriggerDoesntExist },
  },
  positionRatio,
  stopLossTriggerData: { isToCollateral, triggerId },
}: StopLossReducerProps) {
  const { dispatch, state, updateState } = useReducto<StopLossState, StopLossAction>({
    defaults: {
      stopLossLevel: initialSlRatioWhenTriggerDoesntExist,
      collateralActive: isToCollateral,
      currentForm: 'add' as AutomationFormType,
      isAwaitingConfirmation: false,
      txDetails: {},
    },
    reducer: stopLossReducer,
  })

  useEffect(() => {
    dispatch({
      type: 'partial-update',
      state: {
        collateralActive: isToCollateral,
        currentForm: 'add',
        isAwaitingConfirmation: false,
        stopLossLevel: initialSlRatioWhenTriggerDoesntExist,
      },
    })
  }, [triggerId.toNumber(), positionRatio.toNumber()])
  useEffect(() => {
    dispatch({ type: 'tx-details', txDetails: {} })
  }, [positionRatio.toNumber()])

  return {
    dispatchStopLoss: dispatch,
    stopLossState: state,
    updateStopLossState: updateState,
  }
}
