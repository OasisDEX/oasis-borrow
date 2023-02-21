import BigNumber from 'bignumber.js'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentTable } from 'components/DetailsSectionContentTable'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { SimulateTitle } from 'components/SimulateTitle'
import { AjnaTokensBanner } from 'features/ajna/controls/AjnaTokensBanner'
import { ContentFooterItemsEarn } from 'features/ajna/earn/overview/ContentFooterItemsEarn'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export function AjnaEarnOverviewWrapper() {
  const { t } = useTranslation()
  // TODO use useAjnaEarnContext once available
  // const {
  //   environment: { collateralPrice, collateralToken },
  //   position: { currentPosition, simulation },
  // } = useAjnaEarnContext()
  const { environment, simulation, form } = {
    form: {
      state: {
        depositAmount: new BigNumber(50),
      },
    },
    environment: { collateralPrice: new BigNumber(200), collateralToken: 'ETH' },
    simulation: {
      position: {
        collateralAmount: new BigNumber(13),
        apy: new BigNumber(12),
        estimatedBreakEven: 25,
      },
    },
  }

  return (
    <Grid gap={2}>
      <DetailsSection
        title={
          <SimulateTitle
            token={environment.collateralToken}
            depositAmount={form.state.depositAmount}
          />
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
              estimatedBreakEven={simulation?.position.estimatedBreakEven}
              totalValueLocked={simulation?.position.collateralAmount.times(
                environment.collateralPrice,
              )}
              apy={simulation?.position.apy}
            />
          </DetailsSectionFooterItemWrapper>
        }
      />
      <AjnaTokensBanner />
    </Grid>
  )
}
