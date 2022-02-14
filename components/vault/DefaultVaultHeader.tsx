import BigNumber from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { IlkData } from '../../blockchain/ilks'
import { formatCryptoBalance, formatPercent } from '../../helpers/formatters/format'
import { useFeatureToggle } from '../../helpers/useFeatureToggle'
import { VaultHeader, VaultHeaderAutomation, VaultIlkDetailsItem } from './VaultHeader'

export interface DefaultVaultHeaderProps {
  header: string
  id?: BigNumber
  ilkData: IlkData
}

export function DefaultVaultHeader(props: DefaultVaultHeaderProps) {
  const {
    ilkData: { liquidationRatio, stabilityFee, liquidationPenalty, debtFloor },
    id,
    header,
  } = props
  const { t } = useTranslation()
  const automationEnabled = useFeatureToggle('Automation')

  const content = (
    <>
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
    </>
  )

  return automationEnabled ? (
    <VaultHeaderAutomation id={id}>{content}</VaultHeaderAutomation>
  ) : (
    <VaultHeader id={id} header={header}>
      {content}
    </VaultHeader>
  )
}
