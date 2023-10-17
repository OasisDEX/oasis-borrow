import { normalizeValue } from '@oasisdex/dma-library'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { ContentCardLiquidationPrice } from 'features/ajna/positions/common/components/contentCards/ContentCardLiquidationPrice'
import { ContentCardLoanToValue } from 'features/ajna/positions/common/components/contentCards/ContentCardLoanToValue'
import { ContentCardNetBorrowCost } from 'features/ajna/positions/common/components/contentCards/ContentCardNetBorrowCost'
import { ContentCardNetValue } from 'features/ajna/positions/common/components/contentCards/ContentCardNetValue'
import { ContentFooterItemsMultiply } from 'features/ajna/positions/multiply/components/ContentFooterItemsMultiply'
import { useOmniGeneralContext } from 'features/omni-kit/contexts/OmniGeneralContext'
import { useOmniProductContext } from 'features/omni-kit/contexts/OmniProductContext'
import { one } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export function OmniMultiplyOverviewController() {
  const { t } = useTranslation()
  const {
    environment: {
      collateralToken,
      quoteToken,
      flow,
      owner,
      collateralPrice,
      priceFormat,
      quotePrice,
      isShort,
      isProxyWithManyPositions,
    },
  } = useOmniGeneralContext()

  const {
    position: {
      isSimulationLoading,
      currentPosition: { position, simulation },
    },
    dynamicMetadata,
  } = useOmniProductContext('multiply')

  const {
    values: { afterBuyingPower, shouldShowDynamicLtv, interestRate },
    elements: { overviewBanner },
    notifications,
  } = dynamicMetadata('multiply')

  const changeVariant = 'positive'

  const liquidationPrice = isShort
    ? normalizeValue(one.div(position.liquidationPrice))
    : position.liquidationPrice
  const afterLiquidationPrice =
    simulation?.liquidationPrice &&
    (isShort ? normalizeValue(one.div(simulation.liquidationPrice)) : simulation.liquidationPrice)

  const belowCurrentPrice = one.minus(
    isShort
      ? normalizeValue(one.div(position.liquidationToMarketPrice))
      : position.liquidationToMarketPrice,
  )

  return (
    <Grid gap={2}>
      <DetailsSection
        title={t('system.overview')}
        notifications={notifications}
        content={
          <DetailsSectionContentCardWrapper>
            <ContentCardLiquidationPrice
              isLoading={isSimulationLoading}
              priceFormat={priceFormat}
              liquidationPrice={liquidationPrice}
              afterLiquidationPrice={afterLiquidationPrice}
              belowCurrentPrice={belowCurrentPrice}
              changeVariant={changeVariant}
            />
            <ContentCardLoanToValue
              isLoading={isSimulationLoading}
              loanToValue={position.riskRatio.loanToValue}
              afterLoanToValue={simulation?.riskRatio.loanToValue}
              {...(shouldShowDynamicLtv && {
                dynamicMaxLtv: position.maxRiskRatio.loanToValue,
              })}
              changeVariant={changeVariant}
            />
            <ContentCardNetBorrowCost
              collateralToken={collateralToken}
              quoteToken={quoteToken}
              owner={owner}
              netBorrowCost={interestRate}
              changeVariant={changeVariant}
            />
            <ContentCardNetValue
              isLoading={isSimulationLoading}
              netValue={position.collateralAmount
                .times(collateralPrice)
                .minus(position.debtAmount.times(quotePrice))}
              afterNetValue={simulation?.collateralAmount
                .times(collateralPrice)
                .minus(simulation?.debtAmount.times(quotePrice))}
              pnl={position.pnl.withoutFees}
              // For now we need to hide P&L for proxies with many positions
              // because subgraph doesn't support it yet
              pnlNotAvailable={isProxyWithManyPositions}
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
              afterBuyingPower={afterBuyingPower}
              changeVariant={changeVariant}
            />
          </DetailsSectionFooterItemWrapper>
        }
      />
      {overviewBanner}
    </Grid>
  )
}
