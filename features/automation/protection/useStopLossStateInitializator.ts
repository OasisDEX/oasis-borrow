import { useEffect } from 'react'

import { IlkData } from '../../../blockchain/ilks'
import { InstiVault } from '../../../blockchain/instiVault'
import { Vault } from '../../../blockchain/vaults'
import { useAppContext } from '../../../components/AppContextProvider'
import { useUIChanges } from '../../../helpers/uiChangesHook'
import { getInitialVaultCollRatio, getStartingSlRatio } from './common/helpers'
import { extractStopLossData } from './common/StopLossTriggerDataExtractor'
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

  const initialVaultCollRatio = getInitialVaultCollRatio({
    liquidationRatio: ilkData.liquidationRatio,
    collateralizationRatio: vault.collateralizationRatio,
  })

  const startingSlRatio = getStartingSlRatio({
    stopLossLevel,
    isStopLossEnabled,
    initialVaultCollRatio,
  })

  useEffect(() => {
    uiChanges.publish(ADD_FORM_CHANGE, {
      type: 'close-type',
      toCollateral: isToCollateral,
    })
    uiChanges.publish(ADD_FORM_CHANGE, {
      type: 'stop-loss',
      stopLoss: startingSlRatio.multipliedBy(100),
    })
    uiChanges.publish(ADD_FORM_CHANGE, {
      type: 'tx-details',
      txDetails: {},
    })
    uiChanges.publish(REMOVE_FORM_CHANGE, {
      type: 'tx-details',
      txDetails: {},
    })
  }, [currentForm])

  useEffect(() => {
    uiChanges.publish(ADD_FORM_CHANGE, {
      type: 'close-type',
      toCollateral: isToCollateral,
    })
    uiChanges.publish(ADD_FORM_CHANGE, {
      type: 'stop-loss',
      stopLoss: startingSlRatio.multipliedBy(100),
    })
  }, [isStopLossEnabled, startingSlRatio.toNumber()])

  return isStopLossEnabled
}
