import BigNumber from 'bignumber.js'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { ContentCardCollateralizationRatio } from 'components/vault/detailsSection/ContentCardCollateralizationRatio'
import { ContentCardDynamicStopPrice } from 'components/vault/detailsSection/ContentCardDynamicStopPrice'
import { ContentCardEstTokenOnTrigger } from 'components/vault/detailsSection/ContentCardEstTokenOnTrigger'
import { ContentCardStopLossCollateralRatio } from 'components/vault/detailsSection/ContentCardStopLossCollateralRatio'
import { useTranslation } from 'next-i18next'
import React from 'react'

export interface StopLossDetailsLayoutProps {
  stopLossLevel: BigNumber
  afterStopLossLevel: BigNumber
  debt: BigNumber
  isStopLossEnabled: boolean
  lockedCollateral: BigNumber
  token: string
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
}

export function StopLossDetailsLayout({
  stopLossLevel,
  debt,
  isStopLossEnabled,
  token,
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
}: StopLossDetailsLayoutProps) {
  const { t } = useTranslation()

  if (!(debt.isZero() && isStopLossEnabled)) {
    return (
      <DetailsSection
        title={t('system.stop-loss')}
        badge={isStopLossEnabled}
        content={
          <DetailsSectionContentCardWrapper>
            <ContentCardStopLossCollateralRatio
              isStopLossEnabled={isStopLossEnabled}
              isEditing={isEditing}
              stopLossLevel={stopLossLevel}
              positionRatio={positionRatio}
              afterStopLossLevel={afterStopLossLevel}
            />
            <ContentCardCollateralizationRatio
              positionRatio={positionRatio}
              nextPositionRatio={nextPositionRatio}
            />
            <ContentCardDynamicStopPrice
              isStopLossEnabled={isStopLossEnabled}
              isEditing={isEditing}
              stopLossLevel={stopLossLevel}
              liquidationPrice={liquidationPrice}
              liquidationRatio={liquidationRatio}
              afterStopLossLevel={afterStopLossLevel}
            />
            <ContentCardEstTokenOnTrigger
              isCollateralActive={isCollateralActive}
              isStopLossEnabled={isStopLossEnabled}
              isEditing={isEditing}
              token={token}
              stopLossLevel={stopLossLevel}
              liquidationPrice={liquidationPrice}
              liquidationRatio={liquidationRatio}
              liquidationPenalty={liquidationPenalty}
              afterStopLossLevel={afterStopLossLevel}
              afterMaxToken={afterMaxToken}
              triggerMaxToken={triggerMaxToken}
              collateralDuringLiquidation={collateralDuringLiquidation}
            />
          </DetailsSectionContentCardWrapper>
        }
      />
    )
  } else {
    return <></>
  }
}
