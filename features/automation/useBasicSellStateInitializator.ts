import { IlkData } from 'blockchain/ilks'
import { InstiVault } from 'blockchain/instiVault'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { extractBasicSellData } from 'features/automation/protection/basicBSTriggerData'
import { BASIC_SELL_FORM_CHANGE } from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { TriggersData } from 'features/automation/protection/triggers/AutomationTriggersData'
import { useEffect } from 'react'

export function useBasicSellStateInitialization(
  ilkData: IlkData,
  vault: Vault | InstiVault,
  autoTriggersData: TriggersData,
) {
  const { uiChanges } = useAppContext()
  const {
    triggerId,
    basicSellLevel,
    basicSellTargetLevel,
    basicSellMinSellPrice,
    basicSellDeviation,
    isBasicSellContinuous,
    isBasicSellEnabled,
  } = extractBasicSellData(autoTriggersData)
  const collateralizationRatio = vault.collateralizationRatio.toNumber()

  useEffect(() => {
    uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
      type: 'trigger-id',
      triggerId,
    })
    uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
      type: 'execution-coll-ratio',
      execCollRatio: basicSellLevel,
    })
    uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
      type: 'target-coll-ratio',
      targetCollRatio: basicSellTargetLevel,
    })
    uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
      type: 'max-buy-or-sell-price',
      maxBuyOrMinSellPrice: basicSellMinSellPrice,
    })
    uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
      type: 'continuous',
      continuous: isBasicSellContinuous,
    })
    uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
      type: 'deviation',
      deviation: basicSellDeviation,
    })
    uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
      type: 'with-threshold',
      withThreshold: true,
    })
    uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
      type: 'tx-details',
      txDetails: {},
    })
  }, [collateralizationRatio, triggerId.toNumber()])

  return isBasicSellEnabled
}
