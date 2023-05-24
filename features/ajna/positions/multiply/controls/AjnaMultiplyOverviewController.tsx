import BigNumber from 'bignumber.js'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { ContentCardLiquidationPrice } from 'features/ajna/positions/common/components/contentCards/ContentCardLiquidationPrice'
import { ContentCardLoanToValue } from 'features/ajna/positions/common/components/contentCards/ContentCardLoanToValue'
import { ContentCardNetBorrowCost } from 'features/ajna/positions/common/components/contentCards/ContentCardNetBorrowCost'
import { ContentCardNetValue } from 'features/ajna/positions/common/components/contentCards/ContentCardNetValue'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { AjnaTokensBannerController } from 'features/ajna/positions/common/controls/AjnaTokensBannerController'
import { ContentFooterItemsMultiply } from 'features/ajna/positions/multiply/components/ContentFooterItemsMultiply'
import { one } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export function AjnaMultiplyOverviewController() {
  const { t } = useTranslation()
  const {
    environment: { collateralToken, quoteToken, flow },
  } = useAjnaGeneralContext()

  const {
    position: {
      isSimulationLoading,
      currentPosition: { position, simulation },
    },
  } = useAjnaProductContext('multiply')

  const changeVariant = 'positive'

  // TODO: replace with data from simulation
  const netValue = new BigNumber(15282.124)
  const afterNetValue = new BigNumber(17204.0356)
  const pnl = new BigNumber(-110.26)

  return (
    <Grid gap={2}>
      <DetailsSection
        title={t('system.overview')}
        content={
          <DetailsSectionContentCardWrapper>
            <ContentCardLiquidationPrice
              isLoading={isSimulationLoading}
              collateralToken={collateralToken}
              quoteToken={quoteToken}
              liquidationPrice={position.liquidationPrice}
              afterLiquidationPrice={simulation?.liquidationPrice}
              belowCurrentPrice={one.minus(position.liquidationToMarketPrice)}
              changeVariant={changeVariant}
            />
            <ContentCardLoanToValue
              isLoading={isSimulationLoading}
              loanToValue={position.riskRatio.loanToValue}
              afterLoanToValue={simulation?.riskRatio.loanToValue}
              liquidationThreshold={position.maxRiskRatio.loanToValue}
              changeVariant={changeVariant}
            />
            <ContentCardNetBorrowCost
              netBorrowCost={position.pool.interestRate}
              changeVariant={changeVariant}
            />
            <ContentCardNetValue
              isLoading={isSimulationLoading}
              collateralToken={collateralToken}
              netValue={netValue}
              afterNetValue={afterNetValue}
              pnl={pnl}
              showPnl={flow === 'manage'}
              changeVariant={changeVariant}
            />
          </DetailsSectionContentCardWrapper>
        }
        footer={
          <DetailsSectionFooterItemWrapper columns={2}>
            <ContentFooterItemsMultiply
              isLoading={isSimulationLoading}
              collateralToken={collateralToken}
              quoteToken={quoteToken}
              totalExposure={position.collateralAmount}
              afterTotalExposure={simulation?.collateralAmount}
              positionDebt={position.debtAmount}
              afterPositionDebt={simulation?.debtAmount}
              multiple={position.riskRatio.multiple}
              afterMultiple={simulation?.riskRatio.multiple}
              buyingPower={position.buyingPower}
              afterBuyingPower={simulation && simulation.buyingPower}
              changeVariant={changeVariant}
            />
          </DetailsSectionFooterItemWrapper>
        }
      />
      <AjnaTokensBannerController flow={flow} />
    </Grid>
  )
}
