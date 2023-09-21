import type BigNumber from 'bignumber.js'
import { InfoSection } from 'components/infoSection/InfoSection'
import { getEstimatedGasFeeTextOld } from 'components/vault/VaultChangesInformation'
import type { DsrSidebarTabOptions } from 'features/dsr/helpers/dsrDeposit.types'
import { formatCryptoBalance } from 'helpers/formatters/format'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation.types'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface DsrDepositInfoSectionProps {
  daiToDeposit: BigNumber
  activeTab: DsrSidebarTabOptions
  gasData: HasGasEstimation
  token?: string
}

export function DsrDepositInfoSection({
  daiToDeposit,
  activeTab,
  gasData,
  token = 'DAI',
}: DsrDepositInfoSectionProps) {
  const { t } = useTranslation()

  const daiToDepositValue = formatCryptoBalance(daiToDeposit)

  return (
    <InfoSection
      title={t('vault-changes.order-information')}
      items={[
        {
          label: t('dsr.order.total-dai', { action: activeTab, token }),
          value: daiToDepositValue,
        },
        {
          label: t('auto-sell.estimated-transaction-cost'),
          value: getEstimatedGasFeeTextOld(gasData),
        },
      ]}
    />
  )
}
