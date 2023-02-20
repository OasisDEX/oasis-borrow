import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { ContentCardCollateralLocked } from 'features/ajna/borrow/overview/ContentCardCollateralLocked'
import { ContentCardLiquidationPrice } from 'features/ajna/borrow/overview/ContentCardLiquidationPrice'
import { ContentCardLoanToValue } from 'features/ajna/borrow/overview/ContentCardLoanToValue'
import { ContentCardPositionDebt } from 'features/ajna/borrow/overview/ContentCardPositionDebt'
import { ContentFooterItemsBorrow } from 'features/ajna/borrow/overview/ContentFooterItemsBorrow'
import { useAjnaGeneralContext } from 'features/ajna/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/common/contexts/AjnaProductContext'
import { AjnaTokensBannerController } from 'features/ajna/common/controls/AjnaTokensBannerController'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export function AjnaBorrowOverviewController() {
  const { t } = useTranslation()
  const {
    environment: { collateralPrice, collateralToken, quotePrice, quoteToken },
  } = useAjnaGeneralContext()
  const {
    position: {
      currentPosition: { position, simulation },
    },
  } = useAjnaProductContext('borrow')

  return (
    <Grid gap={2}>
      <DetailsSection
        title={t('system.overview')}
        content={
          <DetailsSectionContentCardWrapper>
            <ContentCardLiquidationPrice
              collateralToken={collateralToken}
              quoteToken={quoteToken}
              liquidationPrice={position.liquidationPrice}
              afterLiquidationPrice={simulation?.liquidationPrice}
              belowCurrentPrice={collateralPrice
                .minus(position.liquidationPrice)
                .dividedBy(collateralPrice)}
            />
            <ContentCardLoanToValue
              loanToValue={position.riskRatio.loanToValue}
              afterLoanToValue={simulation?.riskRatio.loanToValue}
            />
            <ContentCardCollateralLocked
              collateralToken={collateralToken}
              collateralLocked={position.collateralAmount}
              collateralLockedUSD={position.collateralAmount.times(collateralPrice)}
              afterCollateralLocked={simulation?.collateralAmount}
            />
            <ContentCardPositionDebt
              quoteToken={quoteToken}
              positionDebt={position.debtAmount}
              positionDebtUSD={position.debtAmount.times(quotePrice)}
              afterPositionDebt={simulation?.debtAmount}
            />
          </DetailsSectionContentCardWrapper>
        }
        footer={
          <DetailsSectionFooterItemWrapper>
            <ContentFooterItemsBorrow
              collateralToken={collateralToken}
              quoteToken={quoteToken}
              cost={position.pool.rate}
              availableToBorrow={position.debtAvailable}
              afterAvailableToBorrow={simulation?.debtAvailable}
              availableToWithdraw={position.collateralAvailable}
              afterAvailableToWithdraw={simulation?.collateralAvailable}
            />
          </DetailsSectionFooterItemWrapper>
        }
      />
      <AjnaTokensBannerController />
    </Grid>
  )
}
