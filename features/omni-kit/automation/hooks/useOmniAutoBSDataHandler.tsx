import type { LendingPosition } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { AutomationFeatures } from 'features/automation/common/types'
import {
  useOmniCardDataAutoBSTriggerExecutionLtv,
  useOmniCardDataAutoBSTriggerTargetLtv,
} from 'features/omni-kit/components/details-section'
import type { OmniAutomationSimulationResponse } from 'features/omni-kit/contexts'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import type { SetupBasicAutoResponse } from 'helpers/triggers'
import { one } from 'helpers/zero'
import { useTranslation } from 'next-i18next'

const isAutoBSSimulationResponse = (
  resp?: OmniAutomationSimulationResponse,
): resp is SetupBasicAutoResponse => {
  if (!resp) {
    return true
  }

  return 'executionLTV' in resp && 'targetLTV' in resp
}

export const useOmniAutoBSDataHandler = ({
  type,
}: {
  type: AutomationFeatures.AUTO_BUY | AutomationFeatures.AUTO_SELL
}) => {
  const { t } = useTranslation()
  const {
    environment: { productType, collateralToken, priceFormat, isShort },
  } = useOmniGeneralContext()
  const {
    dynamicMetadata: {
      values: { automation },
    },
    automation: {
      simulationData,
      automationForm: { state },
    },
    position: {
      currentPosition: { position },
    },
  } = useOmniProductContext(productType)

  const castedPosition = position as LendingPosition

  const isActive =
    state.uiDropdownProtection === AutomationFeatures.AUTO_SELL ||
    state.uiDropdownOptimization === AutomationFeatures.AUTO_BUY

  if (!isAutoBSSimulationResponse(simulationData)) {
    throw new Error('Wrong auto BS simulation response type')
  }

  const afterTriggerLtv = state?.triggerLtv
  const afterTargetLtv = state?.targetLtv

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
      new BigNumber(automation?.triggers.autoSell?.decodedParams.minSellPrice),
    [AutomationFeatures.AUTO_BUY]:
      automation?.triggers.autoBuy &&
      new BigNumber(automation?.triggers.autoBuy?.decodedParams.maxBuyPrice),
  }[type]

  const currentExecutionLTV =
    resolvedTrigger && new BigNumber(resolvedTrigger.decodedParams.executionLtv).div(10000)
  const currentTargetLTV =
    resolvedTrigger && new BigNumber(resolvedTrigger.decodedParams.targetLtv).div(10000)

  const debtToCollateralRatio =
    currentExecutionLTV &&
    castedPosition.debtAmount.div(castedPosition.collateralAmount.times(currentExecutionLTV))

  const nextPrice = debtToCollateralRatio
    ? isShort
      ? one.div(debtToCollateralRatio)
      : debtToCollateralRatio
    : undefined

  const autoBSTriggerExecutionLtvContentCardCommonData = useOmniCardDataAutoBSTriggerExecutionLtv({
    automationFeature: type,
    collateralToken: collateralToken,
    currentExecutionLTV: currentExecutionLTV,
    afterTxExecutionLTV: isActive ? afterTriggerLtv : undefined,
    nextPrice: nextPrice,
    denomination: priceFormat,
  })

  const autoBSTriggerTargetLtvContentCardCommonData = useOmniCardDataAutoBSTriggerTargetLtv({
    automationFeature: type,
    collateralToken: collateralToken,
    currentTargetLTV: currentTargetLTV,
    afterTxTargetLTV: isActive ? afterTargetLtv : undefined,
    thresholdPrice: resolvedThresholdPrice,
    denomination: priceFormat,
  })

  return {
    castedPosition,
    isActive,
    afterTriggerLtv,
    afterTargetLtv,
    resolvedTitle,
    resolvedFlag,
    resolvedTrigger,
    resolvedThresholdPrice,
    currentExecutionLTV,
    currentTargetLTV,
    debtToCollateralRatio,
    nextPrice,
    autoBSTriggerExecutionLtvContentCardCommonData,
    autoBSTriggerTargetLtvContentCardCommonData,
  }
}
