import BigNumber from 'bignumber.js'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { ContentCardLiquidationPrice } from 'features/ajna/positions/common/components/contentCards/ContentCardLiquidationPrice'
import { ContentCardLoanToValue } from 'features/ajna/positions/common/components/contentCards/ContentCardLoanToValue'
import { ContentCardNetBorrowCost } from 'features/ajna/positions/common/components/contentCards/ContentCardNetBorrowCost'
import { ContentCardNetValue } from 'features/ajna/positions/common/components/contentCards/ContentCardNetValue'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
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

  const changeVariant = 'positive'

  // TODO: replace with data from simulation
  const isSimulationLoading = false
  const liquidationPrice = new BigNumber(0.7201)
  const afterLiquidationPrice = new BigNumber(0.9417)
  const liquidationToMarketPrice = new BigNumber(0.4153)
  const loanToValue = new BigNumber(0.6265)
  const afterLoanToValue = new BigNumber(0.7141)
  const liquidationThreshold = new BigNumber(0.8758)
  const netBorrowCost = new BigNumber(0.0183)
  const afterNetBorrowCost = new BigNumber(0.0271)
  const netValue = new BigNumber(15282.124)
  const afterNetValue = new BigNumber(17204.0356)
  const pnl = new BigNumber(-110.26)
  const totalExposure = new BigNumber(22461.32)
  const afterTotalExposure = new BigNumber(28436.37)
  const positionDebt = new BigNumber(5)
  const afterPositionDebt = new BigNumber(124.13)
  const multiple = new BigNumber(1.5)
  const afterMultiple = new BigNumber(1.67)
  const buyingPower = new BigNumber(1255.12)
  const afterBuyingPower = new BigNumber(1911.37)

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
              liquidationPrice={liquidationPrice}
              afterLiquidationPrice={afterLiquidationPrice}
              belowCurrentPrice={one.minus(liquidationToMarketPrice)}
              changeVariant={changeVariant}
            />
            <ContentCardLoanToValue
              isLoading={isSimulationLoading}
              loanToValue={loanToValue}
              afterLoanToValue={afterLoanToValue}
              liquidationThreshold={liquidationThreshold}
              changeVariant={changeVariant}
            />
            <ContentCardNetBorrowCost
              isLoading={isSimulationLoading}
              netBorrowCost={netBorrowCost}
              afterNetBorrowCost={afterNetBorrowCost}
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
              totalExposure={totalExposure}
              afterTotalExposure={afterTotalExposure}
              positionDebt={positionDebt}
              afterPositionDebt={afterPositionDebt}
              multiple={multiple}
              afterMultiple={afterMultiple}
              buyingPower={buyingPower}
              afterBuyingPower={afterBuyingPower}
              changeVariant={changeVariant}
            />
          </DetailsSectionFooterItemWrapper>
        }
      />
      <AjnaTokensBannerController />
    </Grid>
  )
}
