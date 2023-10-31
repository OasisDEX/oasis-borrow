import BigNumber from 'bignumber.js'
import { DAY_BI } from 'components/constants'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentTable } from 'components/DetailsSectionContentTable'
import {
  DetailsSectionFooterItem,
  DetailsSectionFooterItemWrapper,
} from 'components/DetailsSectionFooterItem'
import { SimulateTitle } from 'components/SimulateTitle'
import type { Simulation } from 'features/aave/open/services'
import { DsrBanner } from 'features/dsr/components/DsrBanner'
import { getRate } from 'features/dsr/helpers/dsrPot'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { one, zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex } from 'theme-ui'

function mapSimulation(simulation?: Simulation): string[] {
  if (!simulation) return [formatCryptoBalance(zero), formatCryptoBalance(zero)]
  return [
    `${formatCryptoBalance(simulation.earningAfterFees)} DAI`,
    `${formatCryptoBalance(simulation.netValue)} DAI`,
  ]
}

export function DsrSimulationSection({
  userInputAmount,
  dsr,
  sDaiNetValue,
}: {
  userInputAmount?: BigNumber
  dsr: BigNumber
  sDaiNetValue: BigNumber
}) {
  const { t } = useTranslation()
  const amount = userInputAmount || new BigNumber(150000)
  const next30dayRate = getRate(dsr, DAY_BI.times(30)).decimalPlaces(5, BigNumber.ROUND_UP).minus(1)
  const next90dayRate = getRate(dsr, DAY_BI.times(90)).decimalPlaces(5, BigNumber.ROUND_UP).minus(1)
  const next1yearRate = getRate(dsr, DAY_BI.times(365))
    .decimalPlaces(5, BigNumber.ROUND_UP)
    .minus(1)

  const simulation = {
    next30Days: {
      earningAfterFees: amount.times(one.plus(next30dayRate)).minus(amount),
      netValue: amount.times(one.plus(next30dayRate)),
      token: 'DAI',
    },
    next90Days: {
      earningAfterFees: amount.times(one.plus(next90dayRate)).minus(amount),
      netValue: amount.times(one.plus(next90dayRate)),
      token: 'DAI',
    },
    next1Year: {
      earningAfterFees: amount.times(one.plus(next1yearRate)).minus(amount),
      netValue: amount.times(one.plus(next1yearRate)),
      token: 'DAI',
    },
  }

  return (
    <>
      <DetailsSection
        title={
          <Flex
            sx={{
              justifyContent: ['center', sDaiNetValue.gt(zero) ? 'space-between' : 'flex-start'],
              flexWrap: 'wrap',
            }}
          >
            <SimulateTitle token="DAI" depositAmount={amount} />
            {sDaiNetValue.gt(zero) && (
              <SimulateTitle
                token="SDAI"
                depositAmount={sDaiNetValue}
                description={t('in-your-wallet')}
              />
            )}
          </Flex>
        }
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
              value={formatDecimalAsPercent(next1yearRate)}
            />
          </DetailsSectionFooterItemWrapper>
        }
      />
      <DsrBanner />
    </>
  )
}
