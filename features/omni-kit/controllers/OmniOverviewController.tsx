import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { SimulateTitle } from 'components/SimulateTitle'
import { LazySummerBigBannerBestRates } from 'features/lazy-summer/components/LazySummerBigBanner'
import { OmniDetailSectionRewardsClaims } from 'features/omni-kit/components/details-section/OmniDetailSectionRewardsClaims'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { useOmniInPositionAmount } from 'features/omni-kit/hooks'
import { OmniProductType } from 'features/omni-kit/types'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export function OmniOverviewController() {
  const { t } = useTranslation()

  const {
    environment: { productType, isOpening, quoteToken, entryToken },
  } = useOmniGeneralContext()
  const {
    dynamicMetadata: {
      values: { footerColumns },
      elements: {
        overviewBanner,
        overviewContent,
        overviewFooter,
        overviewWithSimulation,
        renderOverviewBanner,
      },
      notifications,
    },
  } = useOmniProductContext(productType)

  const amountInPosition = useOmniInPositionAmount()

  // const raysPerYearElement = getOmniDetailsSectionRaysTitle({
  //   position,
  //   positionRaysMultipliersData,
  // })

  return (
    <Grid sx={{ rowGap: 3 }}>
      <DetailsSection
        title={
          (overviewWithSimulation && isOpening && (
            <SimulateTitle
              token={entryToken.symbol || quoteToken}
              depositAmount={amountInPosition}
            />
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
      <LazySummerBigBannerBestRates />
      {overviewBanner}
      {renderOverviewBanner?.()}
      <OmniDetailSectionRewardsClaims />
    </Grid>
  )
}
