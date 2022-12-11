import BigNumber from 'bignumber.js'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentTable } from 'components/DetailsSectionContentTable'
import {
  DetailsSectionFooterItem,
  DetailsSectionFooterItemWrapper,
} from 'components/DetailsSectionFooterItem'
import { AaveSimulateTitle } from 'features/aave/open/components/AaveSimulateTitle'
import { Simulation } from 'features/aave/open/services'
import { DsrBanner } from 'features/dsr/components/DsrBanner'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { one, zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

function mapSimulation(simulation?: Simulation): string[] {
  if (!simulation) return [formatCryptoBalance(zero), formatCryptoBalance(zero)]
  return [
    `${formatCryptoBalance(simulation.earningAfterFees)} DAI`,
    `${formatCryptoBalance(simulation.netValue)} DAI`,
  ]
}

export function DsrSimulationSection({
  userInputAmount,
  apy,
}: {
  userInputAmount?: BigNumber
  apy: BigNumber
}) {
  const { t } = useTranslation()
  const amount = userInputAmount || new BigNumber(150000)

  const simulation = {
    next30Days: {
      earningAfterFees: amount.times(one.plus(apy.div(100).div(365).times(30))).minus(amount),
      netValue: amount.times(one.plus(apy.div(100).div(365).times(30))),
      token: 'DAI',
    },
    next90Days: {
      earningAfterFees: amount.times(one.plus(apy.div(100).div(365).times(90))).minus(amount),
      netValue: amount.times(one.plus(apy.div(100).div(365).times(90))),
      token: 'DAI',
    },
    next1Year: {
      earningAfterFees: amount.times(one.plus(apy.div(100))).minus(amount),
      netValue: amount.times(one.plus(apy.div(100))),
      token: 'DAI',
    },
  }

  return (
    <>
      <DetailsSection
        title={<AaveSimulateTitle token="DAI" depositAmount={amount} />}
        content={
          <>
            <DetailsSectionContentTable
              headers={[
                t('dsr.simulation.header1'),
                t('dsr.simulation.header2'),
                t('dsr.simulation.header3'),
              ]}
              rows={[
                [t('dsr.simulation.rowlabel1'), ...mapSimulation(simulation?.next30Days)],
                [t('dsr.simulation.rowlabel2'), ...mapSimulation(simulation?.next90Days)],
                [t('dsr.simulation.rowlabel3'), ...mapSimulation(simulation?.next1Year)],
              ]}
            />
          </>
        }
        footer={
          <DetailsSectionFooterItemWrapper>
            <DetailsSectionFooterItem
              title={t('dsr.details.current-dai-savings-rate')}
              value={formatDecimalAsPercent(apy.div(100))}
            />
          </DetailsSectionFooterItemWrapper>
        }
      />
      <DsrBanner />
    </>
  )
}
