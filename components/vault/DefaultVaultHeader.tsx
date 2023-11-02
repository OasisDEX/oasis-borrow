import type BigNumber from 'bignumber.js'
import type { IlkData } from 'blockchain/ilks.types'
import type { PriceInfo } from 'features/shared/priceInfo.types'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import type { PropsWithChildren } from 'react'
import React from 'react'

import { VaultHeader, VaultIlkDetailsItem } from './VaultHeader'

export interface DefaultVaultHeaderProps {
  header: string
  id?: BigNumber
  ilkData: IlkData
  token: string
  priceInfo: PriceInfo
}

export function DefaultVaultHeader(props: PropsWithChildren<DefaultVaultHeaderProps>) {
  const {
    ilkData: { liquidationRatio, stabilityFee, liquidationPenalty, debtFloor },
    id,
    header,
    children,
    token,
    priceInfo,
  } = props
  const { t } = useTranslation()

  return (
    <VaultHeader id={id} header={header} token={token} priceInfo={priceInfo}>
      <VaultIlkDetailsItem
        label={t('manage-vault.stability-fee')}
        value={`${formatPercent(stabilityFee.times(100), { precision: 2 })}`}
        tooltipContent={t('manage-multiply-vault.tooltip.stabilityFee')}
        styles={{
          tooltip: {
            left: ['auto', '-20px'],
            right: ['-0px', 'auto'],
          },
        }}
      />
      <VaultIlkDetailsItem
        label={t('manage-vault.liquidation-fee')}
        value={`${formatPercent(liquidationPenalty.times(100))}`}
        tooltipContent={t('manage-multiply-vault.tooltip.liquidationFee')}
      />
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
      {children}
    </VaultHeader>
  )
}
