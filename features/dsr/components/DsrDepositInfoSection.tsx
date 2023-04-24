import BigNumber from 'bignumber.js'
import { InfoSection } from 'components/infoSection/InfoSection'
import { getEstimatedGasFeeTextOld } from 'components/vault/VaultChangesInformation'
import { DsrSidebarTabOptions } from 'features/dsr/sidebar/DsrSideBar'
import { HasGasEstimation } from 'helpers/form'
import { formatAmount } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface DsrDepositInfoSectionProps {
  daiToDeposit: BigNumber
  activeTab: DsrSidebarTabOptions
  gasData: HasGasEstimation
}

export function DsrDepositInfoSection({
  daiToDeposit,
  activeTab,
  gasData,
}: DsrDepositInfoSectionProps) {
  const { t } = useTranslation()

  const daiToDepositValue = formatAmount(daiToDeposit, 'USD')

  return (
    <InfoSection
      title={t('vault-changes.order-information')}
      items={[
        {
          label: t('dsr.order.total-dai', { action: activeTab }),
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
