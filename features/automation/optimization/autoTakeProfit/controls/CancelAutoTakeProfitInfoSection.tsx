import BigNumber from 'bignumber.js'
import { GasEstimation } from 'components/GasEstimation'
import { InfoSection } from 'components/infoSection/InfoSection'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface CancelAutoTakeProfitInfoSectionProps {
  collateralizationRatio: BigNumber
  token: string
  triggerColPrice: BigNumber
  debt: BigNumber
}

export function CancelAutoTakeProfitInfoSection({
  collateralizationRatio,
  token,
  triggerColPrice,
  debt,
}: CancelAutoTakeProfitInfoSectionProps) {
  const { t } = useTranslation()
  const readOnlyAutoTakeProfitEnabled = useFeatureToggle('ReadOnlyAutoTakeProfit')

  const isDebtZero = debt.isZero()

  return (
    <InfoSection
      title={t('constant-multiple.vault-changes.general-summary')}
      items={[
        ...(isDebtZero || readOnlyAutoTakeProfitEnabled
          ? [
              {
                label: t('auto-take-profit.vault-changes.trigger-col-price', { token }),
                value: `$${formatAmount(triggerColPrice, 'USD')}`,
                secondaryValue: 'n/a',
              },
            ]
          : [
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
            ]),
        {
          label: t('auto-sell.estimated-transaction-cost'),
          value: <GasEstimation />,
        },
      ]}
    />
  )
}
