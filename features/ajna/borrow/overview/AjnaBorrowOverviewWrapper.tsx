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
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export function AjnaBorrowOverviewWrapper() {
  const { t } = useTranslation()
  const {
    environment: { collateralPrice, collateralToken, quotePrice, quoteToken },
    position: { currentPosition, simulation },
  } = useAjnaBorrowContext()

  const collateralLocked = currentPosition.collateralAmount
  const debtAmount = currentPosition.debtAmount

  return (
    <Grid gap={2}>
      <DetailsSection
        title={t('system.overview')}
        content={
          <DetailsSectionContentCardWrapper>
            <ContentCardLiquidationPrice
              collateralToken={collateralToken}
              quoteToken={quoteToken}
              liquidationPrice={zero}
              belowCurrentPrice={zero}
            />
            <ContentCardLoanToValue
              loanToValue={currentPosition.riskRatio.loanToValue}
              afterLoanToValue={simulation?.riskRatio.loanToValue}
            />
            <ContentCardCollateralLocked
              collateralToken={collateralToken}
              collateralLocked={collateralLocked}
              collateralLockedUSD={collateralLocked.times(collateralPrice)}
              afterCollateralLocked={simulation?.collateralAmount}
            />
            <ContentCardPositionDebt
              quoteToken={quoteToken}
              positionDebt={debtAmount}
              positionDebtUSD={debtAmount.times(quotePrice)}
              afterPositionDebt={simulation?.debtAmount}
            />
          </DetailsSectionContentCardWrapper>
        }
        footer={
          <DetailsSectionFooterItemWrapper>
            <ContentFooterItemsBorrow
              collateralToken={collateralToken}
              quoteToken={quoteToken}
              cost={zero}
              availableToBorrow={zero}
              availableToWithdraw={zero}
            />
          </DetailsSectionFooterItemWrapper>
        }
      />
      <AjnaTokensBanner />
    </Grid>
  )
}
