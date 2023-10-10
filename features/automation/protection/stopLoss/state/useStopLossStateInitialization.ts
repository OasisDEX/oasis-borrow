import type BigNumber from 'bignumber.js'
import type { StopLossMetadata } from 'features/automation/metadata/types'
import { uiChanges } from 'helpers/uiChanges'
import { useEffect } from 'react'

import { STOP_LOSS_FORM_CHANGE } from './StopLossFormChange.constants'
import type { StopLossTriggerData } from './stopLossTriggerData.types'

export function useStopLossStateInitialization({
  positionRatio,
  stopLossTriggerData,
  metadata,
}: {
  positionRatio: BigNumber
  stopLossTriggerData: StopLossTriggerData
  metadata: StopLossMetadata
}) {
  const { isStopLossEnabled, isToCollateral, triggerId } = stopLossTriggerData
  const {
    values: { initialSlRatioWhenTriggerDoesntExist },
  } = metadata

  useEffect(() => {
    uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
      type: 'close-type',
      toCollateral: isToCollateral,
    })
    uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
      type: 'stop-loss-level',
      stopLossLevel: initialSlRatioWhenTriggerDoesntExist,
    })
  }, [triggerId.toNumber(), positionRatio.toNumber()])

  useEffect(() => {
    uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
      type: 'tx-details',
      txDetails: {},
    })
    uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
      type: 'is-awaiting-confirmation',
      isAwaitingConfirmation: false,
    })
    uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
      type: 'current-form',
      currentForm: 'add',
    })
  }, [positionRatio.toNumber()])

  return isStopLossEnabled
}
