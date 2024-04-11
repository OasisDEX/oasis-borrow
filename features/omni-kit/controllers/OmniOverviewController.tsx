import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { SimulateTitle } from 'components/SimulateTitle'
import { OmniDetailSectionErc20Claims } from 'features/omni-kit/components/details-section/OmniDetailSectionErc20Claims'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { useOmniInPositionAmount } from 'features/omni-kit/hooks'
import { OmniProductType } from 'features/omni-kit/types'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export function OmniOverviewController() {
  const { t } = useTranslation()

  const {
    environment: { productType, isOpening, quoteToken },
  } = useOmniGeneralContext()
  const {
    dynamicMetadata: {
      values: { footerColumns },
      elements: { overviewBanner, overviewContent, overviewFooter, overviewWithSimulation },
      notifications,
    },
  } = useOmniProductContext(productType)

  const amountInPosition = useOmniInPositionAmount()

  return (
    <Grid sx={{ rowGap: 3 }}>
      <DetailsSection
        title={
          (overviewWithSimulation && isOpening && (
            <SimulateTitle token={quoteToken} depositAmount={amountInPosition} />
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
      <OmniDetailSectionErc20Claims />
    </Grid>
  )
}
