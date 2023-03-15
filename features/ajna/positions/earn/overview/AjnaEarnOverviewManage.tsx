import BigNumber from 'bignumber.js'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { ContentCardCurrentEarnings } from 'features/ajna/positions/earn/overview/ContentCardCurrentEarnings'
import { ContentCardMaxLendingLTV } from 'features/ajna/positions/earn/overview/ContentCardMaxLendingLTV'
import { ContentCardTokensDeposited } from 'features/ajna/positions/earn/overview/ContentCardTokensDeposited'
import { ContentFooterItemsEarnManage } from 'features/ajna/positions/earn/overview/ContentFooterItemsEarnManage'
import { ContentPositionLendingPrice } from 'features/ajna/positions/earn/overview/ContentPositionLendingPrice'
import { one } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaEarnOverviewManage() {
  const { t } = useTranslation()
  const {
    environment: { collateralToken, quoteToken, quotePrice, collateralPrice },
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
            currentEarnings={new BigNumber(190)}
            netPnL={new BigNumber(12.35)}
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
            maxLendingPercentage={new BigNumber(65)}
          />
          <ContentPositionLendingPrice
            isLoading={isSimulationLoading}
            collateralToken={collateralToken}
            quoteToken={quoteToken}
            positionLendingPrice={position.price}
            afterPositionLendingPrice={simulation?.price}
            relationToMarketPrice={position.price.div(collateralPrice.div(quotePrice)).minus(one)}
          />
        </DetailsSectionContentCardWrapper>
      }
      footer={
        <DetailsSectionFooterItemWrapper>
          <ContentFooterItemsEarnManage
            quoteToken={quoteToken}
            availableToWithdraw={position.quoteTokenAmount}
            afterAvailableToWithdraw={simulation?.quoteTokenAmount}
            earlyWithdrawalPenalty={new BigNumber(2)}
            earlyWithdrawalPeriod={new Date(new Date().getTime() + 10000000)}
          />
        </DetailsSectionFooterItemWrapper>
      }
    />
  )
}
