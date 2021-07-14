import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import {
  getCollRatioColor,
  VaultDetailsCard,
  VaultDetailsCardCollateralLocked,
  VaultDetailsCardCurrentPrice,
  VaultDetailsSummaryContainer,
  VaultDetailsSummaryItem,
} from 'components/vault/VaultDetails'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Text } from 'theme-ui'

import { OpenVaultState } from '../openVault'

export function OpenVaultDetailsSummary({
  generateAmount,
  afterFreeCollateral,
  token,
  maxGenerateAmountCurrentPrice,
}: OpenVaultState) {
  const { t } = useTranslation()
  const { symbol } = getToken(token)

  return (
    <VaultDetailsSummaryContainer>
      <VaultDetailsSummaryItem
        label={t('system.vault-dai-debt')}
        value={
          <>
            {formatAmount(generateAmount || zero, 'DAI')}
            {` DAI`}
          </>
        }
      />
      <VaultDetailsSummaryItem
        label={t('system.available-to-withdraw')}
        value={
          <>
            {formatAmount(afterFreeCollateral.isNegative() ? zero : afterFreeCollateral, symbol)}
            {` ${symbol}`}
          </>
        }
      />
      <VaultDetailsSummaryItem
        label={t('system.available-to-generate')}
        value={
          <>
            {formatAmount(maxGenerateAmountCurrentPrice, 'DAI')}
            {` DAI`}
          </>
        }
      />
    </VaultDetailsSummaryContainer>
  )
}

export function OpenVaultDetails(props: OpenVaultState) {
  const { afterCollateralizationRatio, afterLiquidationPrice } = props
  const collRatioColor = getCollRatioColor(props, props.afterCollateralizationRatio)

  const { t } = useTranslation()

  return (
    <>
      <Grid variant="vaultDetailsCardsContainer">
        <VaultDetailsCard
          title={`${t('system.liquidation-price')}`}
          value={`$${formatAmount(afterLiquidationPrice, 'USD')}`}
        />

        <VaultDetailsCard
          title={`${t('system.collateralization-ratio')}`}
          value={
            <Text as="span" sx={{ color: collRatioColor }}>
              {formatPercent(afterCollateralizationRatio.times(100), {
                precision: 2,
                roundMode: BigNumber.ROUND_DOWN,
              })}
            </Text>
          }
        />

        <VaultDetailsCardCurrentPrice {...props} />
        <VaultDetailsCardCollateralLocked {...props} />
      </Grid>
      <OpenVaultDetailsSummary {...props} />
    </>
  )
}
