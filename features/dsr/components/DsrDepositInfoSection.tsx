import BigNumber from 'bignumber.js'
import { GasEstimation } from 'components/GasEstimation'
import { InfoSection } from 'components/infoSection/InfoSection'
import { formatAmount } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface DsrDepositInfoSectionProps {
  daiToDeposit: BigNumber;
}

export function DsrDepositInfoSection({
  daiToDeposit
}: DsrDepositInfoSectionProps) {
  const { t } = useTranslation()

  const daiToDepositValue = formatAmount(daiToDeposit, 'USD')

  return (
    <InfoSection
      title='Depoist Dai (DSR)'
      items={[
        {
          label: t('Dai Being Deposited'),
          value: daiToDepositValue
        },
        {
          label: 'Current Yield',
          value: '1.00%'
        },
        {
          label: t('auto-sell.estimated-transaction-cost'),
          value: <GasEstimation />,
        },
      ]}
    />
  )
}
