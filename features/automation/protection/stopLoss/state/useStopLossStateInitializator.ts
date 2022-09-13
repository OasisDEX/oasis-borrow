import { IlkData } from 'blockchain/ilks'
import { InstiVault } from 'blockchain/instiVault'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import {
  DEFAULT_THRESHOLD_FROM_LOWEST_POSSIBLE_SL_VALUE,
  MIX_MAX_COL_RATIO_TRIGGER_OFFSET,
} from 'features/automation/common/consts'
import { getStartingSlRatio } from 'features/automation/protection/stopLoss/helpers'
import { STOP_LOSS_FORM_CHANGE } from 'features/automation/protection/stopLoss/state/StopLossFormChange'
import { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { zero } from 'helpers/zero'
import { useEffect } from 'react'

export function useStopLossStateInitializator(
  ilkData: IlkData,
  vault: Vault | InstiVault,
  stopLossTriggerData: StopLossTriggerData,
) {
  const { uiChanges } = useAppContext()
  const { stopLossLevel, isStopLossEnabled, isToCollateral, triggerId } = stopLossTriggerData
  const collateralizationRatio = vault.collateralizationRatio.toNumber()

  const sliderMin = ilkData.liquidationRatio.plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET.div(100))
  const selectedStopLossCollRatioIfTriggerDoesntExist = vault.collateralizationRatio.isZero()
    ? zero
    : sliderMin.plus(DEFAULT_THRESHOLD_FROM_LOWEST_POSSIBLE_SL_VALUE)
  const initialSelectedSlRatio = getStartingSlRatio({
    stopLossLevel,
    isStopLossEnabled,
    initialStopLossSelected: selectedStopLossCollRatioIfTriggerDoesntExist,
  }).multipliedBy(100)

  useEffect(() => {
    uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
      type: 'close-type',
      toCollateral: isToCollateral,
    })
    uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
      type: 'stop-loss-level',
      stopLossLevel: initialSelectedSlRatio,
    })
  }, [triggerId.toNumber(), collateralizationRatio])

  useEffect(() => {
    uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
      type: 'tx-details',
      txDetails: {},
    })
    uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
      type: 'current-form',
      currentForm: 'add',
    })
  }, [collateralizationRatio])

  return isStopLossEnabled
}
