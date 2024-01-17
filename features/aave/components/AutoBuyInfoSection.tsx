import type BigNumber from 'bignumber.js'
import { InfoSection } from 'components/infoSection/InfoSection'
import { InfoSectionLoadingState } from 'components/infoSection/Item'
import { getEstimatedGasFeeTextOld } from 'components/vault/VaultChangesInformation'
import { formatCryptoBalance } from 'helpers/formatters/format'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation.types'
import { GasEstimationStatus } from 'helpers/types/HasGasEstimation.types'
import { useTranslation } from 'next-i18next'
import React from 'react'

export interface BuyInfoSectionProps {
  isLoading: boolean
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
  transactionCost: HasGasEstimation
}

export function AutoBuyInfoSection({
  isLoading,
  targetLtv,
  targetMultiple,
  executionLtv,
  targetLtvWithDeviation,
  positionAfterBuy,
  currentPosition,
  collateralToBuy,
  transactionCost,
}: BuyInfoSectionProps) {
  const { t } = useTranslation()

  const currentCollateral = formatCryptoBalance(currentPosition.collateral.amount)
  const nextCollateral = formatCryptoBalance(positionAfterBuy.collateral.amount)
  const currentDebt = formatCryptoBalance(currentPosition.debt.amount)
  const nextDebt = formatCryptoBalance(positionAfterBuy.debt.amount)

  const collateralToBePurchased = formatCryptoBalance(collateralToBuy)

  const valueWithLoader = (value: string | BigNumber | React.ReactNode) => {
    return isLoading ? <InfoSectionLoadingState /> : value
  }

  const transactionCostWithLoader =
    isLoading || transactionCost.gasEstimationStatus === GasEstimationStatus.calculating ? (
      <InfoSectionLoadingState />
    ) : (
      getEstimatedGasFeeTextOld(transactionCost, false)
    )

  const undefinedWhenLoading = (value: string) => {
    return isLoading ? undefined : value
  }

  return (
    <InfoSection
      title={t('auto-buy.buy-title')}
      items={[
        {
          label: t('auto-buy.target-ltv-each-buy'),
          value: valueWithLoader(`${targetLtv}%`),
        },
        {
          label: t('auto-buy.target-multiple-each-buy'),
          value: valueWithLoader(`${targetMultiple}x`),
        },
        {
          label: t('auto-buy.trigger-ltv-to-perform-buy'),
          value: valueWithLoader(`${executionLtv}%`),
        },
        {
          label: t('auto-buy.target-ltv-with-deviation'),
          value: valueWithLoader(`${targetLtvWithDeviation[0]}% - ${targetLtvWithDeviation[1]}%`),
        },
        {
          label: t('auto-buy.collateral-after-next-buy'),
          value: valueWithLoader(currentCollateral),
          change: undefinedWhenLoading(`${nextCollateral} ${currentPosition.collateral.symbol}`),
        },
        {
          label: t('auto-buy.outstanding-debt-after-next-buy'),
          value: valueWithLoader(currentDebt),
          change: undefinedWhenLoading(`${nextDebt} ${currentPosition.debt.symbol}`),
        },
        {
          label: t('auto-buy.col-to-be-purchased', { token: currentPosition.collateral.symbol }),
          value: valueWithLoader(`${collateralToBePurchased} ${currentPosition.collateral.symbol}`),
        },
        {
          label: t('auto-sell.estimated-transaction-cost'),
          value: transactionCostWithLoader,
        },
      ]}
    />
  )
}
