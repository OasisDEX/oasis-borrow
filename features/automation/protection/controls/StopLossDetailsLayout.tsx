import BigNumber from 'bignumber.js'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { ContentCardCollateralizationRatio } from 'components/vault/detailsSection/ContentCardCollateralizationRatio'
import { ContentCardDynamicStopPrice } from 'components/vault/detailsSection/ContentCardDynamicStopPrice'
import { ContentCardEstTokenOnTrigger } from 'components/vault/detailsSection/ContentCardEstTokenOnTrigger'
import { ContentCardStopLossCollateralRatio } from 'components/vault/detailsSection/ContentCardStopLossCollateralRatio'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Grid } from 'theme-ui'

export interface StopLossDetailsLayoutProps {
  slRatio: BigNumber
  vaultDebt: BigNumber
  currentOraclePrice: BigNumber
  nextOraclePrice: BigNumber
  isStaticPrice: boolean
  isStopLossEnabled: boolean
  lockedCollateral: BigNumber
  token: string
  liquidationRatio: BigNumber
  liquidationPenalty: BigNumber
  afterSlRatio: BigNumber
  isCollateralActive: boolean
  isEditing: boolean
  collateralizationRatioAtNextPrice: BigNumber
  collateralizationRatio: BigNumber
}

export function StopLossDetailsLayout({
  slRatio,
  vaultDebt,
  currentOraclePrice,
  isStopLossEnabled,
  lockedCollateral,
  token,
  liquidationRatio,
  liquidationPenalty,
  afterSlRatio,
  isCollateralActive,
  isEditing,
  collateralizationRatioAtNextPrice,
  collateralizationRatio,
}: StopLossDetailsLayoutProps) {
  const { t } = useTranslation()

  const liquidationPrice = vaultDebt.times(liquidationRatio).div(lockedCollateral)

  if (!(vaultDebt.isZero() && isStopLossEnabled)) {
    return (
      <Grid>
        <Box>
          <DetailsSection
            title={t('system.stop-loss')}
            badge={isStopLossEnabled}
            content={
              <DetailsSectionContentCardWrapper>
                <ContentCardStopLossCollateralRatio
                  isStopLossEnabled={isStopLossEnabled}
                  isEditing={isEditing}
                  slRatio={slRatio}
                  collateralizationRatio={collateralizationRatio}
                  afterSlRatio={afterSlRatio}
                />
                <ContentCardCollateralizationRatio
                  collateralizationRatio={collateralizationRatio}
                  collateralizationRatioAtNextPrice={collateralizationRatioAtNextPrice}
                />
                <ContentCardDynamicStopPrice
                  isStopLossEnabled={isStopLossEnabled}
                  isEditing={isEditing}
                  slRatio={slRatio}
                  liquidationPrice={liquidationPrice}
                  liquidationRatio={liquidationRatio}
                  afterSlRatio={afterSlRatio}
                />
                <ContentCardEstTokenOnTrigger
                  isCollateralActive={isCollateralActive}
                  isStopLossEnabled={isStopLossEnabled}
                  isEditing={isEditing}
                  token={token}
                  slRatio={slRatio}
                  liquidationPrice={liquidationPrice}
                  liquidationRatio={liquidationRatio}
                  lockedCollateral={lockedCollateral}
                  debt={vaultDebt}
                  currentOraclePrice={currentOraclePrice}
                  liquidationPenalty={liquidationPenalty}
                  afterSlRatio={afterSlRatio}
                />
              </DetailsSectionContentCardWrapper>
            }
          />
        </Box>
      </Grid>
    )
  } else {
    return <></>
  }
}
