import { PriceInfo } from 'features/shared/priceInfo'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { getPriceChangeColor } from './VaultDetails'
import { VaultHeadline, VaultHeadlineProps } from './VaultHeadline'

export function DefaultVaultHeadline({
  header,
  token,
  priceInfo,
}: {
  header: VaultHeadlineProps['header']
  token: VaultHeadlineProps['token']
  priceInfo: PriceInfo
}) {
  const { t } = useTranslation()
  const { currentCollateralPrice, nextCollateralPrice, collateralPricePercentageChange } = priceInfo
  const currentPrice = formatAmount(currentCollateralPrice, 'USD')
  const nextPrice = formatAmount(nextCollateralPrice, 'USD')
  const priceChange = formatPercent(collateralPricePercentageChange.times(100), {
    precision: 2,
  })
  const priceChangeColor = getPriceChangeColor({ collateralPricePercentageChange })

  return (
    <VaultHeadline
      header={header}
      token={token}
      details={[
        {
          label: t('manage-vault.current-price', { token }),
          value: `$${currentPrice}`,
        },
        {
          label: t('manage-vault.next-price', { token }),
          value: `$${nextPrice}`,
          sub: priceChange,
          subColor: priceChangeColor,
        },
      ]}
    />
  )
}
