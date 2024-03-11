import BigNumber from 'bignumber.js'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import {
  ContentCardTriggerExecutionLTV,
  ContentCardTriggerTargetLTV,
} from 'features/aave/components/BasicAutomationDetailsView'
import { AutomationFeatures } from 'features/automation/common/types'
import type { OmniAutomationSimulationResponse } from 'features/omni-kit/contexts'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import type { SetupBasicAutoResponse } from 'helpers/triggers'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'

interface OmniAutoBSOverviewDetailsSectionProps {
  type: AutomationFeatures.AUTO_BUY | AutomationFeatures.AUTO_SELL
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
}) => {
  const { t } = useTranslation()
  const {
    environment: { productType, collateralToken, priceFormat },
  } = useOmniGeneralContext()
  const {
    dynamicMetadata: {
      values: { automation },
    },
    automation: {
      simulationData,
      automationForm: { state },
    },
  } = useOmniProductContext(productType)

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

  return (
    <DetailsSection
      title={resolvedTitle}
      badge={resolvedFlag}
      content={
        <DetailsSectionContentCardWrapper>
          <ContentCardTriggerExecutionLTV
            automationFeature={AutomationFeatures.AUTO_SELL}
            collateralToken={collateralToken}
            currentExecutionLTV={
              resolvedTrigger && new BigNumber(resolvedTrigger.decodedParams.executionLtv).div(100)
            }
            afterTxExecutionLTV={afterTriggerLtv}
            // nextPrice={nextPrice?.price}
            denomination={priceFormat}
          />
          <ContentCardTriggerTargetLTV
            automationFeature={AutomationFeatures.AUTO_SELL}
            collateralToken={collateralToken}
            currentTargetLTV={
              resolvedTrigger && new BigNumber(resolvedTrigger.decodedParams.targetLtv).div(100)
            }
            afterTxTargetLTV={afterTargetLtv}
            // thresholdPrice={thresholdPrice}
            // denomination={nextPrice?.denomination || getDenomination(position)}
            denomination={priceFormat}
          />
        </DetailsSectionContentCardWrapper>
      }
    />
  )
}
