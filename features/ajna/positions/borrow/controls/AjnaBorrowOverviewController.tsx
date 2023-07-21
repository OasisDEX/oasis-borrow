import { negativeToZero, normalizeValue } from '@oasisdex/dma-library'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { ContentFooterItemsBorrow } from 'features/ajna/positions/borrow/components/ContentFooterItemsBorrow'
import { ContentCardCollateralLocked } from 'features/ajna/positions/common/components/contentCards/ContentCardCollateralLocked'
import { ContentCardLiquidationPrice } from 'features/ajna/positions/common/components/contentCards/ContentCardLiquidationPrice'
import { ContentCardLoanToValue } from 'features/ajna/positions/common/components/contentCards/ContentCardLoanToValue'
import { ContentCardPositionDebt } from 'features/ajna/positions/common/components/contentCards/ContentCardPositionDebt'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { AjnaTokensBannerController } from 'features/ajna/positions/common/controls/AjnaTokensBannerController'
import { getBorrowishChangeVariant } from 'features/ajna/positions/common/helpers/getBorrowishChangeVariant'
import { getOriginationFee } from 'features/ajna/positions/common/helpers/getOriginationFee'
import { isPoolWithRewards } from 'features/ajna/positions/common/helpers/isPoolWithRewards'
import { one, zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export function AjnaBorrowOverviewController() {
  const { t } = useTranslation()
  const {
    environment: {
      collateralPrice,
      collateralToken,
      flow,
      isShort,
      owner,
      priceFormat,
      quotePrice,
      quoteToken,
    },
  } = useAjnaGeneralContext()
  const {
    notifications,
    position: {
      isSimulationLoading,
      currentPosition: { position, simulation },
    },
  } = useAjnaProductContext('borrow')

  const liquidationPrice = isShort
    ? normalizeValue(one.div(position.liquidationPriceT0Np))
    : position.liquidationPriceT0Np
  const belowCurrentPrice = one.minus(
    isShort
      ? normalizeValue(one.div(position.liquidationToMarketPrice))
      : position.liquidationToMarketPrice,
  )

  const afterLiquidationPrice =
    simulation?.liquidationPrice &&
    (isShort ? normalizeValue(one.div(simulation.liquidationPrice)) : simulation.liquidationPrice)
  const changeVariant = getBorrowishChangeVariant(simulation)

  const originationFee = getOriginationFee(position, simulation)

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
              {...(position.pool.lowestUtilizedPriceIndex.gt(zero) && {
                dynamicMaxLtv: position.maxRiskRatio.loanToValue,
              })}
              changeVariant={changeVariant}
            />
            <ContentCardCollateralLocked
              isLoading={isSimulationLoading}
              collateralToken={collateralToken}
              collateralLocked={position.collateralAmount}
              collateralLockedUSD={position.collateralAmount.times(collateralPrice)}
              afterCollateralLocked={simulation?.collateralAmount}
              changeVariant={changeVariant}
            />
            <ContentCardPositionDebt
              isLoading={isSimulationLoading}
              quoteToken={quoteToken}
              positionDebt={position.debtAmount}
              positionDebtUSD={position.debtAmount.times(quotePrice)}
              afterPositionDebt={simulation?.debtAmount.plus(originationFee)}
              changeVariant={changeVariant}
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
              cost={position.pool.interestRate}
              availableToBorrow={position.debtAvailable()}
              afterAvailableToBorrow={
                simulation && negativeToZero(simulation.debtAvailable().minus(originationFee))
              }
              availableToWithdraw={position.collateralAvailable}
              afterAvailableToWithdraw={simulation?.collateralAvailable}
              changeVariant={changeVariant}
            />
          </DetailsSectionFooterItemWrapper>
        }
      />
      {isPoolWithRewards({ collateralToken, quoteToken }) && (
        <AjnaTokensBannerController flow={flow} />
      )}
    </Grid>
  )
}
