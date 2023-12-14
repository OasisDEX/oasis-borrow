import type BigNumber from 'bignumber.js'
import { GasEstimation } from 'components/GasEstimation'
import { InfoSection } from 'components/infoSection/InfoSection'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

export interface BuyInfoSectionProps {
  afterBuy: {
    ltv: number
    multiple: number
  }
  targetLtv: number
  targetLtvWithDeviation: [number, number]
  executionLtv: number
  targetMultiple: number
  collateralToBuy: BigNumber
  currentPosition: {
    collateral: {
      amount: BigNumber
      symbol: string
    }
    debt: {
      amount: BigNumber
      symbol: string
    }
  }
  positionAfterBuy: {
    collateral: {
      amount: BigNumber
      symbol: string
    }
    debt: {
      amount: BigNumber
      symbol: string
    }
  }
}

export function AutoBuyInfoSection({
  targetLtv,
  targetMultiple,
  executionLtv,
  targetLtvWithDeviation,
  positionAfterBuy,
  currentPosition,
  collateralToBuy,
}: BuyInfoSectionProps) {
  const { t } = useTranslation()

  const currentCollateral = formatCryptoBalance(currentPosition.collateral.amount)
  const nextCollateral = formatCryptoBalance(positionAfterBuy.collateral.amount)
  const currentDebt = formatCryptoBalance(currentPosition.debt.amount)
  const nextDebt = formatCryptoBalance(positionAfterBuy.debt.amount)

  const collateralToBePurchased = formatCryptoBalance(collateralToBuy)

  return (
    <InfoSection
      title={t('auto-buy.buy-title')}
      items={[
        {
          label: t('auto-buy.target-ltv-each-buy'),
          value: `${targetLtv}%`,
        },
        {
          label: t('auto-buy.target-multiple-each-buy'),
          value: `${targetMultiple}x`,
        },
        {
          label: t('auto-buy.trigger-ltv-to-perform-buy'),
          value: `${executionLtv}%`,
        },
        {
          label: t('auto-buy.target-ltv-with-deviation'),
          value: `${targetLtvWithDeviation[0]}% - ${targetLtvWithDeviation[1]}%`,
        },
        {
          label: t('auto-buy.collateral-after-next-buy'),
          value: currentCollateral,
          change: `${nextCollateral} ${currentPosition.collateral.symbol}`,
        },
        {
          label: t('auto-buy.outstanding-debt-after-next-buy'),
          value: currentDebt,
          change: `${nextDebt} ${currentPosition.debt.symbol}`,
        },
        {
          label: t('auto-buy.col-to-be-purchased', { token: currentPosition.collateral.symbol }),
          value: `${collateralToBePurchased} ${currentPosition.collateral.symbol}`,
        },
        {
          label: t('auto-sell.estimated-transaction-cost'),
          value: <GasEstimation />,
        },
      ]}
    />
  )
}
