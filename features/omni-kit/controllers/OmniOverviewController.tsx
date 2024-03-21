import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { SimulateTitle } from 'components/SimulateTitle'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { getOmniDepositAmountFromPullToken } from 'features/omni-kit/helpers'
import { OmniProductType } from 'features/omni-kit/types'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export function OmniOverviewController() {
  const {
    environment: { productType, isOpening, quotePrice, quoteToken },
  } = useOmniGeneralContext()
  const { t } = useTranslation()
  const {
    dynamicMetadata: {
      values: { footerColumns },
      elements: { overviewBanner, overviewContent, overviewFooter, overviewWithSimulation },
      notifications,
    },
    form: {
      state: { depositAmount, pullToken },
    },
  } = useOmniProductContext(productType)

  const resolvedDepositAmount = getOmniDepositAmountFromPullToken({
    quotePrice,
    depositAmount,
    pullToken,
  })

  return (
    <Grid sx={{ rowGap: 3 }}>
      <DetailsSection
        title={
          (overviewWithSimulation && isOpening && (
            <SimulateTitle token={quoteToken} depositAmount={resolvedDepositAmount} />
          )) ||
          t('system.overview')
        }
        notifications={notifications}
        content={
          (productType === OmniProductType.Earn || overviewWithSimulation) && isOpening ? (
            overviewContent
          ) : (
            <DetailsSectionContentCardWrapper>{overviewContent}</DetailsSectionContentCardWrapper>
          )
        }
        footer={
          <DetailsSectionFooterItemWrapper columns={footerColumns}>
            {overviewFooter}
          </DetailsSectionFooterItemWrapper>
        }
      />
      {overviewBanner}
    </Grid>
  )
}
