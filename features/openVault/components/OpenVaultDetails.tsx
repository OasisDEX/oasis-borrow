import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import {
  getCollRatioColor,
  VaultDetailsCard,
  VaultDetailsCardCurrentPrice,
} from 'components/vault/VaultDetails'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'
import { Card, Grid, Text } from 'theme-ui'

import { OpenVaultState } from '../openVault'

function VaultDetailsSummaryItem({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <Grid gap={1}>
      <Text variant="paragraph3" sx={{ color: 'text.subtitle', fontWeight: 'semiBold' }}>
        {label}
      </Text>
      <Text variant="paragraph3" sx={{ fontWeight: 'semiBold' }}>
        {value}
      </Text>
    </Grid>
  )
}

export function VaultDetailsSummary({
  generateAmount,
  afterFreeCollateral,
  token,
  maxGenerateAmountCurrentPrice,
}: OpenVaultState) {
  const { t } = useTranslation()

  return (
    <Card sx={{ borderRadius: 'large', border: 'lightMuted' }}>
      <Grid columns={3} sx={{ py: 3, px: 2 }}>
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
              {formatAmount(
                afterFreeCollateral.isNegative() ? zero : afterFreeCollateral,
                getToken(token).symbol,
              )}
              {` ${getToken(token).symbol}`}
            </>
          }
        />
        <VaultDetailsSummaryItem
          label={t('system.available-to-generate')}
          value={
            <>
              {formatAmount(maxGenerateAmountCurrentPrice, 'DAI')}
              {` USD`}
            </>
          }
        />
      </Grid>
    </Card>
  )
}

export function OpenVaultDetails(props: OpenVaultState) {
  const {
    afterCollateralizationRatio,
    afterLiquidationPrice,
    token,
    depositAmount,
    depositAmountUSD,
  } = props
  const collRatioColor = getCollRatioColor(props)

  const { t } = useTranslation()

  return (
    <>
      <Grid sx={{ alignSelf: 'flex-start' }} columns={[1, '1fr 1fr']} mb={3}>
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

        {/* Collateral Locked */}
        <VaultDetailsCard
          title={`${t('system.collateral-locked')}`}
          value={`$${depositAmountUSD ? formatAmount(depositAmountUSD, 'USD') : '--'}`}
          valueBottom={
            <>
              {depositAmount ? formatAmount(depositAmount, getToken(token).symbol) : '--'}
              <Text as="span" sx={{ color: 'text.subtitle' }}>
                {` ${getToken(token).symbol}`}
              </Text>
            </>
          }
        />
      </Grid>
      <VaultDetailsSummary {...props} />
    </>
  )
}
