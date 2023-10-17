import { normalizeValue } from '@oasisdex/dma-library'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { ContentFooterItemsBorrow } from 'features/ajna/positions/borrow/components/ContentFooterItemsBorrow'
import { ContentCardCollateralLocked } from 'features/ajna/positions/common/components/contentCards/ContentCardCollateralLocked'
import { ContentCardLiquidationPrice } from 'features/ajna/positions/common/components/contentCards/ContentCardLiquidationPrice'
import { ContentCardPositionDebt } from 'features/ajna/positions/common/components/contentCards/ContentCardPositionDebt'
import { useOmniGeneralContext } from 'features/omni-kit/contexts/OmniGeneralContext'
import { useOmniProductContext } from 'features/omni-kit/contexts/OmniProductContext'
import { one } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export function OmniBorrowOverviewController() {
  const { t } = useTranslation()
  const {
    environment: {
      collateralPrice,
      collateralToken,
      isOracless,
      isShort,
      owner,
      priceFormat,
      quotePrice,
      quoteToken,
    },
  } = useOmniGeneralContext()
  const {
    notifications,
    position: {
      isSimulationLoading,
      currentPosition: { position, simulation },
    },
    dynamicMetadata,
  } = useOmniProductContext('borrow')

  const {
    values: { changeVariant, interestRate, afterPositionDebt, afterAvailableToBorrow },
    elements: { extraOverviewCards, overviewBanner },
  } = dynamicMetadata('borrow')

  const liquidationPrice = isShort
    ? normalizeValue(one.div(position.liquidationPrice))
    : position.liquidationPrice
  const belowCurrentPrice = one.minus(
    isShort
      ? normalizeValue(one.div(position.liquidationToMarketPrice))
      : position.liquidationToMarketPrice,
  )

  const afterLiquidationPrice =
    simulation?.liquidationPrice &&
    (isShort ? normalizeValue(one.div(simulation.liquidationPrice)) : simulation.liquidationPrice)

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
              withTooltips={isOracless}
              changeVariant={changeVariant}
              {...(!isOracless && {
                belowCurrentPrice,
              })}
            />
            {...extraOverviewCards}
            <ContentCardCollateralLocked
              isLoading={isSimulationLoading}
              collateralToken={collateralToken}
              collateralLocked={position.collateralAmount}
              afterCollateralLocked={simulation?.collateralAmount}
              changeVariant={changeVariant}
              {...(!isOracless && {
                collateralLockedUSD: position.collateralAmount.times(collateralPrice),
              })}
            />
            <ContentCardPositionDebt
              isLoading={isSimulationLoading}
              quoteToken={quoteToken}
              positionDebt={position.debtAmount}
              afterPositionDebt={afterPositionDebt}
              changeVariant={changeVariant}
              {...(!isOracless && {
                positionDebtUSD: position.debtAmount.times(quotePrice),
              })}
            />
          </DetailsSectionContentCardWrapper>
        }
        footer={
          <DetailsSectionFooterItemWrapper>
            <ContentFooterItemsBorrow
              isLoading={isSimulationLoading}
              collateralToken={collateralToken}
              quoteToken={quoteToken}
              owner={owner}
              cost={interestRate}
              availableToBorrow={position.debtAvailable()}
              afterAvailableToBorrow={afterAvailableToBorrow}
              availableToWithdraw={position.collateralAvailable}
              afterAvailableToWithdraw={simulation?.collateralAvailable}
              changeVariant={changeVariant}
            />
          </DetailsSectionFooterItemWrapper>
        }
      />
      {overviewBanner}
    </Grid>
  )
}
