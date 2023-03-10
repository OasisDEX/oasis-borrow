import BigNumber from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Grid } from 'theme-ui'

import { formatCryptoBalance, formatPercent } from '../../helpers/formatters/format'
import { VaultIlkDetailsItem } from './VaultHeader'

export interface VaultHeaderLayoutProps {
  id: BigNumber
  stabilityFee: BigNumber
  debtFloor: BigNumber
  liquidationPenalty?: BigNumber
  liquidationRatio?: BigNumber
  originationFeePercent?: BigNumber
}

export function VaultHeaderLayout({
  id,
  stabilityFee,
  debtFloor,
  liquidationPenalty,
  liquidationRatio,
  originationFeePercent,
}: VaultHeaderLayoutProps) {
  const { t } = useTranslation()
  return (
    <Grid mt={4}>
      <Box
        sx={{
          mb: 4,
          fontSize: 1,
          fontWeight: 'semiBold',
          color: 'neutral80',
          display: ['grid', 'flex'],
          gridTemplateColumns: '1fr 1fr',
          gap: [2, 0],
        }}
      >
        <VaultIlkDetailsItem
          label="VaultID"
          value={id ? id.toFixed(0) : 'T.B.D'}
          tooltipContent={t('manage-multiply-vault.tooltip.vaultId')}
        />
        <VaultIlkDetailsItem
          label={t('manage-vault.stability-fee')}
          value={`${formatPercent(stabilityFee.times(100), { precision: 2 })}`}
          tooltipContent={t('manage-multiply-vault.tooltip.stabilityFee')}
          styles={{
            tooltip: {
              left: ['auto', '-20px'],
              right: ['0px', 'auto'],
            },
          }}
        />
        {liquidationPenalty && (
          <VaultIlkDetailsItem
            label={t('manage-vault.liquidation-fee')}
            value={`${formatPercent(liquidationPenalty.times(100))}`}
            tooltipContent={t('manage-multiply-vault.tooltip.liquidationFee')}
          />
        )}
        {liquidationRatio && (
          <VaultIlkDetailsItem
            label={t('manage-vault.min-collat-ratio')}
            value={`${formatPercent(liquidationRatio.times(100))}`}
            tooltipContent={t('manage-multiply-vault.tooltip.min-collateral')}
            styles={{
              tooltip: {
                left: 'auto',
                right: ['10px', '-154px'],
              },
            }}
          />
        )}
        <VaultIlkDetailsItem
          label={t('manage-vault.dust-limit')}
          value={`$${formatCryptoBalance(debtFloor)}`}
          tooltipContent={t('manage-multiply-vault.tooltip.dust-limit')}
          styles={{
            tooltip: {
              left: ['-80px', 'auto'],
              right: ['auto', '-32px'],
            },
          }}
        />
        {originationFeePercent && (
          <VaultIlkDetailsItem
            label={t('manage-insti-vault.origination-fee')}
            value={`${formatPercent(originationFeePercent.times(100), { precision: 2 })}`}
            tooltipContent={t('manage-insti-vault.tooltip.origination-fee')}
            styles={{
              tooltip: {
                left: ['-80px', 'auto'],
                right: ['auto', '-32px'],
              },
            }}
          />
        )}
      </Box>
    </Grid>
  )
}
