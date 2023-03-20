import BigNumber from 'bignumber.js'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentTable } from 'components/DetailsSectionContentTable'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { SimulateTitle } from 'components/SimulateTitle'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { ContentFooterItemsEarnOpen } from 'features/ajna/positions/earn/overview/ContentFooterItemsEarnOpen'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaEarnOverviewOpen() {
  const { t } = useTranslation()
  const {
    environment: { quoteToken },
  } = useAjnaGeneralContext()
  const {
    form: {
      state: { depositAmount },
    },
  } = useAjnaProductContext('earn')

  return (
    <DetailsSection
      title={<SimulateTitle token={quoteToken} depositAmount={depositAmount} />}
      content={
        <>
          {/* TODO: use data from useAjnaEarnContext once available */}
          <DetailsSectionContentTable
            headers={[
              t('ajna.position-page.earn.open.simulation.duration'),
              t('ajna.position-page.earn.open.simulation.earnings-after-fees'),
              t('ajna.position-page.earn.open.simulation.net-value'),
            ]}
            rows={[
              [
                t('ajna.position-page.earn.open.simulation.earnings-per-day'),
                '0.25 ETH',
                '100.25 ETH',
              ],
              [
                t('ajna.position-page.earn.open.simulation.earnings-per-30d'),
                '1.52 ETH',
                '101.52 ETH',
              ],
              [
                t('ajna.position-page.earn.open.simulation.earnings-per-1y'),
                '14.94 ETH',
                '114.94 ETH',
              ],
            ]}
            footnote={<>{t('ajna.position-page.earn.open.simulation.disclaimer')}</>}
          />
        </>
      }
      footer={
        <DetailsSectionFooterItemWrapper>
          <ContentFooterItemsEarnOpen
            estimatedBreakEven={new Date(new Date().getTime() + 1000000000)}
            totalValueLocked={new BigNumber(221421424137)}
            apy={new BigNumber(12)}
          />
        </DetailsSectionFooterItemWrapper>
      }
    />
  )
}
