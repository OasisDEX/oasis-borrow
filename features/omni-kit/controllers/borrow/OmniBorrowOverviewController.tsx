import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { useOmniProductContext } from 'features/omni-kit/contexts/OmniProductContext'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

// TODO Omni Borrow and Multiply controller seems to be very similar, extract common things it
export function OmniBorrowOverviewController() {
  const { t } = useTranslation()
  const { dynamicMetadata } = useOmniProductContext('borrow')

  const {
    values: { footerColumns },
    elements: { overviewContent, overviewBanner, overviewFooter },
    notifications,
  } = dynamicMetadata('borrow')

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
