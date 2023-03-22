import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentTable } from 'components/DetailsSectionContentTable'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { SimulateTitle } from 'components/SimulateTitle'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { averageGasWhenOpeningAjnaEarnPosition } from 'features/ajna/positions/earn/consts'
import { getAjnaSimulationRows } from 'features/ajna/positions/earn/helpers/overview'
import { ContentFooterItemsEarnOpen } from 'features/ajna/positions/earn/overview/ContentFooterItemsEarnOpen'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaEarnOverviewOpen() {
  const { t } = useTranslation()
  const {
    environment: { quoteToken, quotePrice, gasPrice, ethPrice },
  } = useAjnaGeneralContext()
  const {
    form: {
      state: { depositAmount },
    },
    position: {
      currentPosition: { simulation },
    },
  } = useAjnaProductContext('earn')

  const openPositionGasFee = averageGasWhenOpeningAjnaEarnPosition
    .times(gasPrice.maxFeePerGas.plus(gasPrice.maxPriorityFeePerGas).shiftedBy(-9))
    .times(ethPrice)
    .shiftedBy(-9)

  const apy365Days = simulation?.getApyPerDays({
    amount: depositAmount,
    days: 365,
  })

  const apy1Day = simulation?.getApyPerDays({
    amount: depositAmount,
    days: 1,
  })

  const apy30Days = simulation?.getApyPerDays({
    amount: depositAmount,
    days: 30,
  })

  const rowsInput = [
    {
      apy: apy1Day,
      translation: t('ajna.position-page.earn.open.simulation.earnings-per-day'),
    },
    {
      apy: apy30Days,
      translation: t('ajna.position-page.earn.open.simulation.earnings-per-30d'),
    },
    {
      apy: apy365Days,
      translation: t('ajna.position-page.earn.open.simulation.earnings-per-1y'),
    },
  ]

  const breakEvenInDays = simulation?.getBreakEven({
    depositAmount,
    quotePrice,
    openPositionGasFee,
  })

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
            totalValueLocked={simulation?.pool.depositSize.times(quotePrice)}
            apy={apy30Days}
            days={30}
          />
        </DetailsSectionFooterItemWrapper>
      }
    />
  )
}
