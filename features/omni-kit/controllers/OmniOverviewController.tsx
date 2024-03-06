import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { SimulateTitle } from 'components/SimulateTitle'
import { omniYieldLoopDefaultSimulationDeposit } from 'features/omni-kit/constants'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { OmniProductType } from 'features/omni-kit/types'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export function OmniOverviewController() {
  const {
    environment: { productType, isOpening, isYieldLoopWithData, quoteToken },
  } = useOmniGeneralContext()
  const { t } = useTranslation()
  const {
    dynamicMetadata: {
      values: { footerColumns },
      elements: { overviewContent, overviewBanner, overviewFooter },
      notifications,
    },
    form: {
      state: { depositAmount },
    },
  } = useOmniProductContext(productType)

  return (
    <Grid gap={2}>
      <DetailsSection
        title={
          (isYieldLoopWithData && isOpening && (
            <SimulateTitle
              token={quoteToken}
              depositAmount={depositAmount || omniYieldLoopDefaultSimulationDeposit}
            />
          )) ||
          t('system.overview')
        }
        notifications={notifications}
        content={
          (productType === OmniProductType.Earn || isYieldLoopWithData) && isOpening ? (
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
