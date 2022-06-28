import { TriggerType } from '@oasisdex/automation'
import { IlkData } from 'blockchain/ilks'
import { InstiVault } from 'blockchain/instiVault'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { extractBasicBSData } from 'features/automation/common/basicBSTriggerData'
import {
  BASIC_BUY_FORM_CHANGE,
  BASIC_SELL_FORM_CHANGE,
} from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { TriggersData } from 'features/automation/protection/triggers/AutomationTriggersData'
import { useEffect } from 'react'

export function useBasicBSstateInitialization(
  ilkData: IlkData,
  vault: Vault | InstiVault,
  autoTriggersData: TriggersData,
  type: TriggerType,
) {
  const { uiChanges } = useAppContext()
  const {
    triggerId,
    execCollRatio,
    targetCollRatio,
    maxBuyOrMinSellPrice,
    continuous,
    deviation,
    isTriggerEnabled,
  } = extractBasicBSData(autoTriggersData, type)
  const collateralizationRatio = vault.collateralizationRatio.toNumber()

  const publishKey = type === TriggerType.BasicBuy ? BASIC_BUY_FORM_CHANGE : BASIC_SELL_FORM_CHANGE

  useEffect(() => {
    uiChanges.publish(publishKey, {
      type: 'trigger-id',
      triggerId,
    })
    uiChanges.publish(publishKey, {
      type: 'execution-coll-ratio',
      execCollRatio,
    })
    uiChanges.publish(publishKey, {
      type: 'target-coll-ratio',
      targetCollRatio,
    })
    uiChanges.publish(publishKey, {
      type: 'max-buy-or-sell-price',
      maxBuyOrMinSellPrice,
    })
    uiChanges.publish(publishKey, {
      type: 'continuous',
      continuous,
    })
    uiChanges.publish(publishKey, {
      type: 'deviation',
      deviation,
    })
    uiChanges.publish(publishKey, {
      type: 'max-gas-percentage-price',
      maxGasPercentagePrice: 'FIVE',
    })
    uiChanges.publish(publishKey, {
      type: 'current-form',
      currentForm: 'add',
    })
    uiChanges.publish(publishKey, {
      type: 'with-threshold',
      withThreshold: true,
    })
    uiChanges.publish(publishKey, {
      type: 'tx-details',
      txDetails: {},
    })
  }, [collateralizationRatio, triggerId.toNumber()])

  return isTriggerEnabled
}
