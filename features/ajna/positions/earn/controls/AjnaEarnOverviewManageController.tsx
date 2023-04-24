import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { ContentCardCurrentEarnings } from 'features/ajna/positions/common/components/contentCards/ContentCardCurrentEarnings'
import { ContentCardMaxLendingLTV } from 'features/ajna/positions/common/components/contentCards/ContentCardMaxLendingLTV'
import { ContentCardPositionLendingPrice } from 'features/ajna/positions/common/components/contentCards/ContentCardPositionLendingPrice'
import { ContentCardTokensDeposited } from 'features/ajna/positions/common/components/contentCards/ContentCardTokensDeposited'
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
      notifications={notifications}
      title={t('system.overview')}
      content={
        <DetailsSectionContentCardWrapper>
          <ContentCardCurrentEarnings
            isLoading={isSimulationLoading}
            quoteToken={quoteToken}
            // TODO adjust once data available in subgraph
            currentEarnings={zero}
            netPnL={zero}
          />
          <ContentCardTokensDeposited
            isLoading={isSimulationLoading}
            quoteToken={quoteToken}
            tokensDeposited={position.quoteTokenAmount}
            tokensDepositedUSD={position.quoteTokenAmount.times(quotePrice)}
            afterTokensDeposited={simulation?.quoteTokenAmount}
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
            availableToWithdraw={position.quoteTokenAmount}
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
