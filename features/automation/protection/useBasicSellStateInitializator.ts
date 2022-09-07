import { TriggerType } from '@oasisdex/automation'
import { IlkData } from 'blockchain/ilks'
import { InstiVault } from 'blockchain/instiVault'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import {
  prepareBasicBSSliderDefaults,
  resolveMaxBuyOrMinSellPrice,
  resolveWithThreshold,
} from 'features/automation/common/helpers'
import { StopLossTriggerData } from 'features/automation/protection/common/stopLossTriggerData'
import {
  BASIC_BUY_FORM_CHANGE,
  BASIC_SELL_FORM_CHANGE,
} from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { useEffect } from 'react'

export function useBasicBSstateInitialization(
  ilkData: IlkData,
  vault: Vault | InstiVault,
  autoTriggersData: BasicBSTriggerData,
  stopLossTriggerData: StopLossTriggerData,
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
    maxBaseFeeInGwei,
  } = autoTriggersData
  const { collateralizationRatio } = vault

  const publishKey = type === TriggerType.BasicBuy ? BASIC_BUY_FORM_CHANGE : BASIC_SELL_FORM_CHANGE
  const maxBuyOrMinSellPriceResolved = resolveMaxBuyOrMinSellPrice(maxBuyOrMinSellPrice)
  const withThresholdResolved = resolveWithThreshold({ maxBuyOrMinSellPrice, triggerId })

  const sliderDefaults = prepareBasicBSSliderDefaults({
    execCollRatio,
    targetCollRatio,
    collateralizationRatio,
    publishKey,
  })

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
      maxBuyOrMinSellPrice: maxBuyOrMinSellPriceResolved,
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
      type: 'max-gas-fee-in-gwei',
      maxBaseFeeInGwei,
    })
    uiChanges.publish(publishKey, {
      type: 'with-threshold',
      withThreshold: withThresholdResolved,
    })

    uiChanges.publish(publishKey, {
      type: 'form-defaults',
      execCollRatio: sliderDefaults.execCollRatio,
      targetCollRatio: sliderDefaults.targetCollRatio,
    })

    uiChanges.publish(publishKey, {
      type: 'is-editing',
      isEditing: false,
    })
  }, [
    triggerId.toNumber(),
    collateralizationRatio.toNumber(),
    stopLossTriggerData.triggerId.toNumber(),
  ])

  useEffect(() => {
    uiChanges.publish(publishKey, {
      type: 'tx-details',
      txDetails: {},
    })
    uiChanges.publish(publishKey, {
      type: 'current-form',
      currentForm: 'add',
    })
  }, [collateralizationRatio.toNumber()])

  return isTriggerEnabled
}
