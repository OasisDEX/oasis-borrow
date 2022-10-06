import BigNumber from 'bignumber.js'
import { GasEstimation } from 'components/GasEstimation'
import { InfoSection } from 'components/infoSection/InfoSection'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

interface AddAutoTakeProfitInfoSectionProps {
  debtRepaid: BigNumber
  estimatedGasFee: BigNumber
  estimatedOasisFee: BigNumber
  ethPrice: BigNumber
  ethPriceImpact: BigNumber
  token: string
  totalTransactionCost: BigNumber
  triggerColPrice: BigNumber
  triggerColRatio: BigNumber
}

export function AddAutoTakeProfitInfoSection({
  debtRepaid,
  estimatedGasFee,
  estimatedOasisFee,
  ethPrice,
  ethPriceImpact,
  token,
  totalTransactionCost,
  triggerColPrice,
  triggerColRatio,
}: AddAutoTakeProfitInfoSectionProps) {
  const { t } = useTranslation()

  return (
    <InfoSection
      title={t('auto-take-profit.vault-changes.general-summary')}
      items={[
        {
          label: t('auto-take-profit.vault-changes.trigger-col-price', { token }),
          value: `$${formatAmount(triggerColPrice, 'USD')}`,
        },
        {
          label: t('auto-take-profit.vault-changes.trigger-collateral-ratio'),
          value: `${formatPercent(triggerColRatio, { precision: 2 })}`,
        },
        {
          label: t('auto-take-profit.vault-changes.debt-repaid'),
          value: `${formatAmount(debtRepaid, 'DAI')} DAI`,
        },
        {
          label: t('auto-take-profit.vault-changes.col-price-impact', { token }),
          value: (
            <>
              ${formatAmount(ethPrice, 'USD')}
              <Text
                as="span"
                sx={{ ml: 1, color: ethPriceImpact.isPositive() ? 'success100' : 'critical100' }}
              >
                ({ethPriceImpact.toFixed(2)}%)
              </Text>
            </>
          ),
        },
        {
          label: t('auto-take-profit.vault-changes.total-transaction-cost'),
          value: `$${formatAmount(totalTransactionCost, 'USD')}`,
          dropdownValues: [
            {
              label: t('auto-take-profit.vault-changes.estimated-oasis-fee'),
              value: `$${formatAmount(estimatedOasisFee, 'USD')}`,
            },
            {
              label: t('auto-take-profit.vault-changes.estimated-gas-fee'),
              value: `$${formatAmount(estimatedGasFee, 'USD')}`,
            },
          ],
        },
        {
          label: t('auto-take-profit.vault-changes.setup-transaction-cost'),
          value: <GasEstimation />,
        },
      ]}
    />
  )
}
