import {
  calculateAjnaMaxLiquidityWithdraw,
  getPoolLiquidity,
  negativeToZero,
} from '@oasisdex/dma-library'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { ContentCardEarnNetValue } from 'features/ajna/positions/common/components/contentCards/ContentCardEarnNetValue'
import { ContentCardMaxLendingLTV } from 'features/ajna/positions/common/components/contentCards/ContentCardMaxLendingLTV'
import { ContentCardPositionLendingPrice } from 'features/ajna/positions/common/components/contentCards/ContentCardPositionLendingPrice'
import { ContentCardTotalEarnings } from 'features/ajna/positions/common/components/contentCards/ContentCardTotalEarnings'
import { useGenericProductContext } from 'features/ajna/positions/common/contexts/GenericProductContext'
import { useProtocolGeneralContext } from 'features/ajna/positions/common/contexts/ProtocolGeneralContext'
import { ContentFooterItemsEarnManage } from 'features/ajna/positions/earn/components/ContentFooterItemsEarnManage'
import { getLendingPriceColor } from 'features/ajna/positions/earn/helpers/getLendingPriceColor'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaEarnOverviewManageController() {
  const { t } = useTranslation()
  const {
    environment: {
      collateralToken,
      isOracless,
      isShort,
      owner,
      priceFormat,
      quotePrice,
      quoteToken,
    },
  } = useProtocolGeneralContext()
  const {
    form: {
      state: { depositAmount, withdrawAmount },
    },
    position: {
      currentPosition: { position, simulation },
      isSimulationLoading,
    },
    notifications,
  } = useGenericProductContext('earn')

  const { highestThresholdPrice, lowestUtilizedPrice, mostOptimisticMatchingPrice } = position.pool

  const availableToWithdraw = calculateAjnaMaxLiquidityWithdraw({
    pool: position.pool,
    poolCurrentLiquidity: getPoolLiquidity(position.pool),
    position,
    simulation,
  })

  const lendingPriceColor = getLendingPriceColor({
    highestThresholdPrice,
    lowestUtilizedPrice,
    mostOptimisticMatchingPrice,
    price: position.price,
  })

  return (
    <DetailsSection
      title={t('system.overview')}
      notifications={notifications}
      content={
        <DetailsSectionContentCardWrapper>
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
        </DetailsSectionContentCardWrapper>
      }
      footer={
        <DetailsSectionFooterItemWrapper>
          <ContentFooterItemsEarnManage
            isLoading={isSimulationLoading}
            collateralToken={collateralToken}
            quoteToken={quoteToken}
            owner={owner}
            availableToWithdraw={availableToWithdraw}
            // TODO adjust once data available in subgraph
            projectedAnnualReward={zero}
            afterAvailableToWithdraw={
              simulation
                ? negativeToZero(
                    depositAmount
                      ? availableToWithdraw.plus(depositAmount)
                      : withdrawAmount
                      ? availableToWithdraw.minus(withdrawAmount)
                      : zero,
                  )
                : undefined
            }
            isOracless={isOracless}
          />
        </DetailsSectionFooterItemWrapper>
      }
    />
  )
}
