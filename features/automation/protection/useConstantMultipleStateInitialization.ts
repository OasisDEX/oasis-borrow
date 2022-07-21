import { TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { InstiVault } from 'blockchain/instiVault'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { useEffect } from 'react'
import { BasicBSTriggerData, extractBasicBSData, extractGroupTriggersData } from '../common/basicBSTriggerData'
import { resolveMaxBuyOrMinSellPrice, resolveWithThreshold } from '../common/helpers'

import { CONSTANT_MULTIPLE_FORM_CHANGE } from './common/UITypes/constantMultipleFormChange'
import { TriggersData } from './triggers/AutomationTriggersData'
import { AggregtedTriggersData } from './triggers/AggregatedTriggersData'
import { one } from 'helpers/zero'
export const INITIAL_MULTIPLIER_SELECTED = 2
export const CONSTANT_MULTIPLE_GROUP_TYPE = 1 //TODO ŁW - if more groups will be added, create an enum

export interface ConstantMultipleTriggerData {
  groupTriggerId: BigNumber
  // groupTypeId: BigNumber ŁW for now it's always 1
  // group of triggers also will have some unique id
  autoTriggersData: TriggersData
  aggregatedTriggersData: AggregtedTriggersData
}

export function useConstantMultipleStateInitialization(
  ilkData: IlkData,
  vault: Vault | InstiVault,
  autoTriggersData: TriggersData,
  aggregatedTriggersData: AggregtedTriggersData,
) {
  const { uiChanges } = useAppContext()
  
  const constantMultipleTriggerIds = extractConstantMultipleIds(aggregatedTriggersData)
  const constantMultipleTriggersData = extractGroupTriggersData(autoTriggersData, constantMultipleTriggerIds )
  const buyTriggerData = constantMultipleTriggersData[TriggerType.BasicBuy]
  const sellTriggerData = constantMultipleTriggersData[TriggerType.BasicSell]
  const maxBuyPrice  = buyTriggerData.maxBuyOrMinSellPrice
  const buyWithThresholdResolved = resolveWithThreshold({ maxBuyOrMinSellPrice: maxBuyPrice, triggerId: buyTriggerData.triggerId })
  const minSellPrice = sellTriggerData.maxBuyOrMinSellPrice
  const sellWithThresholdResolved = resolveWithThreshold({maxBuyOrMinSellPrice: minSellPrice, triggerId: sellTriggerData.triggerId})
  const maxBuyPriceResolved = resolveMaxBuyOrMinSellPrice(maxBuyPrice)
  const minSellPriceResolved = resolveMaxBuyOrMinSellPrice(minSellPrice)

  const collateralizationRatio = vault.collateralizationRatio.toNumber()
  const publishKey = CONSTANT_MULTIPLE_FORM_CHANGE

  // TODO ŁW multiplier is result of target ratio of both triggers, 
  // such value is not used in smart contract
  let gretestGroupId = aggregatedTriggersData.triggers?.reduce((max, current) => max.groupId > current.groupId ? max : current).groupId
  const groupId = gretestGroupId !== undefined ? gretestGroupId : undefined
  useEffect(() => {
    uiChanges.publish(publishKey, {
      type: 'multiplier',
      multiplier: INITIAL_MULTIPLIER_SELECTED, //TODO calculate initial multiplier if trigger exists
    })
  }, [groupId, collateralizationRatio])
}
function extractConstantMultipleIds(aggregatedTriggersData: AggregtedTriggersData) {
  return aggregatedTriggersData.triggers?.flatMap(trigger => trigger.triggerIds)
}

