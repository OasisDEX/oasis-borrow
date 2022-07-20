import { TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { InstiVault } from 'blockchain/instiVault'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { useEffect } from 'react'
import { BasicBSTriggerData, extractBasicBSData } from '../common/basicBSTriggerData'
import { resolveMaxBuyOrMinSellPrice, resolveWithThreshold } from '../common/helpers'

import { CONSTANT_MULTIPLE_FORM_CHANGE } from './common/UITypes/constantMultipleFormChange'
import { TriggersData } from './triggers/AutomationTriggersData'
export const INITIAL_MULTIPLIER_SELECTED = 2

export interface ConstantMultipleTriggerData {
  // groupTypeId: BigNumber ŁW for now it's always 1
  // group of triggers also will have some unique id
  triggersData: {[key in TriggerType]: TriggersData}
}

export function useConstantMultipleStateInitialization(
  ilkData: IlkData,
  vault: Vault | InstiVault,
  autoTriggersData: ConstantMultipleTriggerData, //TODO ŁW how to make sure there will be 2 elements and which one will be for absic buy and whioch for basic sell?
) {
  const { uiChanges } = useAppContext()

  const buyTriggerData = extractBasicBSData(autoTriggersData.triggersData[TriggerType.BasicBuy], TriggerType.BasicBuy)
  const sellTriggerData = extractBasicBSData(autoTriggersData.triggersData[TriggerType.BasicSell], TriggerType.BasicSell)
  const maxBuyPrice  = buyTriggerData.maxBuyOrMinSellPrice
  const buyWithThresholdResolved = resolveWithThreshold({ maxBuyOrMinSellPrice: maxBuyPrice, triggerId: buyTriggerData.triggerId })
  const minSellPrice = sellTriggerData.maxBuyOrMinSellPrice
  const sellWithThresholdResolved = resolveWithThreshold({maxBuyOrMinSellPrice: minSellPrice, triggerId: sellTriggerData.triggerId})
  const maxBuyPriceResolved = resolveMaxBuyOrMinSellPrice(buyTriggerData.maxBuyOrMinSellPrice)
  const minSellPriceResolved = resolveMaxBuyOrMinSellPrice(sellTriggerData.maxBuyOrMinSellPrice)

  const collateralizationRatio = vault.collateralizationRatio.toNumber()
  const publishKey = CONSTANT_MULTIPLE_FORM_CHANGE

  // TODO ŁW multiplier is result of target ratio of both triggers, 
  // such value is not used in smart contract
  useEffect(() => {
    uiChanges.publish(publishKey, {
      type: 'multiplier',
      multiplier: INITIAL_MULTIPLIER_SELECTED,
    })
  })
}
