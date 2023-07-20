import {
  calculateAjnaMaxLiquidityWithdraw,
  getPoolLiquidity,
  negativeToZero,
  normalizeValue,
} from '@oasisdex/dma-library'
import { BigNumber } from 'bignumber.js'
import { NEGATIVE_WAD_PRECISION } from 'components/constants'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { AjnaUnifiedHistoryEvent } from 'features/ajna/common/ajnaUnifiedHistoryEvent'
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

// TODO potentially temporary method until we have better handling in subgraph
const calculateTotalEarningsAndPnl = (
  quoteTokenAmount: BigNumber,
  history: AjnaUnifiedHistoryEvent[],
) => {
  const cumulativeFees = history
    .map((event) =>
      event.gasPrice
        .times(event.gasUsed)
        .times(event.ethPrice)
        .shiftedBy(NEGATIVE_WAD_PRECISION)
        .div(event.debtOraclePrice),
    )
    .reduce((acc, curr) => acc.plus(curr), zero)

  const cumulativeDeposit = history
    .map((event) => event.depositAmount)
    .reduce((acc, curr) => acc.plus(curr), zero)

  const cumulativeWithdraw = history
    .map((event) => event.withdrawAmount)
    .reduce((acc, curr) => acc.plus(curr), zero)

  return {
    pnl: cumulativeWithdraw
      .plus(quoteTokenAmount)
      .minus(cumulativeFees)
      .minus(cumulativeDeposit)
      .div(cumulativeDeposit),
    totalEarnings: quoteTokenAmount.minus(
      cumulativeDeposit.minus(cumulativeWithdraw).plus(cumulativeFees),
    ),
  }
}

export function AjnaEarnOverviewManageController() {
  const { t } = useTranslation()
  const {
    environment: { collateralToken, isShort, owner, priceFormat, quoteToken, quotePrice },
  } = useAjnaGeneralContext()
  const {
    position: {
      isSimulationLoading,
      currentPosition: { position, simulation },
      history,
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

  const { totalEarnings, pnl } = calculateTotalEarningsAndPnl(position.quoteTokenAmount, history)

  return (
    <DetailsSection
      title={t('system.overview')}
      notifications={notifications}
      content={
        <DetailsSectionContentCardWrapper>
          <ContentCardTotalEarnings
            quoteToken={quoteToken}
            totalEarnings={totalEarnings}
            netPnL={pnl}
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
