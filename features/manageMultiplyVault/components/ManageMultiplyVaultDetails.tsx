import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import {
  VaultDetailsCard,
  VaultDetailsCardCollateralLocked,
  VaultDetailsCardCurrentPrice,
  VaultDetailsSummaryContainer,
  VaultDetailsSummaryItem,
} from 'components/vault/VaultDetails'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Grid, Text } from 'theme-ui'

import { ManageMultiplyVaultState } from '../manageMultiplyVault'

function ManageMultiplyVaultDetailsSummary({
  vault: { debt, token, freeCollateral, daiYieldFromLockedCollateral },
}: ManageMultiplyVaultState) {
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
      />

      <VaultDetailsSummaryItem
        label={t('system.available-to-withdraw')}
        value={
          <>
            {formatAmount(freeCollateral, symbol)}
            {` ${symbol}`}
          </>
        }
      />
      <VaultDetailsSummaryItem
        label={t('system.available-to-generate')}
        value={
          <>
            {formatAmount(daiYieldFromLockedCollateral, 'DAI')}
            {` DAI`}
          </>
        }
      />
    </VaultDetailsSummaryContainer>
  )
}

export function ManageMultiplyVaultDetails(props: ManageMultiplyVaultState) {
  const {
    vault: {
      token,
      collateralizationRatio,
      liquidationPrice,
      lockedCollateral,
      lockedCollateralUSD,
      underCollateralized,
      atRiskLevelDanger,
      atRiskLevelWarning,
    },
  } = props
  const { t } = useTranslation()
  const collRatioColor = collateralizationRatio.isZero()
    ? 'primary'
    : atRiskLevelDanger || underCollateralized
    ? 'onError'
    : atRiskLevelWarning
    ? 'onWarning'
    : 'onSuccess'

  return (
    <Box>
      <Grid variant="vaultDetailsCardsContainer">
        <VaultDetailsCard
          title={`${t('system.liquidation-price')}`}
          value={`$${formatAmount(liquidationPrice, 'USD')}`}
          // TO DO liquidationPriceNextPrice!
          valueBottom={
            <>
              ${formatAmount(liquidationPrice, 'USD')}
              <Text as="span" sx={{ color: 'text.subtitle' }}>
                {` on next price`}
              </Text>
            </>
          }
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
          // TO DO collateralizationRatioNextPrice!
          valueBottom={
            <>
              <Text as="span" sx={{ color: collRatioColor }}>
                {formatPercent(collateralizationRatio.times(100), {
                  precision: 2,
                  roundMode: BigNumber.ROUND_DOWN,
                })}
              </Text>
              <Text as="span" sx={{ color: 'text.subtitle' }}>
                {` on next price`}
              </Text>
            </>
          }
        />

        <VaultDetailsCardCurrentPrice {...props} />
        <VaultDetailsCardCollateralLocked
          depositAmountUSD={lockedCollateralUSD}
          depositAmount={lockedCollateral}
          token={token}
        />
      </Grid>
      <ManageMultiplyVaultDetailsSummary {...props} />
    </Box>
  )
}
