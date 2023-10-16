import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentTable } from 'components/DetailsSectionContentTable'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { SimulateTitle } from 'components/SimulateTitle'
import { useGenericProductContext } from 'features/ajna/positions/common/contexts/GenericProductContext'
import { useProtocolGeneralContext } from 'features/ajna/positions/common/contexts/ProtocolGeneralContext'
import { ContentFooterItemsEarnOpen } from 'features/ajna/positions/earn/components/ContentFooterItemsEarnOpen'
import { getAjnaSimulationRows } from 'features/ajna/positions/earn/helpers/getAjnaSimulationRows'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaEarnOverviewOpenController() {
  const { t } = useTranslation()
  const {
    environment: { quoteToken, quotePrice, isOracless, quoteIcon },
  } = useProtocolGeneralContext()
  const {
    form: {
      state: { depositAmount },
    },
    notifications,
    position: {
      currentPosition: { simulation, position },
    },
  } = useGenericProductContext('earn')

  const rowsInput = [
    {
      apy: simulation?.apy.per1d,
      translation: t('ajna.position-page.earn.open.simulation.earnings-per-day'),
    },
    {
      apy: simulation?.apy.per30d,
      translation: t('ajna.position-page.earn.open.simulation.earnings-per-30d'),
    },
    {
      apy: simulation?.apy.per365d,
      translation: t('ajna.position-page.earn.open.simulation.earnings-per-1y'),
    },
  ]

  return (
    <DetailsSection
      title={
        <SimulateTitle token={quoteIcon} tokenSymbol={quoteToken} depositAmount={depositAmount} />
      }
      notifications={notifications}
      content={
        <>
          <DetailsSectionContentTable
            headers={[
              t('ajna.position-page.earn.open.simulation.duration'),
              t('ajna.position-page.earn.open.simulation.estimated-earnings'),
              t('ajna.position-page.earn.open.simulation.net-value'),
            ]}
            rows={getAjnaSimulationRows({ rowsInput, quoteToken, depositAmount })}
            footnote={<>{t('ajna.position-page.earn.open.simulation.disclaimer')}</>}
          />
        </>
      }
      footer={
        <DetailsSectionFooterItemWrapper>
          <ContentFooterItemsEarnOpen
            days={30}
            quoteToken={quoteToken}
            isOracless={isOracless}
            totalValueLockedUsd={position.pool.depositSize.times(quotePrice)}
            totalValueLocked={position.pool.depositSize}
            apy={position.pool.apr30dAverage}
          />
        </DetailsSectionFooterItemWrapper>
      }
    />
  )
}
