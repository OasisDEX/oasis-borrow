import type { LendingPosition } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { AutomationFeatures } from 'features/automation/common/types'
import { resolveActiveOrder } from 'features/omni-kit/automation/helpers'
import {
  OmniContentCard,
  useOmniCardDataAutoBSTriggerExecutionLtv,
  useOmniCardDataAutoBSTriggerTargetLtv,
} from 'features/omni-kit/components/details-section'
import type { OmniAutomationSimulationResponse } from 'features/omni-kit/contexts'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import type { SetupBasicAutoResponse } from 'helpers/triggers'
import { one } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'

interface OmniAutoBSOverviewDetailsSectionProps {
  type: AutomationFeatures.AUTO_BUY | AutomationFeatures.AUTO_SELL
  active?: boolean
}

const isAutoBSSimulationResponse = (
  resp?: OmniAutomationSimulationResponse,
): resp is SetupBasicAutoResponse => {
  if (!resp) {
    return true
  }

  return 'executionLTV' in resp && 'targetLTV' in resp
}

export const OmniAutoBSOverviewDetailsSection: FC<OmniAutoBSOverviewDetailsSectionProps> = ({
  type,
  active,
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

  if (!isAutoBSSimulationResponse(simulationData?.simulationResponse)) {
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
    afterTxExecutionLTV: afterTriggerLtv,
    nextPrice: nextPrice,
    denomination: priceFormat,
  })

  const autoBSTriggerTargetLtvContentCardCommonData = useOmniCardDataAutoBSTriggerTargetLtv({
    automationFeature: type,
    collateralToken: collateralToken,
    currentTargetLTV: currentTargetLTV,
    afterTxTargetLTV: afterTargetLtv,
    thresholdPrice: resolvedThresholdPrice,
    denomination: priceFormat,
  })

  return (
    <DetailsSection
      sx={resolveActiveOrder(active)}
      title={resolvedTitle}
      badge={resolvedFlag}
      content={
        <DetailsSectionContentCardWrapper>
          <OmniContentCard {...autoBSTriggerExecutionLtvContentCardCommonData} />
          <OmniContentCard {...autoBSTriggerTargetLtvContentCardCommonData} />
        </DetailsSectionContentCardWrapper>
      }
    />
  )
}
