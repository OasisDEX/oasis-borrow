import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentTable } from 'components/DetailsSectionContentTable'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { SimulateTitle } from 'components/SimulateTitle'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { ContentFooterItemsEarnOpen } from 'features/ajna/positions/earn/components/ContentFooterItemsEarnOpen'
import { averageGasWhenOpeningAjnaEarnPosition } from 'features/ajna/positions/earn/consts'
import { getAjnaSimulationRows } from 'features/ajna/positions/earn/helpers/getAjnaSimulationRows'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaEarnOverviewOpenController() {
  const { t } = useTranslation()
  const {
    environment: { quoteToken, quotePrice, gasPrice, ethPrice },
  } = useAjnaGeneralContext()
  const {
    form: {
      state: { depositAmount },
    },
    position: {
      currentPosition: { simulation, position },
    },
  } = useAjnaProductContext('earn')

  // TODO currently its based on open nft in future we may need
  // different value when position is being opened without nft
  const openPositionGasFee = averageGasWhenOpeningAjnaEarnPosition
    .times(gasPrice.maxFeePerGas.plus(gasPrice.maxPriorityFeePerGas).shiftedBy(-9))
    .times(ethPrice)
    .shiftedBy(-9)

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

  const breakEvenInDays = simulation?.getBreakEven(openPositionGasFee)

  return (
    <DetailsSection
      title={<SimulateTitle token={quoteToken} depositAmount={depositAmount} />}
      content={
        <>
          <DetailsSectionContentTable
            headers={[
              t('ajna.position-page.earn.open.simulation.duration'),
              t('ajna.position-page.earn.open.simulation.earnings-after-fees'),
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
            estimatedBreakEven={
              breakEvenInDays
                ? new Date(new Date().getTime() + breakEvenInDays * 24 * 60 * 60 * 1000)
                : undefined
            }
            totalValueLocked={position.pool.depositSize.times(quotePrice)}
            apy={simulation?.apy.per30d}
            days={30}
          />
        </DetailsSectionFooterItemWrapper>
      }
    />
  )
}
