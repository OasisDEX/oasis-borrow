import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { VaultDetailsCardCurrentPrice } from 'components/vault/detailsCards/VaultDetailsCardCurrentPrice'
import {
  AfterPillProps,
  getAfterPillColors,
  getCollRatioColor,
  VaultDetailsCard,
  VaultDetailsSummaryContainer,
  VaultDetailsSummaryItem,
} from 'components/vault/VaultDetails'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useModal } from 'helpers/modalHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Grid, Text } from 'theme-ui'

import { VaultDetailsCardCollateralLocked } from '../../../../components/vault/detailsCards/VaultDetailsCardCollateralLocked'
import { VaultDetailsCardCollaterlizationRatioModal } from '../../../../components/vault/detailsCards/VaultDetailsCardCollaterlizationRatio'
import { VaultDetailsCardLiquidationPrice } from '../../../../components/vault/detailsCards/VaultDetailsCardLiquidationPrice'
import { useFeatureToggle } from '../../../../helpers/useFeatureToggle'
import { GetProtectionBannerControl } from '../../../automation/controls/GetProtectionBannerControl'
import { StopLossBannerControl } from '../../../automation/controls/StopLossBannerControl'
import { ManageVaultState } from '../pipes/manageVault'

function ManageVaultDetailsSummary({
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
    vault: {
      id,
      token,
      collateralizationRatio,
      liquidationPrice,
      lockedCollateral,
      lockedCollateralUSD,
    },
    ilkData: { liquidationRatio },
    liquidationPriceCurrentPriceDifference,
    afterLiquidationPrice,
    afterCollateralizationRatio,
    afterLockedCollateralUSD,
    collateralizationRatioAtNextPrice,
    inputAmountsEmpty,
    stage,
  } = props
  const { t } = useTranslation()
  const openModal = useModal()
  const collRatioColor = getCollRatioColor(props, collateralizationRatio)
  const collRatioNextPriceColor = getCollRatioColor(props, collateralizationRatioAtNextPrice)
  const afterCollRatioColor = getCollRatioColor(props, afterCollateralizationRatio)
  const afterPillColors = getAfterPillColors(afterCollRatioColor)
  const showAfterPill = !inputAmountsEmpty && stage !== 'manageSuccess'
  const automationEnabled = useFeatureToggle('Automation')

  return (
    <Box>
      {automationEnabled && (
        <>
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
          {...{
            liquidationPrice,
            liquidationPriceCurrentPriceDifference,
            afterLiquidationPrice,
            afterPillColors,
            showAfterPill,
          }}
        />

        <VaultDetailsCard
          title={`${t('system.collateralization-ratio')}`}
          value={
            <Text as="span" sx={{ color: collRatioColor }}>
              {formatPercent(collateralizationRatio.times(100), {
                precision: 2,
                roundMode: BigNumber.ROUND_DOWN,
              })}
            </Text>
          }
          valueAfter={
            showAfterPill &&
            formatPercent(afterCollateralizationRatio.times(100), {
              precision: 2,
              roundMode: BigNumber.ROUND_DOWN,
            })
          }
          valueBottom={
            <>
              <Text as="span" sx={{ color: collRatioNextPriceColor }}>
                {formatPercent(collateralizationRatioAtNextPrice.times(100), {
                  precision: 2,
                  roundMode: BigNumber.ROUND_DOWN,
                })}
              </Text>
              <Text as="span" sx={{ color: 'text.subtitle' }}>
                {` on next price`}
              </Text>
            </>
          }
          openModal={() =>
            openModal(VaultDetailsCardCollaterlizationRatioModal, {
              collateralRatioOnNextPrice: collateralizationRatioAtNextPrice,
              currentCollateralRatio: collateralizationRatio,
            })
          }
          afterPillColors={afterPillColors}
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
