import { TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { InstiVault } from 'blockchain/instiVault'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { extractBasicBSData } from 'features/automation/common/basicBSTriggerData'
import {
  DEFAULT_DISTANCE_FROM_TRIGGER_TO_TARGET,
  resolveMaxBuyOrMinSellPrice,
  resolveWithThreshold,
} from 'features/automation/common/helpers'
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
    maxBaseFeeInGwei,
  } = extractBasicBSData({ triggersData: autoTriggersData, triggerType: type })
  const collateralizationRatio = vault.collateralizationRatio.toNumber()

  const publishKey = type === TriggerType.BasicBuy ? BASIC_BUY_FORM_CHANGE : BASIC_SELL_FORM_CHANGE
  const maxBuyOrMinSellPriceResolved = resolveMaxBuyOrMinSellPrice(maxBuyOrMinSellPrice)
  const withThresholdResolved = resolveWithThreshold({ maxBuyOrMinSellPrice, triggerId })

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
    const defaultTriggerForSell = new BigNumber(
      collateralizationRatio - DEFAULT_DISTANCE_FROM_TRIGGER_TO_TARGET,
    )
    const defaultTriggerForBuy = new BigNumber(
      collateralizationRatio + DEFAULT_DISTANCE_FROM_TRIGGER_TO_TARGET,
    )
    const defaultTargetCollRatio = new BigNumber(collateralizationRatio)
    uiChanges.publish(publishKey, {
      type: 'form-defaults',
      execCollRatio:
        publishKey === 'BASIC_SELL_FORM_CHANGE'
          ? defaultTriggerForSell.times(100).decimalPlaces(0, BigNumber.ROUND_DOWN)
          : defaultTriggerForBuy.times(100).decimalPlaces(0, BigNumber.ROUND_DOWN),
      targetCollRatio: defaultTargetCollRatio.times(100).decimalPlaces(0, BigNumber.ROUND_DOWN),
    })
  }, [triggerId.toNumber(), collateralizationRatio])

  useEffect(() => {
    uiChanges.publish(publishKey, {
      type: 'tx-details',
      txDetails: {},
    })
    uiChanges.publish(publishKey, {
      type: 'current-form',
      currentForm: 'add',
    })
  }, [collateralizationRatio])

  return isTriggerEnabled
}
