import { TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { InstiVault } from 'blockchain/instiVault'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { useEffect } from 'react'
import { BasicBSTriggerData, extractBasicBSData } from '../common/basicBSTriggerData'
import { resolveWithThreshold } from '../common/helpers'

import { CONSTANT_MULTIPLE_FORM_CHANGE } from './common/UITypes/constantMultipleFormChange'
import { TriggersData } from './triggers/AutomationTriggersData'
export const INITIAL_MULTIPLIER_SELECTED = 2

export interface ConstantMultipleTriggerData {
  triggerId: BigNumber
  triggersData: [TriggerType, BasicBSTriggerData]
}

export function useConstantMultipleStateInitialization(
  ilkData: IlkData,
  vault: Vault | InstiVault,
  autoTriggersData: TriggersData,
) {
  const { uiChanges } = useAppContext()

  const buyTriggerData = extractBasicBSData(autoTriggersData, TriggerType.BasicBuy)
  const sellTriggerData = extractBasicBSData(autoTriggersData, TriggerType.BasicSell)
  const  maxBuyPrice  = buyTriggerData.maxBuyOrMinSellPrice
  const buyWithThresholdResolved = resolveWithThreshold({ maxBuyOrMinSellPrice: maxBuyPrice, triggerId: buyTriggerData.triggerId })
  const minSellPrice = sellTriggerData.maxBuyOrMinSellPrice
  const sellWithThresholdResolved = resolveWithThreshold({maxBuyOrMinSellPrice: minSellPrice, triggerId: sellTriggerData.triggerId})

  const collateralizationRatio = vault.collateralizationRatio.toNumber()

  useEffect(() => {
    uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
      type: 'multiplier',
      multiplier: INITIAL_MULTIPLIER_SELECTED,
    })
  })
}
