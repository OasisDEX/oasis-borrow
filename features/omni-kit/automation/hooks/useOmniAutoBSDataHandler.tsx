import type { LendingPosition } from '@oasisdex/dma-library'
import { RiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { AutomationFeatures } from 'features/automation/common/types'
import type { OmniAutoBSAutomationTypes } from 'features/omni-kit/automation/components/auto-buy-sell/types'
import {
  useOmniCardDataAutoBSTriggerExecutionLtv,
  useOmniCardDataAutoBSTriggerTargetLtv,
} from 'features/omni-kit/components/details-section'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { one } from 'helpers/zero'
import { useTranslation } from 'next-i18next'

export const useOmniAutoBSDataHandler = ({ type }: { type: OmniAutoBSAutomationTypes }) => {
  const { t } = useTranslation()

  const {
    environment: {
      collateralPrecision,
      collateralToken,
      isShort,
      priceFormat,
      productType,
      quotePrecision,
    },
  } = useOmniGeneralContext()
  const {
    dynamicMetadata: {
      values: { automation },
    },
    automation: {
      commonForm: { state: commonState },
      automationForms,
      simulationData,
    },
    position: {
      currentPosition: { position },
    },
  } = useOmniProductContext(productType)

  const {
    collateralAmount,
    debtAmount,
  } = position as LendingPosition
  const {
    state: { triggerLtv: afterTriggerLtv, targetLtv: afterTargetLtv },
  } = automationForms[type]

  const isActive =
    commonState.uiDropdownProtection === AutomationFeatures.AUTO_SELL ||
    commonState.uiDropdownOptimization === AutomationFeatures.AUTO_BUY

  const pricesDenomination = isShort ? ('debt' as const) : ('collateral' as const)

  const resolvedTitle = {
    [AutomationFeatures.AUTO_SELL]: t('auto-sell.title'),
    [AutomationFeatures.AUTO_BUY]: t('auto-buy.title'),
  }[type]
  const resolvedFlag = {
    [AutomationFeatures.AUTO_SELL]: !!automation?.flags.isAutoSellEnabled,
    [AutomationFeatures.AUTO_BUY]: !!automation?.flags.isAutoBuyEnabled,
  }[type]
  const resolvedTrigger = {
    [AutomationFeatures.AUTO_SELL]: automation?.triggers.autoSell,
    [AutomationFeatures.AUTO_BUY]: automation?.triggers.autoBuy,
  }[type]
  const resolvedThresholdPrice = {
    [AutomationFeatures.AUTO_SELL]:
      automation?.triggers.autoSell &&
      automation.triggers.autoSell.decodedMappedParams.minSellPrice,
    [AutomationFeatures.AUTO_BUY]:
      automation?.triggers.autoBuy && automation.triggers.autoBuy.decodedMappedParams.maxBuyPrice,
  }[type]

  const currentExecutionLtv = resolvedTrigger && resolvedTrigger.decodedMappedParams.executionLtv
  const currentTargetLtv = resolvedTrigger && resolvedTrigger.decodedMappedParams.targetLtv

  const executionPrice =
    currentExecutionLtv && debtAmount.div(collateralAmount.times(currentExecutionLtv))
  const resolvedExecutionPrice = executionPrice
    ? isShort
      ? one.div(executionPrice)
      : executionPrice
    : undefined

  const autoBSTriggerExecutionLtvContentCardCommonData = useOmniCardDataAutoBSTriggerExecutionLtv({
    afterTxExecutionLTV: isActive ? afterTriggerLtv?.div(100) : undefined,
    automationFeature: type,
    collateralToken: collateralToken,
    currentExecutionLTV: currentExecutionLtv,
    denomination: priceFormat,
    executionPrice: resolvedExecutionPrice,
  })

  const autoBSTriggerTargetLtvContentCardCommonData = useOmniCardDataAutoBSTriggerTargetLtv({
    afterTxTargetLTV: isActive ? afterTargetLtv?.div(100) : undefined,
    automationFeature: type,
    collateralToken: collateralToken,
    currentTargetLTV: currentTargetLtv,
    denomination: priceFormat,
    thresholdPrice: resolvedThresholdPrice,
  })

  const afterTargetMultiply = afterTargetLtv
    ? new RiskRatio(afterTargetLtv.div(100), RiskRatio.TYPE.LTV).multiple
    : undefined

  const deviation =
    simulationData?.simulation && 'targetLTVWithDeviation' in simulationData?.simulation
      ? simulationData?.simulation.targetLTVWithDeviation
      : undefined

  const collateralAmountAfterExecution =
    simulationData?.simulation && 'collateralAmountAfterExecution' in simulationData?.simulation
      ? new BigNumber(simulationData.simulation.collateralAmountAfterExecution).shiftedBy(
          -collateralPrecision,
        )
      : undefined

  const debtAmountAfterExecution =
    simulationData?.simulation && 'debtAmountAfterExecution' in simulationData?.simulation
      ? new BigNumber(simulationData.simulation.debtAmountAfterExecution).shiftedBy(-quotePrecision)
      : undefined

  const collateralToBuyOrSellOnExecution = {
    [AutomationFeatures.AUTO_BUY]: collateralAmountAfterExecution?.minus(collateralAmount),
    [AutomationFeatures.AUTO_SELL]:
      collateralAmountAfterExecution && collateralAmount.minus(collateralAmountAfterExecution),
  }[type]

  return {
    afterTargetLtv,
    afterTargetMultiply,
    afterTriggerLtv,
    autoBSTriggerExecutionLtvContentCardCommonData,
    autoBSTriggerTargetLtvContentCardCommonData,
    collateralAmountAfterExecution,
    collateralToBuyOrSellOnExecution,
    currentExecutionLtv,
    currentTargetLtv,
    debtAmountAfterExecution,
    deviation,
    pricesDenomination,
    resolvedFlag,
    resolvedThresholdPrice,
    resolvedTitle,
    resolvedTrigger,
  }
}
