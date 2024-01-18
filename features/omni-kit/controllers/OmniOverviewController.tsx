import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { OmniProductType } from 'features/omni-kit/types'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export function OmniOverviewController() {
  const {
    environment: { productType, isOpening },
  } = useOmniGeneralContext()
  const { t } = useTranslation()
  const {
    dynamicMetadata: {
      values: { footerColumns },
      elements: { overviewContent, overviewBanner, overviewFooter, overviewHeader },
      notifications,
    },
  } = useOmniProductContext(productType)

  return (
    <Grid gap={2}>
      <DetailsSection
        title={overviewHeader ?? t('system.overview')}
        notifications={notifications}
        content={
          productType === OmniProductType.Earn && isOpening ? (
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
