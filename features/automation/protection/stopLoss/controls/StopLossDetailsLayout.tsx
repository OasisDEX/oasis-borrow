import type BigNumber from 'bignumber.js'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { ContentCardCollateralizationRatio } from 'components/vault/detailsSection/ContentCardCollateralizationRatio'
import { ContentCardDynamicStopPrice } from 'components/vault/detailsSection/ContentCardDynamicStopPrice'
import { ContentCardEstTokenOnTrigger } from 'components/vault/detailsSection/ContentCardEstTokenOnTrigger'
import { ContentCardLtv } from 'components/vault/detailsSection/ContentCardLtv'
import { ContentCardStopLossLevel } from 'components/vault/detailsSection/ContentCardStopLossLevel'
import type { StopLossMetadataDetailCards } from 'features/automation/metadata/types'
import { StopLossDetailCards } from 'features/automation/metadata/types'
import { useTranslation } from 'next-i18next'
import React from 'react'

export interface StopLossDetailsLayoutProps {
  stopLossLevel: BigNumber
  afterStopLossLevel: BigNumber
  debt: BigNumber
  isStopLossEnabled: boolean
  lockedCollateral: BigNumber
  token: string
  debtToken: string
  liquidationRatio: BigNumber
  liquidationPrice: BigNumber
  liquidationPenalty: BigNumber
  isCollateralActive: boolean
  isEditing: boolean
  nextPositionRatio: BigNumber
  positionRatio: BigNumber
  collateralDuringLiquidation: BigNumber
  triggerMaxToken: BigNumber
  afterMaxToken: BigNumber
  dynamicStopLossPrice: BigNumber
  afterDynamicStopLossPrice: BigNumber
  ratioParamTranslationKey: string
  stopLossLevelCardFootnoteKey: string
  isAutomationDataLoaded: boolean
  isAutomationAvailable: boolean
  detailCards?: StopLossMetadataDetailCards
  customDynamicStopPriceUnit?: string
  customDynamicStopPriceUnitToken?: string
}

export function StopLossDetailsLayout({
  stopLossLevel,
  debt,
  isStopLossEnabled,
  token,
  debtToken,
  liquidationRatio,
  liquidationPrice,
  liquidationPenalty,
  afterStopLossLevel,
  isCollateralActive,
  isEditing,
  nextPositionRatio,
  positionRatio,
  afterMaxToken,
  dynamicStopLossPrice,
  afterDynamicStopLossPrice,
  collateralDuringLiquidation,
  triggerMaxToken,
  ratioParamTranslationKey,
  stopLossLevelCardFootnoteKey,
  detailCards,
  isAutomationDataLoaded,
  isAutomationAvailable,
  customDynamicStopPriceUnit,
  customDynamicStopPriceUnitToken,
}: StopLossDetailsLayoutProps) {
  const { t } = useTranslation()

  if (!(debt.isZero() && isStopLossEnabled) && detailCards) {
    const { cardsSet, cardsConfig } = detailCards

    return (
      <DetailsSection
        title={t('system.stop-loss')}
        badge={isStopLossEnabled}
        content={
          <DetailsSectionContentCardWrapper>
            {cardsConfig?.stopLossLevelCard &&
              cardsSet.includes(StopLossDetailCards.STOP_LOSS_LEVEL) && (
                <ContentCardStopLossLevel
                  isStopLossEnabled={isStopLossEnabled}
                  isEditing={isEditing}
                  stopLossLevel={stopLossLevel}
                  afterStopLossLevel={afterStopLossLevel}
                  ratioParamTranslationKey={ratioParamTranslationKey}
                  stopLossLevelCardFootnoteKey={stopLossLevelCardFootnoteKey}
                  modalDescription={cardsConfig?.stopLossLevelCard.modalDescription}
                  belowCurrentPositionRatio={
                    cardsConfig?.stopLossLevelCard.belowCurrentPositionRatio
                  }
                />
              )}
            {cardsSet.includes(StopLossDetailCards.COLLATERIZATION_RATIO) && (
              <ContentCardCollateralizationRatio
                positionRatio={positionRatio}
                nextPositionRatio={nextPositionRatio}
              />
            )}
            {cardsSet.includes(StopLossDetailCards.LOAN_TO_VALUE) && (
              <ContentCardLtv
                loanToValue={positionRatio}
                liquidationThreshold={liquidationRatio}
                automation={{
                  stopLossLevel,
                  isStopLossEnabled,
                  isAutomationDataLoaded,
                  isAutomationAvailable,
                }}
              />
            )}
            {cardsSet.includes(StopLossDetailCards.DYNAMIC_STOP_PRICE) && (
              <ContentCardDynamicStopPrice
                isStopLossEnabled={isStopLossEnabled}
                isEditing={isEditing}
                liquidationPrice={liquidationPrice}
                ratioParamTranslationKey={ratioParamTranslationKey}
                dynamicStopLossPrice={dynamicStopLossPrice}
                afterDynamicStopLossPrice={afterDynamicStopLossPrice}
                customUnit={customDynamicStopPriceUnit}
                customUnitToken={customDynamicStopPriceUnitToken}
              />
            )}
            {cardsSet.includes(StopLossDetailCards.ESTIMATED_TOKEN_ON_TRIGGER) && (
              <ContentCardEstTokenOnTrigger
                isCollateralActive={isCollateralActive}
                isStopLossEnabled={isStopLossEnabled}
                isEditing={isEditing}
                token={token}
                debtToken={debtToken}
                liquidationPenalty={liquidationPenalty}
                afterMaxToken={afterMaxToken}
                triggerMaxToken={triggerMaxToken}
                collateralDuringLiquidation={collateralDuringLiquidation}
                dynamicStopLossPrice={dynamicStopLossPrice}
                afterDynamicStopLossPrice={afterDynamicStopLossPrice}
              />
            )}
          </DetailsSectionContentCardWrapper>
        }
      />
    )
  } else {
    return <></>
  }
}
