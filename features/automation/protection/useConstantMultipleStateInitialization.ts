import { TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { InstiVault } from 'blockchain/instiVault'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { useEffect } from 'react'

import { extractGroupTriggersData } from '../common/basicBSTriggerData'
import {
  calculateCollRatioForMultiply,
  resolveMaxBuyOrMinSellPrice,
  resolveWithThreshold,
} from '../common/helpers'
import { CONSTANT_MULTIPLE_FORM_CHANGE } from './common/UITypes/constantMultipleFormChange'
import { AggregtedTriggersData } from './triggers/aggregatedTriggersData'
import { TriggersData } from './triggers/AutomationTriggersData'
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
  const constantMultipleTriggersData = extractGroupTriggersData(
    autoTriggersData,
    constantMultipleTriggerIds,
  )
  const buyTriggerData = constantMultipleTriggersData[TriggerType.BasicBuy]
  const sellTriggerData = constantMultipleTriggersData[TriggerType.BasicSell]
  const maxBuyPrice = buyTriggerData.maxBuyOrMinSellPrice
  const buyWithThresholdResolved = resolveWithThreshold({
    maxBuyOrMinSellPrice: maxBuyPrice,
    triggerId: buyTriggerData.triggerId,
  })
  const minSellPrice = sellTriggerData.maxBuyOrMinSellPrice
  const sellWithThresholdResolved = resolveWithThreshold({
    maxBuyOrMinSellPrice: minSellPrice,
    triggerId: sellTriggerData.triggerId,
  })
  const maxBuyPriceResolved = resolveMaxBuyOrMinSellPrice(maxBuyPrice)
  const minSellPriceResolved = resolveMaxBuyOrMinSellPrice(minSellPrice)
  const buyExecutionCollRatio = buyTriggerData.execCollRatio
  const sellExecutionCollRatio = sellTriggerData.execCollRatio

  const collateralizationRatio = vault.collateralizationRatio.toNumber()
  const publishKey = CONSTANT_MULTIPLE_FORM_CHANGE

  useEffect(() => {
    uiChanges.publish(publishKey, {
      type: 'multiplier',
      multiplier: INITIAL_MULTIPLIER_SELECTED, //TODO calculate initial multiplier if trigger exists
      targetCollRatio: calculateCollRatioForMultiply(INITIAL_MULTIPLIER_SELECTED),
    })
    uiChanges.publish(publishKey, {
      type: 'buy-execution-coll-ratio',
      buyExecutionCollRatio,
    })
    uiChanges.publish(publishKey, {
      type: 'sell-execution-coll-ratio',
      sellExecutionCollRatio,
    })
    // uiChanges.publish(publishKey, {
    //   type: 'target-coll-ratio',
    //   targetCollRatio,
    // })
    uiChanges.publish(publishKey, {
      type: 'max-buy-price',
      maxBuyPrice: maxBuyPriceResolved,
    })
    uiChanges.publish(publishKey, {
      type: 'min-sell-price',
      minSellPrice: minSellPriceResolved,
    })
    uiChanges.publish(publishKey, {
      type: 'continuous',
      continuous: buyTriggerData.continuous, //whatever it doesn't change
    })
    uiChanges.publish(publishKey, {
      type: 'deviation',
      deviation: buyTriggerData.deviation, //whatever it doesn't change
    })
    uiChanges.publish(publishKey, {
      type: 'max-gas-fee-in-gwei',
      maxBaseFeeInGwei: buyTriggerData.maxBaseFeeInGwei, // assumption it's the same for bot buy and sell
    })
    uiChanges.publish(publishKey, {
      type: 'buy-with-threshold',
      buyWithThreshold: buyWithThresholdResolved,
    })
    uiChanges.publish(publishKey, {
      type: 'sell-with-threshold',
      sellWithThreshold: sellWithThresholdResolved,
    })
  }, [/*groupId,*/ collateralizationRatio])

  return false //TODO ŁW as trigger even if exist, wont be loaded from cache
}
function extractConstantMultipleIds(aggregatedTriggersData: AggregtedTriggersData) {
  return aggregatedTriggersData
    ? aggregatedTriggersData.triggers?.flatMap((trigger: any) => trigger.triggerIds)
    : []
}
