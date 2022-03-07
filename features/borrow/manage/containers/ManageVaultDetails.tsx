import { getToken } from 'blockchain/tokensMetadata'
import { VaultDetailsCardCollateralLocked } from 'components/vault/detailsCards/VaultDetailsCardCollateralLocked'
import { VaultDetailsCardCollateralizationRatio } from 'components/vault/detailsCards/VaultDetailsCardCollaterlizationRatio'
import { VaultDetailsCardCurrentPrice } from 'components/vault/detailsCards/VaultDetailsCardCurrentPrice'
import { VaultDetailsCardLiquidationPrice } from 'components/vault/detailsCards/VaultDetailsCardLiquidationPrice'
import {
  AfterPillProps,
  getAfterPillColors,
  getCollRatioColor,
  VaultDetailsSummaryContainer,
  VaultDetailsSummaryItem,
} from 'components/vault/VaultDetails'
import { formatAmount } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Grid } from 'theme-ui'

import { useFeatureToggle } from '../../../../helpers/useFeatureToggle'
import { GetProtectionBannerControl } from '../../../automation/controls/GetProtectionBannerControl'
import { StopLossBannerControl } from '../../../automation/controls/StopLossBannerControl'
import { StopLossTriggeredBannerControl } from '../../../automation/controls/StopLossTriggeredBannerControl'
import { ManageVaultState } from '../pipes/manageVault'

export function ManageVaultDetailsSummary({
  vault: { debt, token, freeCollateral, daiYieldFromLockedCollateral },
  afterDebt,
  afterFreeCollateral,
  daiYieldFromTotalCollateral,
  afterPillColors,
  showAfterPill,
}: ManageVaultState & AfterPillProps) {
  const { t } = useTranslation()
  const { symbol } = getToken(token)

  return (
    <VaultDetailsSummaryContainer>
      <VaultDetailsSummaryItem
        label={t('system.vault-dai-debt')}
        value={
          <>
            {formatAmount(debt, 'DAI')}
            {` DAI`}
          </>
        }
        valueAfter={
          showAfterPill && (
            <>
              {formatAmount(afterDebt, 'DAI')}
              {` DAI`}
            </>
          )
        }
        afterPillColors={afterPillColors}
      />

      <VaultDetailsSummaryItem
        label={t('system.available-to-withdraw')}
        value={
          <>
            {formatAmount(freeCollateral, symbol)}
            {` ${symbol}`}
          </>
        }
        valueAfter={
          showAfterPill && (
            <>
              {formatAmount(afterFreeCollateral, symbol)}
              {` ${symbol}`}
            </>
          )
        }
        afterPillColors={afterPillColors}
      />
      <VaultDetailsSummaryItem
        label={t('system.available-to-generate')}
        value={
          <>
            {formatAmount(daiYieldFromLockedCollateral, 'DAI')}
            {` DAI`}
          </>
        }
        valueAfter={
          showAfterPill && (
            <>
              {formatAmount(daiYieldFromTotalCollateral, 'DAI')}
              {` DAI`}
            </>
          )
        }
        afterPillColors={afterPillColors}
      />
    </VaultDetailsSummaryContainer>
  )
}

export function ManageVaultDetails(
  props: ManageVaultState & { onBannerButtonClickHandler: () => void },
) {
  const {
    vault: { id, token, liquidationPrice, lockedCollateral, lockedCollateralUSD },
    ilkData: { liquidationRatio },
    liquidationPriceCurrentPriceDifference,
    afterLiquidationPrice,
    afterCollateralizationRatio,
    afterLockedCollateralUSD,
    inputAmountsEmpty,
    stage,
    stopLossTriggered,
  } = props

  const afterCollRatioColor = getCollRatioColor(props, afterCollateralizationRatio)
  const afterPillColors = getAfterPillColors(afterCollRatioColor)
  const showAfterPill = !inputAmountsEmpty && stage !== 'manageSuccess'
  const automationEnabled = useFeatureToggle('Automation')

  return (
    <Box>
      {automationEnabled && (
        <>
          {stopLossTriggered && <StopLossTriggeredBannerControl />}
          <GetProtectionBannerControl vaultId={id} />
          <StopLossBannerControl
            vaultId={id}
            liquidationPrice={liquidationPrice}
            liquidationRatio={liquidationRatio}
            afterLiquidationPrice={afterLiquidationPrice}
            showAfterPill={showAfterPill}
          />
        </>
      )}
      <Grid variant="vaultDetailsCardsContainer">
        <VaultDetailsCardLiquidationPrice
          liquidationPrice={liquidationPrice}
          liquidationRatio={liquidationRatio}
          liquidationPriceCurrentPriceDifference={liquidationPriceCurrentPriceDifference}
          afterLiquidationPrice={afterLiquidationPrice}
          afterPillColors={afterPillColors}
          showAfterPill={showAfterPill}
          vaultId={id}
        />
        <VaultDetailsCardCollateralizationRatio
          afterPillColors={afterPillColors}
          showAfterPill={showAfterPill}
          {...props}
        />

        <VaultDetailsCardCurrentPrice {...props.priceInfo} />
        <VaultDetailsCardCollateralLocked
          depositAmountUSD={lockedCollateralUSD}
          afterDepositAmountUSD={afterLockedCollateralUSD}
          depositAmount={lockedCollateral}
          token={token}
          afterPillColors={afterPillColors}
          showAfterPill={showAfterPill}
        />
      </Grid>
      <ManageVaultDetailsSummary
        {...props}
        afterPillColors={afterPillColors}
        showAfterPill={showAfterPill}
      />
    </Box>
  )
}
