import { InfoSection } from 'components/infoSection/InfoSection'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaBorrowFormOrder() {
  const { t } = useTranslation()

  return (
    <InfoSection
      title={t('vault-changes.order-information')}
      items={[
        {
          label: 'ETH example',
          value: '0.00 ETH',
          secondaryValue: '10.03 ETH',
        },
        {
          label: 'Dollar example',
          value: '$0.00',
          secondaryValue: '$16,684.22',
        },
        {
          label: 'Percentage example',
          value: '0%',
          secondaryValue: '184.9%',
        },
        {
          label: t('transaction-fee'),
          value: 'n/a',
        },
      ]}
    />
  )
}
