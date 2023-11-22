import type { AjnaEarnPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { DetailsSectionContentTable } from 'components/DetailsSectionContentTable'
import { ContentCardEarnNetValue } from 'features/ajna/positions/common/components/contentCards/ContentCardEarnNetValue'
import { ContentCardMaxLendingLTV } from 'features/ajna/positions/common/components/contentCards/ContentCardMaxLendingLTV'
import { ContentCardPositionLendingPrice } from 'features/ajna/positions/common/components/contentCards/ContentCardPositionLendingPrice'
import { ContentCardTotalEarnings } from 'features/ajna/positions/common/components/contentCards/ContentCardTotalEarnings'
import {
  getAjnaSimulationRows,
  getLendingPriceColor,
} from 'features/omni-kit/protocols/ajna/helpers'
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
          <ContentCardTotalEarnings
            quoteToken={quoteToken}
            totalEarnings={position.totalEarnings.withFees}
            totalEarningsWithoutFees={position.totalEarnings.withoutFees}
            netPnL={position.pnl.withoutFees}
          />
          <ContentCardEarnNetValue
            isLoading={isSimulationLoading}
            quoteToken={quoteToken}
            netValue={position.quoteTokenAmount}
            netValueUSD={!isOracless ? position.quoteTokenAmount.times(quotePrice) : undefined}
            afterNetValue={simulation?.quoteTokenAmount}
          />
          {!isOracless && (
            <ContentCardMaxLendingLTV
              isLoading={isSimulationLoading}
              quoteToken={quoteToken}
              collateralToken={collateralToken}
              maxLendingPercentage={position.maxRiskRatio.loanToValue}
              afterMaxLendingPercentage={simulation?.maxRiskRatio.loanToValue}
            />
          )}
          <ContentCardPositionLendingPrice
            isLoading={isSimulationLoading}
            quoteToken={quoteToken}
            priceFormat={priceFormat}
            isShort={isShort}
            positionLendingPrice={position.price}
            highestThresholdPrice={position.pool.highestThresholdPrice}
            afterPositionLendingPrice={simulation?.price}
            priceColor={lendingPriceColor.color}
            priceColorIndex={lendingPriceColor.index}
            withTooltips={isOracless}
          />
        </>
      )}
    </>
  )
}
