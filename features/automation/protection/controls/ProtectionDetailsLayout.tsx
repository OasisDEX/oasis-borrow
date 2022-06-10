import BigNumber from 'bignumber.js'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { VaultDetailsCardCurrentPrice } from 'components/vault/detailsCards/VaultDetailsCardCurrentPrice'
import { VaultDetailsCardDynamicStopPrice } from 'components/vault/detailsCards/VaultDetailsCardDynamicStopPrice'
import { VaultDetailsCardMaxTokenOnStopLossTrigger } from 'components/vault/detailsCards/VaultDetailsCardMaxTokenOnStopLossTrigger'
import { VaultDetailsCardStopLossCollRatio } from 'components/vault/detailsCards/VaultDetailsCardStopLossCollRatio'
import { ContentCardDynamicStopPrice } from 'components/vault/detailsSection/ContentCardDynamicStopPrice'
import { ContentCardEstTokenOnTrigger } from 'components/vault/detailsSection/ContentCardEstTokenOnTrigger'
import { ContentCardStopLossCollateralRatio } from 'components/vault/detailsSection/ContentCardStopLossCollateralRatio'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Grid } from 'theme-ui'

import { calculatePricePercentageChange } from '../../../../blockchain/prices'
import { getAfterPillColors } from '../../../../components/vault/VaultDetails'

export interface ProtectionDetailsLayoutProps {
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
}

export function ProtectionDetailsLayout({
  slRatio,
  vaultDebt,
  currentOraclePrice,
  nextOraclePrice,
  isStaticPrice,
  isStopLossEnabled,
  lockedCollateral,
  token,
  liquidationRatio,
  liquidationPenalty,
  afterSlRatio,
  isCollateralActive,
  isEditing,
  collateralizationRatioAtNextPrice,
}: ProtectionDetailsLayoutProps) {
  const { t } = useTranslation()
  const afterPillColors = getAfterPillColors('onSuccess')
  const newComponentsEnabled = useFeatureToggle('NewComponents')

  const percentageChange = calculatePricePercentageChange(currentOraclePrice, nextOraclePrice)

  const liquidationPrice = vaultDebt.times(liquidationRatio).div(lockedCollateral)

  return (
    <Box>
      {!newComponentsEnabled ? (
        <Grid variant="vaultDetailsCardsContainer">
          <VaultDetailsCardStopLossCollRatio
            slRatio={slRatio}
            collateralizationRatioAtNextPrice={collateralizationRatioAtNextPrice}
            isProtected={isStopLossEnabled}
            showAfterPill={isEditing}
            afterSlRatio={afterSlRatio}
            afterPillColors={afterPillColors}
          />
          <VaultDetailsCardDynamicStopPrice
            slRatio={slRatio}
            liquidationPrice={liquidationPrice}
            liquidationRatio={liquidationRatio}
            isProtected={isStopLossEnabled}
            showAfterPill={isEditing}
            afterSlRatio={afterSlRatio}
            afterPillColors={afterPillColors}
          />
          <VaultDetailsCardCurrentPrice
            currentCollateralPrice={currentOraclePrice}
            nextCollateralPrice={nextOraclePrice}
            isStaticCollateralPrice={isStaticPrice}
            collateralPricePercentageChange={percentageChange}
          />

          <VaultDetailsCardMaxTokenOnStopLossTrigger
            slRatio={slRatio}
            isProtected={isStopLossEnabled}
            liquidationPrice={liquidationPrice}
            liquidationPenalty={liquidationPenalty}
            debt={vaultDebt}
            liquidationRatio={liquidationRatio}
            token={token}
            showAfterPill={isEditing}
            lockedCollateral={lockedCollateral}
            afterSlRatio={afterSlRatio}
            afterPillColors={afterPillColors}
            isCollateralActive={isCollateralActive}
            tokenPrice={currentOraclePrice}
          />
        </Grid>
      ) : (
        <DetailsSection
          title={t('system.protection')}
          badge={isStopLossEnabled}
          content={
            <DetailsSectionContentCardWrapper>
              <ContentCardStopLossCollateralRatio
                isStopLossEnabled={isStopLossEnabled}
                isEditing={isEditing}
                slRatio={slRatio}
                collateralizationRatioAtNextPrice={collateralizationRatioAtNextPrice}
                afterSlRatio={afterSlRatio}
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
      )}
    </Box>
  )
}
