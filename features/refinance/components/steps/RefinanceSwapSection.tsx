import BigNumber from 'bignumber.js'
import { InfoSection } from 'components/infoSection/InfoSection'
import { ItemValueWithIcon } from 'components/infoSection/ItemValueWithIcon'
import { useRefinanceContext } from 'features/refinance/contexts'
import { formatDecimalAsPercent, formatFiatBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

export const RefinanceSwapSection = () => {
  const { t } = useTranslation()
  const {
    environment: { collateralPrice, debtPrice },
    simulation: { refinanceSimulation },
  } = useRefinanceContext()

  if (!refinanceSimulation) {
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
    const toToken = swap.toTokenAmount.token.symbol

    const priceImpact = new BigNumber(swap.priceImpact.value)
    const slippage = new BigNumber(swap.slippage.value)
    const feePrice = new BigNumber(isCollateral ? collateralPrice : debtPrice)
    const fee = new BigNumber(swap.summerFee.amount).times(feePrice)

    const formatted = {
      fromTokenlAsset: <ItemValueWithIcon tokens={[fromToken]}>{fromToken}</ItemValueWithIcon>,
      toTokenAsset: <ItemValueWithIcon tokens={[toToken]}>{toToken}</ItemValueWithIcon>,
      priceImpact: formatDecimalAsPercent(priceImpact),
      slippage: formatDecimalAsPercent(slippage),
      fee: `$${formatFiatBalance(fee)}`,
    }

    dropdownGroups.push([
      {
        label: isCollateral ? t('system.collateral-asset') : t('system.debt-asset'),
        value: formatted.fromTokenlAsset,
        change: formatted.toTokenAsset,
      },
      {
        label: t('system.price-impact'),
        value: formatted.priceImpact,
        tooltip: t('system.price-impact-tooltip'),
      },
      {
        label: t('system.slippage'),
        value: formatted.slippage,
        tooltip: t('system.slippage-tooltip'),
      },
      {
        label: t('system.fee'),
        value: formatted.fee,
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
