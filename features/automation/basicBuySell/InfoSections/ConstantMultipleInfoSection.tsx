import { InfoSection } from 'components/infoSection/InfoSection'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ConstantMultipleProps {}

export function ConstantMultipleInfoSection({}: ConstantMultipleProps) {
  const { t } = useTranslation()

  return (
    <InfoSection
      title={t('constant-multiple.vault-changes.general-summary')}
      items={[
        {
          label: t('constant-multiple.vault-changes.buy-sell-trigger-summary'),
          value: '0',
        },
        {
          label: t('constant-multiple.vault-changes.target-multiple-ratio-after-buy-sell'),
          value: '0',
        },
        {
          label: t('vault-changes.slippage-limit'),
          value: '0',
        },
        {
          label: t('constant-multiple.vault-changes.cost-per-adjustment'),
          value: '0',
        },
        {
          label: t('auto-sell.setup-transaction-cost'),
          value: '0',
        },
        {
          label: t('constant-multiple.vault-changes.buy-sell-trigger-summary'),
          isHeading: true,
          dropdownValues: [
            {
              label: t('auto-buy.trigger-col-ratio-to-perfrom-buy'),
              value: '0',
            },
            {
              label: t('auto-buy.next-buy-prices'),
              value: '0',
            },
            {
              label: t('constant-multiple.vault-changes.eth-at-next-buy'),
              value: '0',
            },
            {
              label: t('constant-multiple.vault-changes.max-price-buy'),
              value: '0',
            },
            {
              label: t('auto-sell.trigger-col-ratio-to-perfrom-sell'),
              value: '0',
            },
            {
              label: t('auto-sell.next-sell-prices'),
              value: '0',
            },
            {
              label: t('constant-multiple.vault-changes.eth-at-next-sell'),
              value: '0',
            },
            {
              label: t('constant-multiple.vault-changes.max-price-sell'),
              value: '0',
            },
          ],
        },
      ]}
    />
  )
}
