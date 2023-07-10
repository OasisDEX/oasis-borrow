import { calculateAjnaMaxLiquidityWithdraw } from '@oasisdex/dma-library'
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
    environment: { collateralToken, quoteToken, quotePrice },
  } = useAjnaGeneralContext()
  const {
    position: {
      isSimulationLoading,
      currentPosition: { position, simulation },
    },
    notifications,
  } = useAjnaProductContext('earn')

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
            collateralToken={collateralToken}
            quoteToken={quoteToken}
            positionLendingPrice={position.price}
            highestThresholdPrice={position.pool.highestThresholdPrice}
            afterPositionLendingPrice={simulation?.price}
            relationToMarketPrice={position.maxRiskRatio.loanToValue.minus(one)}
          />
        </DetailsSectionContentCardWrapper>
      }
      footer={
        <DetailsSectionFooterItemWrapper>
          <ContentFooterItemsEarnManage
            quoteToken={quoteToken}
            availableToWithdraw={calculateAjnaMaxLiquidityWithdraw({
              pool: position.pool,
              position,
              simulation,
            })}
            // TODO adjust once data available in subgraph
            projectedAnnualReward={zero}
            totalAjnaRewards={position.rewards}
            afterAvailableToWithdraw={simulation?.quoteTokenAmount}
          />
        </DetailsSectionFooterItemWrapper>
      }
    />
  )
}
