import {
  calculateAjnaMaxLiquidityWithdraw,
  getPoolLiquidity,
  negativeToZero,
  normalizeValue,
} from '@oasisdex/dma-library'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { ContentCardEarnNetValue } from 'features/ajna/positions/common/components/contentCards/ContentCardEarnNetValue'
import { ContentCardMaxLendingLTV } from 'features/ajna/positions/common/components/contentCards/ContentCardMaxLendingLTV'
import { ContentCardPositionLendingPrice } from 'features/ajna/positions/common/components/contentCards/ContentCardPositionLendingPrice'
import { ContentCardTotalEarnings } from 'features/ajna/positions/common/components/contentCards/ContentCardTotalEarnings'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { ContentFooterItemsEarnManage } from 'features/ajna/positions/earn/components/ContentFooterItemsEarnManage'
import { one, zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaEarnOverviewManageController() {
  const { t } = useTranslation()
  const {
    environment: { collateralToken, isShort, owner, priceFormat, quoteToken, quotePrice },
  } = useAjnaGeneralContext()
  const {
    position: {
      isSimulationLoading,
      currentPosition: { position, simulation },
    },
    form: {
      state: { withdrawAmount },
    },
    notifications,
  } = useAjnaProductContext('earn')

  const liquidationToMarketPrice = position.price.div(position.marketPrice)
  const relationToMarketPrice = one.minus(
    isShort ? normalizeValue(one.div(liquidationToMarketPrice)) : liquidationToMarketPrice,
  )

  const availableToWithdraw = calculateAjnaMaxLiquidityWithdraw({
    pool: position.pool,
    poolCurrentLiquidity: getPoolLiquidity(position.pool),
    position,
    simulation,
  })

  return (
    <DetailsSection
      title={t('system.overview')}
      notifications={notifications}
      content={
        <DetailsSectionContentCardWrapper>
          <ContentCardTotalEarnings
            quoteToken={quoteToken}
            totalEarnings={position.totalEarnings}
            netPnL={position.pnl}
          />
          <ContentCardEarnNetValue
            isLoading={isSimulationLoading}
            quoteToken={quoteToken}
            netValue={position.quoteTokenAmount}
            netValueUSD={position.quoteTokenAmount.times(quotePrice)}
            afterNetValue={simulation?.quoteTokenAmount}
          />
          <ContentCardMaxLendingLTV
            isLoading={isSimulationLoading}
            price={position.price}
            quoteToken={quoteToken}
            collateralToken={collateralToken}
            maxLendingPercentage={position.maxRiskRatio.loanToValue}
            afterMaxLendingPercentage={simulation?.maxRiskRatio.loanToValue}
          />
          <ContentCardPositionLendingPrice
            isLoading={isSimulationLoading}
            quoteToken={quoteToken}
            priceFormat={priceFormat}
            isShort={isShort}
            positionLendingPrice={position.price}
            highestThresholdPrice={position.pool.highestThresholdPrice}
            afterPositionLendingPrice={simulation?.price}
            relationToMarketPrice={relationToMarketPrice}
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
              simulation ? negativeToZero(availableToWithdraw.minus(withdrawAmount)) : undefined
            }
          />
        </DetailsSectionFooterItemWrapper>
      }
    />
  )
}
