import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { AutomationFormType } from 'features/automation/common/state/automationFeatureChange'
import { StopLossMetadata } from 'features/automation/metadata/types'
import { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { TxError } from 'helpers/types'
import { useEffect, useReducer } from 'react'

export type StopLossResetData = Pick<
  StopLossState,
  'stopLossLevel' | 'collateralActive' | 'txDetails'
>
export const STOP_LOSS_PUBLISH_KEY = 'STOP_LOSS_PUBLISH_KEY' // it could be moved to single enum with all publish keys

export interface StopLossState {
  stopLossLevel: BigNumber
  collateralActive: boolean
  currentForm: AutomationFormType
  isAwaitingConfirmation: boolean
  txDetails?: {
    txStatus?: TxStatus
    txError?: TxError
    txHash?: string
    txCost?: BigNumber
  }
}

export type StopLossFormAction =
  | { type: 'stop-loss-level'; stopLossLevel: BigNumber }
  | { type: 'close-type'; toCollateral: boolean }
  | { type: 'current-form'; currentForm: AutomationFormType }
  | { type: 'is-awaiting-confirmation'; isAwaitingConfirmation: boolean }
  | { type: 'partial-update'; partialUpdate: Partial<StopLossState> }
  | {
      type: 'tx-details'
      txDetails: {
        txStatus?: TxStatus
        txError?: TxError
        txHash?: string
        txCost?: BigNumber
      }
    }

function reducer(state: StopLossState, action: StopLossFormAction): StopLossState {
  switch (action.type) {
    case 'stop-loss-level':
      return { ...state, stopLossLevel: action.stopLossLevel }
    case 'close-type':
      return { ...state, collateralActive: action.toCollateral }
    case 'current-form':
      return { ...state, currentForm: action.currentForm }
    case 'is-awaiting-confirmation':
      return { ...state, isAwaitingConfirmation: action.isAwaitingConfirmation }
    case 'tx-details':
      return { ...state, txDetails: action.txDetails }
    case 'partial-update':
      return { ...state, ...action.partialUpdate }
    default:
      return state
  }
}

export function useStopLossReducer({
  positionRatio,
  stopLossTriggerData,
  metadata,
}: {
  positionRatio: BigNumber
  stopLossTriggerData: StopLossTriggerData
  metadata: StopLossMetadata
}) {
  const { isToCollateral, triggerId } = stopLossTriggerData
  const {
    values: { initialSlRatioWhenTriggerDoesntExist },
  } = metadata

  const init = {
    stopLossLevel: initialSlRatioWhenTriggerDoesntExist,
    collateralActive: isToCollateral,
    currentForm: 'add' as AutomationFormType,
    isAwaitingConfirmation: false,
    txDetails: {},
  }

  const [stopLossState, dispatch] = useReducer(reducer, init)

  useEffect(() => {
    dispatch({
      type: 'partial-update',
      partialUpdate: {
        currentForm: 'add',
        stopLossLevel: initialSlRatioWhenTriggerDoesntExist,
        collateralActive: isToCollateral,
        isAwaitingConfirmation: false,
      },
    })
  }, [triggerId.toNumber(), positionRatio.toNumber()])

  useEffect(() => {
    dispatch({
      type: 'partial-update',
      partialUpdate: {
        txDetails: {},
      },
    })
  }, [positionRatio.toNumber()])

  return { stopLossState, dispatch }
}
