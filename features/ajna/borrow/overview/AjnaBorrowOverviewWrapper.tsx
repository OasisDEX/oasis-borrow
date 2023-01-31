import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { ContentCardLiquidationPrice } from 'features/ajna/borrow/overview/ContentCardLiquidationPrice'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaBorrowOverviewWrapper() {
  const { t } = useTranslation()
  const {
    environment: { collateralToken, quoteToken },
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
        </DetailsSectionContentCardWrapper>
      }
    />
  )
}
