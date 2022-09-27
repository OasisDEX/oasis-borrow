import BigNumber from 'bignumber.js'
import { InfoSection } from 'components/infoSection/InfoSection'
import { formatAmount } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

interface AddAutoTakeProfitInfoSectionProps {
  debtRepaid: BigNumber
  estimatedMaxGasFee: BigNumber
  estimatedOasisFee: BigNumber
  ethPrice: BigNumber
  ethPriceImpact: BigNumber
  setupTransactionCost: BigNumber
  totalTransactionCost: BigNumber
  triggerColPrice: BigNumber
  triggerColRatio: BigNumber
}

export function AddAutoTakeProfitInfoSection({
  debtRepaid,
  estimatedMaxGasFee,
  estimatedOasisFee,
  ethPrice,
  ethPriceImpact,
  setupTransactionCost,
  totalTransactionCost,
  triggerColPrice,
  triggerColRatio,
}: AddAutoTakeProfitInfoSectionProps) {
  const { t } = useTranslation()

  return (
    <InfoSection
      title={t('General summary')}
      items={[
        {
          label: t('Trigger ETH Price'),
          value: `$${formatAmount(triggerColPrice, 'USD')}`,
        },
        {
          label: t('Trigger Collateral Ratio'),
          value: `${triggerColRatio}%`,
        },
        {
          label: t('Debt Repaid'),
          value: `$${formatAmount(debtRepaid, 'USD')}`,
        },
        {
          label: t('ETH Price (impact)'),
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
          label: t('Total transaction cost on trigger'),
          value: `$${formatAmount(totalTransactionCost, 'USD')}`,
          dropdownValues: [
            {
              label: t('Estimated Oasis fee'),
              value: `$${formatAmount(estimatedOasisFee, 'USD')}`,
            },
            {
              label: t('Estimated max gas fee'),
              value: `$${formatAmount(estimatedMaxGasFee, 'USD')}`,
            },
          ],
        },
        {
          label: t('Setup transaction cost'),
          value: `$${formatAmount(setupTransactionCost, 'USD')}`,
        },
      ]}
    />
  )
}
