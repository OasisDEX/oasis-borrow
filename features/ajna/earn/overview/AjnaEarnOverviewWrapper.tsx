import BigNumber from 'bignumber.js'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentTable } from 'components/DetailsSectionContentTable'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { AaveSimulateTitle } from 'features/aave/open/components/AaveSimulateTitle'
import { useAjnaProductContext } from 'features/ajna/contexts/AjnaProductContext'
import { AjnaTokensBanner } from 'features/ajna/controls/AjnaTokensBanner'
import { useAjnaEarnContext } from 'features/ajna/earn/contexts/AjnaEarnContext'
import { ContentFooterItemsEarn } from 'features/ajna/earn/overview/ContentFooterItemsEarn'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export function AjnaEarnOverviewWrapper() {
  const { t } = useTranslation()
  const {
    environment: { collateralToken },
  } = useAjnaProductContext()
  const {
    form: {
      state: { depositAmount },
    },
  } = useAjnaEarnContext()

  return (
    <Grid gap={2}>
      <DetailsSection
        title={
          // TODO this component is used outside of aave as well, generalize it
          // styles are not inline with figma?
          <AaveSimulateTitle token={collateralToken} depositAmount={depositAmount} />
        }
        content={
          <>
            <DetailsSectionContentTable
              headers={[
                t('ajna.earn.open.simulation.header1'),
                t('ajna.earn.open.simulation.header2'),
                t('ajna.earn.open.simulation.header3'),
              ]}
              rows={[
                [t('ajna.earn.open.simulation.rowlabel1'), '0.25 ETH', '100.25 ETH'],
                [t('ajna.earn.open.simulation.rowlabel2'), '1.52 ETH', '101.52 ETH'],
                [t('ajna.earn.open.simulation.rowlabel3'), '14.94 ETH', '114.94 ETH'],
              ]}
              footnote={<>{t('ajna.earn.open.simulation.footnote1')}</>}
            />
          </>
        }
        footer={
          <DetailsSectionFooterItemWrapper>
            <ContentFooterItemsEarn
              estimatedBreakEven={25}
              totalValueLocked={new BigNumber(12)}
              apy={new BigNumber(13)}
            />
          </DetailsSectionFooterItemWrapper>
        }
      />
      <AjnaTokensBanner />
    </Grid>
  )
}
