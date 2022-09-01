import { IlkData } from 'blockchain/ilks'
import { InstiVault } from 'blockchain/instiVault'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { extractStopLossData } from 'features/automation/protection/common/stopLossTriggerData'
import { useUIChanges } from 'helpers/uiChangesHook'
import { zero } from 'helpers/zero'
import { useEffect } from 'react'

import {
  DEFAULT_THRESHOLD_FROM_LOWEST_POSSIBLE_SL_VALUE,
  MIX_MAX_COL_RATIO_TRIGGER_OFFSET,
} from '../common/consts'
import { getStartingSlRatio } from './common/helpers'
import { ADD_FORM_CHANGE } from './common/UITypes/AddFormChange'
import {
  PROTECTION_MODE_CHANGE_SUBJECT,
  ProtectionModeChange,
} from './common/UITypes/ProtectionFormModeChange'
import { REMOVE_FORM_CHANGE } from './common/UITypes/RemoveFormChange'
import { TriggersData } from './triggers/AutomationTriggersData'

export function useStopLossStateInitializator(
  ilkData: IlkData,
  vault: Vault | InstiVault,
  autoTriggersData: TriggersData,
) {
  const { uiChanges } = useAppContext()
  const { stopLossLevel, isStopLossEnabled, isToCollateral } = extractStopLossData(autoTriggersData)
  const [currentForm] = useUIChanges<ProtectionModeChange>(PROTECTION_MODE_CHANGE_SUBJECT)
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
    uiChanges.publish(ADD_FORM_CHANGE, {
      type: 'close-type',
      toCollateral: isToCollateral,
    })
    uiChanges.publish(ADD_FORM_CHANGE, {
      type: 'tx-details',
      txDetails: {},
    })
    uiChanges.publish(REMOVE_FORM_CHANGE, {
      type: 'tx-details',
      txDetails: {},
    })
  }, [currentForm, collateralizationRatio])

  useEffect(() => {
    uiChanges.publish(ADD_FORM_CHANGE, {
      type: 'close-type',
      toCollateral: isToCollateral,
    })
    uiChanges.publish(ADD_FORM_CHANGE, {
      type: 'stop-loss',
      stopLoss: initialSelectedSlRatio,
    })
  }, [isStopLossEnabled, initialSelectedSlRatio])

  return isStopLossEnabled
}
