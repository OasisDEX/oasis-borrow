import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { ContentCardCollateralLocked } from 'features/ajna/borrow/overview/ContentCardCollateralLocked'
import { ContentCardLiquidationPrice } from 'features/ajna/borrow/overview/ContentCardLiquidationPrice'
import { ContentCardLoanToValue } from 'features/ajna/borrow/overview/ContentCardLoanToValue'
import { ContentCardPositionDebt } from 'features/ajna/borrow/overview/ContentCardPositionDebt'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaBorrowOverviewWrapper() {
  const { t } = useTranslation()
  const {
    environment: { collateralPrice, collateralToken, quotePrice, quoteToken },
  } = useAjnaBorrowContext()

  return (
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
          <ContentCardLoanToValue loanToValue={zero} />
          <ContentCardCollateralLocked
            collateralToken={collateralToken}
            collateralLocked={zero}
            collateralLockedUSD={zero.times(collateralPrice)}
          />
          <ContentCardPositionDebt
            quoteToken={quoteToken}
            positionDebt={zero}
            positionDebtUSD={zero.times(quotePrice)}
          />
        </DetailsSectionContentCardWrapper>
      }
    />
  )
}
