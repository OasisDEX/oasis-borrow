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
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaEarnOverviewManage() {
  const { t } = useTranslation()
  const {
    environment: { collateralToken, quoteToken, quotePrice },
  } = useAjnaGeneralContext()
  const {
    position: { isSimulationLoading },
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
            tokensDeposited={new BigNumber(5250)}
            tokensDepositedUSD={new BigNumber(5250).times(quotePrice)}
          />
          <ContentCardMaxLendingLTV
            isLoading={isSimulationLoading}
            maxLendingPercentage={new BigNumber(65)}
          />
          <ContentPositionLendingPrice
            isLoading={isSimulationLoading}
            collateralToken={collateralToken}
            quoteToken={quoteToken}
            positionLendingPrice={new BigNumber(23506.3)}
            relationToMarketPrice={new BigNumber(-10)}
          />
        </DetailsSectionContentCardWrapper>
      }
      footer={
        <DetailsSectionFooterItemWrapper>
          <ContentFooterItemsEarnManage
            quoteToken={quoteToken}
            availableToWithdraw={new BigNumber(2750)}
            earlyWithdrawalPenalty={new BigNumber(2)}
            earlyWithdrawalPeriod={new Date(new Date().getTime() + 10000000)}
          />
        </DetailsSectionFooterItemWrapper>
      }
    />
  )
}
