import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import {
  AfterPillProps,
  getAfterPillColors,
  getCollRatioColor,
  VaultDetailsCard,
  VaultDetailsCardCollateralLocked,
  VaultDetailsCardCollaterlizationRatioModal,
  VaultDetailsCardCurrentPrice,
  VaultDetailsCardLiquidationPrice,
  VaultDetailsSummaryContainer,
  VaultDetailsSummaryItem,
} from 'components/vault/VaultDetails'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useModal } from 'helpers/modalHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Grid, Text } from 'theme-ui'

import { ManageVaultState } from './manageVault'

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

export function ManageVaultDetails(props: ManageVaultState) {
  const {
    vault: {
      token,
      collateralizationRatio,
      liquidationPrice,
      lockedCollateral,
      lockedCollateralUSD,
    },
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

  return (
    <Box>
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

        <VaultDetailsCardCurrentPrice {...props} />
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
