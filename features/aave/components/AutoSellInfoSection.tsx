import type BigNumber from 'bignumber.js'
import { InfoSection } from 'components/infoSection/InfoSection'
import { InfoSectionLoadingState } from 'components/infoSection/Item'
import { getEstimatedGasFeeTextOld } from 'components/vault/VaultChangesInformation'
import { formatCryptoBalance } from 'helpers/formatters/format'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation.types'
import { GasEstimationStatus } from 'helpers/types/HasGasEstimation.types'
import { useTranslation } from 'next-i18next'
import React from 'react'

export interface AutoSellInfoSectionProps {
  isLoading: boolean
  targetLtv: number
  targetLtvWithDeviation: [number, number]
  executionLtv: number
  targetMultiple: number
  collateralToSell: BigNumber
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
  positionAfterSell: {
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

export function AutoSellInfoSection({
  isLoading,
  targetLtv,
  targetMultiple,
  executionLtv,
  targetLtvWithDeviation,
  positionAfterSell,
  currentPosition,
  collateralToSell,
  transactionCost,
}: AutoSellInfoSectionProps) {
  const { t } = useTranslation()

  const currentCollateral = formatCryptoBalance(currentPosition.collateral.amount)
  const nextCollateral = formatCryptoBalance(positionAfterSell.collateral.amount)
  const currentDebt = formatCryptoBalance(currentPosition.debt.amount)
  const nextDebt = formatCryptoBalance(positionAfterSell.debt.amount)

  const formattedCollateralToSell = formatCryptoBalance(collateralToSell)

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
      title={t('auto-sell.sell-title')}
      items={[
        {
          label: t('auto-sell.target-ltv-each-sell'),
          value: valueWithLoader(`${targetLtv}%`),
        },
        {
          label: t('auto-sell.target-multiple-each-sell'),
          value: valueWithLoader(`${targetMultiple}x`),
        },
        {
          label: t('auto-sell.trigger-ltv-to-perform-sell'),
          value: valueWithLoader(`${executionLtv}%`),
        },
        {
          label: t('auto-sell.target-ltv-with-deviation'),
          value: valueWithLoader(`${targetLtvWithDeviation[0]}% - ${targetLtvWithDeviation[1]}%`),
        },
        {
          label: t('auto-sell.collateral-after-next-sell'),
          value: valueWithLoader(currentCollateral),
          change: undefinedWhenLoading(`${nextCollateral} ${currentPosition.collateral.symbol}`),
        },
        {
          label: t('auto-sell.outstanding-debt-after-next-sell'),
          value: valueWithLoader(currentDebt),
          change: undefinedWhenLoading(`${nextDebt} ${currentPosition.debt.symbol}`),
        },
        {
          label: t('auto-sell.col-to-be-sold', { token: currentPosition.collateral.symbol }),
          value: valueWithLoader(
            `${formattedCollateralToSell} ${currentPosition.collateral.symbol}`,
          ),
        },
        {
          label: t('auto-sell.estimated-transaction-cost'),
          value: transactionCostWithLoader,
        },
      ]}
    />
  )
}
