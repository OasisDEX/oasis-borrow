import BigNumber from 'bignumber.js'
import { InfoSection } from 'components/infoSection/InfoSection'
import { ItemValueWithIcon } from 'components/infoSection/ItemValueWithIcon'
import { useRefinanceContext } from 'features/refinance/contexts'
import { formatDecimalAsPercent, formatFiatBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

type SwapItem = {
  label: string
  dropdownValues: {
    label: string
    value: React.ReactNode
    change?: React.ReactNode
  }[]
}

export const RefinanceSwapSection = () => {
  const { t } = useTranslation()
  const {
    environment: { collateralPrice, debtPrice, ethPrice },
    simulation: { refinanceSimulation },
  } = useRefinanceContext()

  if (!refinanceSimulation) {
    return null
  }

  const { swaps, sourcePosition } = refinanceSimulation

  const parsedSwaps: SwapItem[] = []
  swaps.forEach((swap) => {
    const isCollateral =
      swap.fromTokenAmount.token.symbol === sourcePosition?.collateralAmount.token.symbol

    const fromToken = swap.fromTokenAmount.token.symbol
    const toToken = swap.toTokenAmount.token.symbol

    const priceImpact = new BigNumber(swap.priceImpact.value)
    const slippage = new BigNumber(swap.slippage.value)
    const feePrice = new BigNumber(isCollateral ? collateralPrice : debtPrice)
    const fee = new BigNumber(swap.summerFee.amount).times(feePrice)
    console.log({ swap })

    const formatted = {
      fromTokenlAsset: <ItemValueWithIcon tokens={[fromToken]}>{fromToken}</ItemValueWithIcon>,
      toTokenAsset: <ItemValueWithIcon tokens={[toToken]}>{toToken}</ItemValueWithIcon>,
      priceImpact: formatDecimalAsPercent(priceImpact),
      slippage: formatDecimalAsPercent(slippage),
      fee: `$${formatFiatBalance(fee)}`,
    }

    parsedSwaps.push({
      label: t('system.swap'),
      dropdownValues: [
        {
          label: isCollateral ? t('system.collateral-asset') : t('system.debt-asset'),
          value: formatted.fromTokenlAsset,
          change: formatted.toTokenAsset,
        },
        {
          label: t('system.price-impact'),
          value: formatted.priceImpact,
        },
        {
          label: t('system.slippage'),
          value: formatted.slippage,
        },
        {
          label: t('system.fee'),
          value: formatted.fee,
        },
      ],
    })
  })

  return (
    <InfoSection
      items={parsedSwaps}
      withListPadding={false}
      wrapperSx={{ backgroundColor: 'unset' }}
    />
  )
}
