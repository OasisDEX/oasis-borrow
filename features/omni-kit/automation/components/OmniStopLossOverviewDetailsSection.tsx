import type { AaveLikePositionV2 } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { AutomationFeatures } from 'features/automation/common/types'
import {
  getDynamicStopLossPrice,
  getMaxToken,
} from 'features/automation/protection/stopLoss/helpers'
import type { OmniCardLtvAutomationData } from 'features/omni-kit/components/details-section'
import {
  OmniCardDataDynamicStopLossPriceModal,
  OmniCardDataEstTokenOnTriggerModal,
  OmniCardDataLtvModal,
  OmniCardDataStopLossLtvModal,
  OmniContentCard,
  useOmniCardDataDynamicStopLossPrice,
  useOmniCardDataEstTokenOnTrigger,
  useOmniCardDataLtv,
  useOmniCardDataStopLossLtv,
} from 'features/omni-kit/components/details-section'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { one } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

export const OmniStopLossOverviewDetailsSection = ({ active = false }: { active?: boolean }) => {
  const { t } = useTranslation()
  const {
    environment: { productType, collateralToken, quoteToken, isShort, priceFormat },
  } = useOmniGeneralContext()
  const {
    dynamicMetadata: {
      values: { automation },
    },
    automation: {
      automationForm: { state },
    },
    position: {
      currentPosition: { position },
    },
  } = useOmniProductContext(productType)

  // during clean up extend LendingPosition with common properties
  const castedPosition = position as AaveLikePositionV2

  const isStopLossEnabled = !!automation?.flags.isStopLossEnabled

  // maybe we could always resolve it to either ltv or executionLtv
  const currentTriggerLtv =
    automation?.triggers.stopLoss?.decodedParams?.ltv ||
    automation?.triggers.stopLoss?.decodedParams?.executionLtv

  const stopLossLevel = currentTriggerLtv ? new BigNumber(currentTriggerLtv).div(10000) : undefined
  const afterStopLossLevel = state.triggerLtv

  const isCollateralActive = !!automation?.triggers.stopLoss?.triggerTypeName.includes('Collateral')
  const closeToToken = isCollateralActive ? collateralToken : quoteToken
  const stateCloseToToken = state.resolveTo === 'collateral' ? collateralToken : quoteToken

  const dynamicStopLossPrice =
    stopLossLevel &&
    getDynamicStopLossPrice({
      liquidationPrice: castedPosition.liquidationPrice,
      liquidationRatio: one.div(castedPosition.maxRiskRatio.loanToValue),
      stopLossLevel: one.div(stopLossLevel.div(100)).times(100),
    })

  const afterDynamicStopLossPrice =
    afterStopLossLevel &&
    getDynamicStopLossPrice({
      liquidationPrice: castedPosition.liquidationPrice,
      liquidationRatio: one.div(castedPosition.maxRiskRatio.loanToValue),
      stopLossLevel: one.div(afterStopLossLevel.div(100)).times(100),
    })

  const resolvedAfterDynamicStopLossPrice = afterDynamicStopLossPrice
    ? (isShort ? one.div(afterDynamicStopLossPrice) : afterDynamicStopLossPrice).div(100)
    : undefined

  const resolvedDynamicStopLossPrice = dynamicStopLossPrice
    ? (isShort ? one.div(dynamicStopLossPrice) : dynamicStopLossPrice).div(100)
    : undefined

  const stopLossLtvContentCardCommonData = useOmniCardDataStopLossLtv({
    stopLossLtv: stopLossLevel,
    afterStopLossLtv: afterStopLossLevel,
    loanToValue: castedPosition.riskRatio.loanToValue,
    ratioToPositionLtv: stopLossLevel?.minus(castedPosition.riskRatio.loanToValue),
    modal: <OmniCardDataStopLossLtvModal stopLossLtv={stopLossLevel} />,
  })

  const dynamicStopPriceContentCardCommonData = useOmniCardDataDynamicStopLossPrice({
    dynamicStopPrice: resolvedDynamicStopLossPrice,
    afterDynamicStopPrice: resolvedAfterDynamicStopLossPrice,
    priceFormat,
    ratioToLiquidationPrice: resolvedDynamicStopLossPrice?.minus(castedPosition.liquidationPrice),
    modal: (
      <OmniCardDataDynamicStopLossPriceModal
        dynamicStopLossPrice={resolvedDynamicStopLossPrice}
        priceFormat={priceFormat}
      />
    ),
  })

  const maxToken =
    stopLossLevel &&
    getMaxToken({
      stopLossLevel: one.div(stopLossLevel).times(100),
      lockedCollateral: castedPosition.collateralAmount,
      liquidationRatio: one.div(castedPosition.maxRiskRatio.loanToValue),
      liquidationPrice: castedPosition.liquidationPrice,
      debt: castedPosition.debtAmount,
    })

  const afterMaxToken =
    afterStopLossLevel &&
    getMaxToken({
      stopLossLevel: one.div(afterStopLossLevel).times(100),
      lockedCollateral: castedPosition.collateralAmount,
      liquidationRatio: one.div(castedPosition.maxRiskRatio.loanToValue),
      liquidationPrice: castedPosition.liquidationPrice,
      debt: castedPosition.debtAmount,
    })

  const estTokenOnTriggerContentCardCommonData = useOmniCardDataEstTokenOnTrigger({
    isCollateralActive,
    liquidationPrice: castedPosition.liquidationPrice,
    collateralAmount: castedPosition.collateralAmount,
    debtAmount: castedPosition.debtAmount,
    collateralToken,
    liquidationPenalty: castedPosition.liquidationPenalty,
    dynamicStopLossPrice: resolvedDynamicStopLossPrice,
    afterDynamicStopLossPrice: resolvedAfterDynamicStopLossPrice,
    closeToToken,
    stateCloseToToken,
    maxToken,
    afterMaxToken,
    modal: (
      <OmniCardDataEstTokenOnTriggerModal
        token={closeToToken}
        liquidationPenalty={castedPosition.liquidationPenalty}
      />
    ),
  })

  const omniCardLtvAutomationData: OmniCardLtvAutomationData = {
    isStopLossLikeEnabled: isStopLossEnabled,
    stopLossLikeTriggerLevel: stopLossLevel,
    stopLossType: AutomationFeatures.STOP_LOSS,
  }

  const ltvContentCardCommonData = useOmniCardDataLtv({
    ltv: castedPosition.riskRatio.loanToValue,
    maxLtv: castedPosition.category.liquidationThreshold,
    automation: omniCardLtvAutomationData,
    modal: (
      <OmniCardDataLtvModal
        ltv={castedPosition.riskRatio.loanToValue}
        maxLtv={castedPosition.category.liquidationThreshold}
        automation={omniCardLtvAutomationData}
      />
    ),
  })

  return (
    <DetailsSection
      sx={active ? { order: -1 } : undefined}
      title={t('system.stop-loss')}
      badge={isStopLossEnabled}
      content={
        <DetailsSectionContentCardWrapper>
          <OmniContentCard {...stopLossLtvContentCardCommonData} />
          <OmniContentCard {...ltvContentCardCommonData} />
          <OmniContentCard {...dynamicStopPriceContentCardCommonData} />
          <OmniContentCard {...estTokenOnTriggerContentCardCommonData} />
        </DetailsSectionContentCardWrapper>
      }
    />
  )
}
