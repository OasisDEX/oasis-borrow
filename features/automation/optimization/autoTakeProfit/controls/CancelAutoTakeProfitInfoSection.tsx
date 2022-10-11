import BigNumber from 'bignumber.js'
import { GasEstimation } from 'components/GasEstimation'
import { InfoSection } from 'components/infoSection/InfoSection'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface CancelAutoTakeProfitInfoSectionProps {
  collateralizationRatio: BigNumber
  token: string
  triggerColPrice: BigNumber
}

export function CancelAutoTakeProfitInfoSection({
  collateralizationRatio,
  token,
  triggerColPrice,
}: CancelAutoTakeProfitInfoSectionProps) {
  const { t } = useTranslation()

  return (
    <InfoSection
      title={t('constant-multiple.vault-changes.general-summary')}
      items={[
        {
          label: t('auto-take-profit.vault-changes.trigger-col-price', { token }),
          value: `$${formatAmount(triggerColPrice, 'USD')}`,
          secondaryValue: 'n/a',
        },
        {
          label: t('system.collateral-ratio'),
          value: formatPercent(collateralizationRatio, {
            precision: 2,
            roundMode: BigNumber.ROUND_DOWN,
          }),
        },
        {
          label: t('auto-sell.estimated-transaction-cost'),
          value: <GasEstimation />,
        },
      ]}
    />
  )
}
