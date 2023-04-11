import BigNumber from 'bignumber.js'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { AjnaTokensBannerController } from 'features/ajna/positions/common/controls/AjnaTokensBannerController'
import { ContentFooterItemsMultiply } from 'features/ajna/positions/multiply/overview/ContentFooterItemsMultiply'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export function AjnaMultiplyOverviewController() {
  const { t } = useTranslation()
  const {
    environment: { collateralToken, quoteToken },
  } = useAjnaGeneralContext()

  const changeVariant = 'positive'

  // TODO: replace with data from simulation
  const isLoading = false
  const totalExposure = new BigNumber(22461.32)
  const afterTotalExposure = new BigNumber(28436.37)
  const positionDebt = new BigNumber(5)
  const afterPositionDebt = new BigNumber(6.13)
  const multiple = new BigNumber(1.5)
  const afterMultiple = new BigNumber(1.67)
  const buyingPower = new BigNumber(1255.12)
  const afterBuyingPower = new BigNumber(1911.37)

  return (
    <Grid gap={2}>
      <DetailsSection
        title={t('system.overview')}
        content={<DetailsSectionContentCardWrapper>Test</DetailsSectionContentCardWrapper>}
        footer={
          <DetailsSectionFooterItemWrapper columns={2}>
            <ContentFooterItemsMultiply
              isLoading={isLoading}
              collateralToken={collateralToken}
              quoteToken={quoteToken}
              totalExposure={totalExposure}
              afterTotalExposure={afterTotalExposure}
              positionDebt={positionDebt}
              afterPositionDebt={afterPositionDebt}
              multiple={multiple}
              afterMultiple={afterMultiple}
              buyingPower={buyingPower}
              afterBuyingPower={afterBuyingPower}
              changeVariant={changeVariant}
            />
          </DetailsSectionFooterItemWrapper>
        }
      />
      <AjnaTokensBannerController />
    </Grid>
  )
}
