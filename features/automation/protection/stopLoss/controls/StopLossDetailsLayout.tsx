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
  slRatio: BigNumber
  vaultDebt: BigNumber
  isStopLossEnabled: boolean
  lockedCollateral: BigNumber
  token: string
  liquidationRatio: BigNumber
  liquidationPenalty: BigNumber
  afterSlRatio: BigNumber
  isCollateralActive: boolean
  isEditing: boolean
  nextPositionRatio: BigNumber
  positionRatio: BigNumber
}

export function StopLossDetailsLayout({
  slRatio,
  vaultDebt,
  isStopLossEnabled,
  lockedCollateral,
  token,
  liquidationRatio,
  liquidationPenalty,
  afterSlRatio,
  isCollateralActive,
  isEditing,
  nextPositionRatio,
  positionRatio,
}: StopLossDetailsLayoutProps) {
  const { t } = useTranslation()

  const liquidationPrice = vaultDebt.times(liquidationRatio).div(lockedCollateral)

  if (!(vaultDebt.isZero() && isStopLossEnabled)) {
    return (
      <DetailsSection
        title={t('system.stop-loss')}
        badge={isStopLossEnabled}
        content={
          <DetailsSectionContentCardWrapper>
            <ContentCardStopLossCollateralRatio
              isStopLossEnabled={isStopLossEnabled}
              isEditing={isEditing}
              slRatio={slRatio}
              positionRatio={positionRatio}
              afterSlRatio={afterSlRatio}
            />
            <ContentCardCollateralizationRatio
              positionRatio={positionRatio}
              nextPositionRatio={nextPositionRatio}
            />
            <ContentCardDynamicStopPrice
              isStopLossEnabled={isStopLossEnabled}
              isEditing={isEditing}
              slRatio={slRatio}
              liquidationPrice={liquidationPrice}
              liquidationRatio={liquidationRatio}
              afterSlRatio={afterSlRatio}
              lockedCollateral={lockedCollateral}
              debt={vaultDebt}
            />
            <ContentCardEstTokenOnTrigger
              isCollateralActive={isCollateralActive}
              isStopLossEnabled={isStopLossEnabled}
              isEditing={isEditing}
              token={token}
              slRatio={slRatio}
              liquidationPrice={liquidationPrice}
              lockedCollateral={lockedCollateral}
              debt={vaultDebt}
              liquidationPenalty={liquidationPenalty}
              afterSlRatio={afterSlRatio}
            />
          </DetailsSectionContentCardWrapper>
        }
      />
    )
  } else {
    return <></>
  }
}
