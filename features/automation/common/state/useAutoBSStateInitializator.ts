import { TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import {
  prepareAutoBSSliderDefaults,
  resolveMaxBuyOrMinSellPrice,
  resolveWithThreshold,
} from 'features/automation/common/helpers'
import {
  AUTO_BUY_FORM_CHANGE,
  AUTO_SELL_FORM_CHANGE,
} from 'features/automation/common/state/autoBSFormChange'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { useEffect } from 'react'

export function useAutoBSstateInitialization({
  autoTriggersData,
  stopLossTriggerData,
  type,
  positionRatio,
}: {
  positionRatio: BigNumber
  autoTriggersData: AutoBSTriggerData
  stopLossTriggerData: StopLossTriggerData
  type: TriggerType
}) {
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

  const publishKey = type === TriggerType.BasicBuy ? AUTO_BUY_FORM_CHANGE : AUTO_SELL_FORM_CHANGE
  const maxBuyOrMinSellPriceResolved = resolveMaxBuyOrMinSellPrice(maxBuyOrMinSellPrice)
  const withThresholdResolved = resolveWithThreshold({ maxBuyOrMinSellPrice, triggerId })

  const sliderDefaults = prepareAutoBSSliderDefaults({
    execCollRatio,
    targetCollRatio,
    positionRatio,
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

    uiChanges.publish(publishKey, {
      type: 'is-awaiting-confirmation',
      isAwaitingConfirmation: false,
    })
  }, [triggerId.toNumber(), positionRatio.toNumber(), stopLossTriggerData.triggerId.toNumber()])

  useEffect(() => {
    uiChanges.publish(publishKey, {
      type: 'tx-details',
      txDetails: {},
    })
    uiChanges.publish(publishKey, {
      type: 'current-form',
      currentForm: 'add',
    })
  }, [positionRatio.toNumber()])

  return isTriggerEnabled
}
