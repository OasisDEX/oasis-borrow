import { type AjnaEarnPosition, normalizeValue } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { DetailsSectionContentTable } from 'components/DetailsSectionContentTable'
import {
  OmniContentCardEarnNetValue,
  OmniContentCardMaxLendingLTV,
  OmniContentCardTotalEarnings,
} from 'features/omni-kit/components/details-section'
import { OmniContentCardPositionLendingPrice } from 'features/omni-kit/components/details-section/ContentCardPositionLendingPrice'
import {
  getAjnaSimulationRows,
  getLendingPriceColor,
} from 'features/omni-kit/protocols/ajna/helpers'
import { one } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'

interface AjnaEarnDetailsSectionContentProps {
  collateralToken: string
  depositAmount?: BigNumber
  isOpening: boolean
  isOracless: boolean
  isShort: boolean
  isSimulationLoading?: boolean
  position: AjnaEarnPosition
  priceFormat: string
  quotePrice: BigNumber
  quoteToken: string
  simulation?: AjnaEarnPosition
}

export const AjnaEarnDetailsSectionContent: FC<AjnaEarnDetailsSectionContentProps> = ({
  collateralToken,
  depositAmount,
  isOpening,
  isOracless,
  isShort,
  isSimulationLoading,
  position,
  priceFormat,
  quotePrice,
  quoteToken,
  simulation,
}) => {
  const { t } = useTranslation()

  const rowsInput = [
    {
      apy: simulation?.apy.per1d,
      translation: t('ajna.position-page.earn.open.simulation.earnings-per-day'),
    },
    {
      apy: simulation?.apy.per30d,
      translation: t('ajna.position-page.earn.open.simulation.earnings-per-30d'),
    },
    {
      apy: simulation?.apy.per365d,
      translation: t('ajna.position-page.earn.open.simulation.earnings-per-1y'),
    },
  ]

  const { highestThresholdPrice, lowestUtilizedPrice } = position.pool

  const lendingPriceColor = getLendingPriceColor({
    highestThresholdPrice,
    lowestUtilizedPrice,
    price: position.price,
  })

  return (
    <>
      {isOpening && (
        <DetailsSectionContentTable
          headers={[
            t('ajna.position-page.earn.open.simulation.duration'),
            t('ajna.position-page.earn.open.simulation.estimated-earnings'),
            t('ajna.position-page.earn.open.simulation.net-value'),
          ]}
          rows={getAjnaSimulationRows({ rowsInput, quoteToken, depositAmount })}
          footnote={<>{t('ajna.position-page.earn.open.simulation.disclaimer')}</>}
        />
      )}
      {!isOpening && (
        <>
          <OmniContentCardTotalEarnings
            quoteToken={quoteToken}
            totalEarnings={position.totalEarnings.withFees}
            totalEarningsWithoutFees={position.totalEarnings.withoutFees}
            netPnL={position.pnl.withoutFees}
          />
          <OmniContentCardEarnNetValue
            isLoading={isSimulationLoading}
            quoteToken={quoteToken}
            netValue={position.quoteTokenAmount}
            netValueUSD={!isOracless ? position.quoteTokenAmount.times(quotePrice) : undefined}
            afterNetValue={simulation?.quoteTokenAmount}
          />
          {!isOracless && (
            <OmniContentCardMaxLendingLTV
              isLoading={isSimulationLoading}
              quoteToken={quoteToken}
              collateralToken={collateralToken}
              maxLendingPercentage={position.maxRiskRatio.loanToValue}
              afterMaxLendingPercentage={simulation?.maxRiskRatio.loanToValue}
            />
          )}
          <OmniContentCardPositionLendingPrice
            isLoading={isSimulationLoading}
            quoteToken={quoteToken}
            priceFormat={priceFormat}
            positionLendingPrice={
              isShort ? normalizeValue(one.div(position.price)) : position.price
            }
            highestThresholdPrice={
              isShort
                ? one.div(position.pool.highestThresholdPrice)
                : position.pool.highestThresholdPrice
            }
            afterPositionLendingPrice={
              simulation
                ? isShort
                  ? normalizeValue(one.div(simulation.price))
                  : simulation?.price
                : undefined
            }
            isShort={isShort}
            priceColor={lendingPriceColor.color}
            priceColorIndex={lendingPriceColor.index}
            steps={3}
            withTooltips={isOracless}
          />
        </>
      )}
    </>
  )
}
