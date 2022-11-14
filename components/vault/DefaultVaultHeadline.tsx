import { PriceInfo } from 'features/shared/priceInfo'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { moreMinutes } from 'helpers/time'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { timeAgo } from 'utils'

import { getPriceChangeColor } from './VaultDetails'
import { VaultHeadline, VaultHeadlineProps } from './VaultHeadline'

export function DefaultVaultHeadline({
  header,
  token,
  priceInfo,
  colRatio,
}: {
  header: VaultHeadlineProps['header']
  token: VaultHeadlineProps['token']
  priceInfo: PriceInfo
  colRatio: string
}) {
  const { t } = useTranslation()
  const {
    currentCollateralPrice,
    nextCollateralPrice,
    collateralPricePercentageChange,
    dateNextCollateralPrice,
  } = priceInfo
  const currentPrice = formatAmount(currentCollateralPrice, 'USD')
  const nextPrice = formatAmount(nextCollateralPrice, 'USD')
  const priceChange = `(${formatPercent(collateralPricePercentageChange.times(100), {
    precision: 2,
  })})`
  const priceChangeColor = getPriceChangeColor({ collateralPricePercentageChange })
  const nextCollateralPriceTimeInMinutes = dateNextCollateralPrice
    ? timeAgo({ from: new Date(), to: dateNextCollateralPrice, style: 'short' })
    : ''
  const isNextPriceLessThanTwoMinutes = dateNextCollateralPrice
    ? dateNextCollateralPrice < moreMinutes(3)
    : false

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
          sub: [
            isNextPriceLessThanTwoMinutes
              ? t('manage-vault.next-price-any-time')
              : nextCollateralPriceTimeInMinutes,
            priceChange,
          ],
          subColor: ['neutral80', priceChangeColor],
        },
        {
          label: t('system.collateral-ratio'),
          value: `${colRatio}%`,
        },
      ]}
    />
  )
}
