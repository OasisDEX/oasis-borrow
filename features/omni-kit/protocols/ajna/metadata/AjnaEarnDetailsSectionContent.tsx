import { type AjnaEarnPosition, normalizeValue } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentTable } from 'components/DetailsSectionContentTable'
import {
  AjnaContentCardEarnNetValue,
  AjnaContentCardMaxLendingLTV,
  AjnaContentCardPositionLendingPrice,
  AjnaContentCardTotalEarnings,
} from 'features/omni-kit/protocols/ajna/components/details-section'
import {
  getAjnaSimulationRows,
  getLendingPriceColor,
} from 'features/omni-kit/protocols/ajna/helpers'
import { one } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { ajnaExtensionTheme } from 'theme'

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
        <DetailsSectionContentCardWrapper>
          <AjnaContentCardTotalEarnings
            quoteToken={quoteToken}
            totalEarnings={position.totalEarnings.withFees}
            totalEarningsWithoutFees={position.totalEarnings.withoutFees}
            netPnL={position.pnl.withoutFees}
            modalTheme={ajnaExtensionTheme}
          />
          <AjnaContentCardEarnNetValue
            isLoading={isSimulationLoading}
            quoteToken={quoteToken}
            netValue={position.quoteTokenAmount}
            netValueUSD={!isOracless ? position.quoteTokenAmount.times(quotePrice) : undefined}
            afterNetValue={simulation?.quoteTokenAmount}
            modalTheme={ajnaExtensionTheme}
          />
          {!isOracless && (
            <AjnaContentCardMaxLendingLTV
              isLoading={isSimulationLoading}
              quoteToken={quoteToken}
              collateralToken={collateralToken}
              maxLendingPercentage={position.maxRiskRatio.loanToValue}
              afterMaxLendingPercentage={simulation?.maxRiskRatio.loanToValue}
              modalTheme={ajnaExtensionTheme}
            />
          )}
          <AjnaContentCardPositionLendingPrice
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
            modalTheme={ajnaExtensionTheme}
          />
        </DetailsSectionContentCardWrapper>
      )}
    </>
  )
}
