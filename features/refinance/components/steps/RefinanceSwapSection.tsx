import BigNumber from 'bignumber.js'
import { InfoSection } from 'components/infoSection/InfoSection'
import { ItemValueWithIcon } from 'components/infoSection/ItemValueWithIcon'
import { useRefinanceContext } from 'features/refinance/contexts'
import {
  formatCryptoBalance,
  formatDecimalAsPercent,
  formatFiatBalance,
} from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

export const RefinanceSwapSection = () => {
  const { t } = useTranslation()
  const {
    simulation: { refinanceSimulation, debtPrice, collateralPrice },
  } = useRefinanceContext()

  if (!refinanceSimulation || !collateralPrice || !debtPrice) {
    return null
  }

  const { swaps, sourcePosition } = refinanceSimulation

  const dropdownGroups: {
    label: string
    value: React.ReactNode
    change?: React.ReactNode
    tooltip?: string
  }[][] = []

  swaps.forEach((swap) => {
    const isCollateral =
      swap.fromTokenAmount.token.symbol === sourcePosition?.collateralAmount.token.symbol

    const fromToken = swap.fromTokenAmount.token.symbol
    const fromTokenAmount = new BigNumber(swap.fromTokenAmount.amount)
    const toToken = swap.toTokenAmount.token.symbol
    const toTokenAmount = new BigNumber(swap.toTokenAmount.amount)

    const priceImpact = new BigNumber(swap.priceImpact.value)
    const slippage = new BigNumber(swap.slippage.value)
    const feePrice = new BigNumber(isCollateral ? collateralPrice : debtPrice)
    const fee = new BigNumber(swap.summerFee.amount).times(feePrice)
    const rawPrice = new BigNumber(1).div(swap.offerPrice.value)

    const formatted = {
      fromTokenlAsset: (
        <ItemValueWithIcon tokens={[fromToken]}>
          {formatCryptoBalance(fromTokenAmount)}
        </ItemValueWithIcon>
      ),
      toTokenAsset: (
        <ItemValueWithIcon tokens={[toToken]}>
          {formatCryptoBalance(toTokenAmount)}
        </ItemValueWithIcon>
      ),
      priceImpact: `${formatCryptoBalance(rawPrice)} (${formatDecimalAsPercent(priceImpact)})`,

      slippage: formatDecimalAsPercent(slippage),
      fee: `$${formatFiatBalance(fee)}`,
    }

    dropdownGroups.push([
      {
        label: isCollateral ? t('system.collateral-asset') : t('system.debt-asset'),
        value: formatted.fromTokenlAsset,
        change: formatted.toTokenAsset,
        tooltip: isCollateral
          ? t('refinance.sidebar.whats-changing.tooltips.collateral-asset')
          : t('refinance.sidebar.whats-changing.tooltips.debt-asset'),
      },
      {
        label: t('refinance.sidebar.whats-changing.price-impact'),
        value: formatted.priceImpact,
        tooltip: t('refinance.sidebar.whats-changing.tooltips.price-impact'),
      },
      {
        label: t('system.slippage'),
        value: formatted.slippage,
        tooltip: t('refinance.sidebar.whats-changing.tooltips.slippage'),
      },
      {
        label: t('refinance.sidebar.whats-changing.summerfi-fee'),
        value: formatted.fee,
        tooltip: t('refinance.sidebar.whats-changing.tooltips.summerfi-fee'),
      },
    ])
  })

  if (dropdownGroups.length === 0) {
    return null
  }

  const parsedSwaps = [
    {
      label: t('system.swap'),
      dropdownGroups,
    },
  ]

  return (
    <InfoSection
      items={parsedSwaps}
      withListPadding={false}
      wrapperSx={{ backgroundColor: 'unset' }}
    />
  )
}
