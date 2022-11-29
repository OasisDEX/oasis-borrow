import BigNumber from 'bignumber.js'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { ContentCardCollateralizationRatio } from 'components/vault/detailsSection/ContentCardCollateralizationRatio'
import { ContentCardDynamicStopPrice } from 'components/vault/detailsSection/ContentCardDynamicStopPrice'
import { ContentCardEstTokenOnTrigger } from 'components/vault/detailsSection/ContentCardEstTokenOnTrigger'
import { ContentCardStopLossLevel } from 'components/vault/detailsSection/ContentCardStopLossLevel'
import {
  StopLossDetailCards,
  StopLossMetadataDetailCards,
} from 'features/automation/metadata/types'
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
  ratioParamTranslationKey: string
  detailCards?: StopLossMetadataDetailCards
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
  collateralDuringLiquidation,
  triggerMaxToken,
  ratioParamTranslationKey,
  detailCards,
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
              // TODO replace with LTV Card
              <ContentCardCollateralizationRatio
                positionRatio={positionRatio}
                nextPositionRatio={nextPositionRatio}
              />
            )}
            {cardsSet.includes(StopLossDetailCards.DYNAMIC_STOP_PRICE) && (
              <ContentCardDynamicStopPrice
                isStopLossEnabled={isStopLossEnabled}
                isEditing={isEditing}
                stopLossLevel={stopLossLevel}
                liquidationPrice={liquidationPrice}
                liquidationRatio={liquidationRatio}
                afterStopLossLevel={afterStopLossLevel}
                ratioParamTranslationKey={ratioParamTranslationKey}
              />
            )}
            {cardsSet.includes(StopLossDetailCards.ESTIMATED_TOKEN_ON_TRIGGER) && (
              <ContentCardEstTokenOnTrigger
                isCollateralActive={isCollateralActive}
                isStopLossEnabled={isStopLossEnabled}
                isEditing={isEditing}
                token={token}
                debtToken={debtToken}
                stopLossLevel={stopLossLevel}
                liquidationPrice={liquidationPrice}
                liquidationRatio={liquidationRatio}
                liquidationPenalty={liquidationPenalty}
                afterStopLossLevel={afterStopLossLevel}
                afterMaxToken={afterMaxToken}
                triggerMaxToken={triggerMaxToken}
                collateralDuringLiquidation={collateralDuringLiquidation}
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
