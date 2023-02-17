import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { ContentCardCollateralLocked } from 'features/ajna/borrow/overview/ContentCardCollateralLocked'
import { ContentCardLiquidationPrice } from 'features/ajna/borrow/overview/ContentCardLiquidationPrice'
import { ContentCardLoanToValue } from 'features/ajna/borrow/overview/ContentCardLoanToValue'
import { ContentCardPositionDebt } from 'features/ajna/borrow/overview/ContentCardPositionDebt'
import { ContentFooterItemsBorrow } from 'features/ajna/borrow/overview/ContentFooterItemsBorrow'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import { AjnaTokensBanner } from 'features/ajna/controls/AjnaTokensBanner'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export function AjnaBorrowOverviewWrapper() {
  const { t } = useTranslation()
  const {
    environment: { collateralPrice, collateralToken, quotePrice, quoteToken },
    position: { currentPosition, simulation },
  } = useAjnaBorrowContext()

  return (
    <Grid gap={2}>
      <DetailsSection
        notifications={[
          {
            closable: true,
            icon: 'bell',
            title: 'Warning your position is not earning any yield',
            message: 'Your lending position is below the minimum yield bearing price',
            link: {
              label: 'Adjust lending price',
              // url: '/',
              action: () => alert('asd'),
            },
            type: 'notice',
          },
          {
            closable: true,
            icon: 'bell',
            title: 'Warning your position is not earning any yield',
            message: 'Your lending position is below the minimum yield bearing price',
            link: {
              label: 'Adjust lending price',
              url: '/',
            },
            type: 'error',
          },
        ]}
        title={t('system.overview')}
        content={
          <DetailsSectionContentCardWrapper>
            <ContentCardLiquidationPrice
              collateralToken={collateralToken}
              quoteToken={quoteToken}
              liquidationPrice={currentPosition.liquidationPrice}
              afterLiquidationPrice={simulation?.liquidationPrice}
              belowCurrentPrice={collateralPrice
                .minus(currentPosition.liquidationPrice)
                .dividedBy(collateralPrice)}
            />
            <ContentCardLoanToValue
              loanToValue={currentPosition.riskRatio.loanToValue}
              afterLoanToValue={simulation?.riskRatio.loanToValue}
            />
            <ContentCardCollateralLocked
              collateralToken={collateralToken}
              collateralLocked={currentPosition.collateralAmount}
              collateralLockedUSD={currentPosition.collateralAmount.times(collateralPrice)}
              afterCollateralLocked={simulation?.collateralAmount}
            />
            <ContentCardPositionDebt
              quoteToken={quoteToken}
              positionDebt={currentPosition.debtAmount}
              positionDebtUSD={currentPosition.debtAmount.times(quotePrice)}
              afterPositionDebt={simulation?.debtAmount}
            />
          </DetailsSectionContentCardWrapper>
        }
        footer={
          <DetailsSectionFooterItemWrapper>
            <ContentFooterItemsBorrow
              collateralToken={collateralToken}
              quoteToken={quoteToken}
              cost={currentPosition.pool.rate}
              availableToBorrow={currentPosition.debtAvailable}
              afterAvailableToBorrow={simulation?.debtAvailable}
              availableToWithdraw={currentPosition.collateralAvailable}
              afterAvailableToWithdraw={simulation?.collateralAvailable}
            />
          </DetailsSectionFooterItemWrapper>
        }
      />
      <AjnaTokensBanner />
    </Grid>
  )
}
