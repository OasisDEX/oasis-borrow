import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export function OmniOverviewController() {
  const {
    environment: { product },
  } = useOmniGeneralContext()
  const { t } = useTranslation()
  const { dynamicMetadata } = useOmniProductContext(product)

  const {
    values: { footerColumns },
    elements: { overviewContent, overviewBanner, overviewFooter },
    notifications,
  } = dynamicMetadata(product)

  return (
    <Grid gap={2}>
      <DetailsSection
        title={t('system.overview')}
        notifications={notifications}
        content={
          <DetailsSectionContentCardWrapper>{overviewContent}</DetailsSectionContentCardWrapper>
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
