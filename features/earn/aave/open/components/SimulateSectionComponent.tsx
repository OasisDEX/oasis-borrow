import { useActor, useSelector } from '@xstate/react'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box } from 'theme-ui'
import { ActorRefFrom } from 'xstate'

import { Banner, bannerGradientPresets } from '../../../../../components/Banner'
import { DetailsSection } from '../../../../../components/DetailsSection'
import { DetailsSectionContentTable } from '../../../../../components/DetailsSectionContentTable'
import { DetailsSectionFooterItemWrapper } from '../../../../../components/DetailsSectionFooterItem'
import { ContentFooterItemsEarnSimulate } from '../../../../../components/vault/detailsSection/ContentFooterItemsEarnSimulate'
import { formatCryptoBalance } from '../../../../../helpers/formatters/format'
import { useHash } from '../../../../../helpers/useHash'
import { zero } from '../../../../../helpers/zero'
import { useOpenAaveStateMachineContext } from '../containers/AaveOpenStateMachineContext'
import { Simulation } from '../services'
import { AaveStEthSimulateStateMachine } from '../state'
import { AaveSimulateTitle } from './AaveSimulateTitle'

function mapSimulation(simulation?: Simulation): string[] {
  if (!simulation) return [formatCryptoBalance(zero), formatCryptoBalance(zero)]
  return [
    `${formatCryptoBalance(simulation.earningAfterFees)} ${simulation.token}`,
    `${formatCryptoBalance(simulation.netValue)} ${simulation.token}`,
  ]
}

function SimulationSection({ actor }: { actor: ActorRefFrom<AaveStEthSimulateStateMachine> }) {
  const [state] = useActor(actor)
  const { t } = useTranslation()
  const [, setHash] = useHash<string>()

  const { simulation, amount, token } = state.context

  return (
    <>
      <DetailsSection
        title={<AaveSimulateTitle token={token} depositAmount={amount} />}
        content={
          <>
            <DetailsSectionContentTable
              headers={[
                t('earn-vault.simulate.header1'),
                t('earn-vault.simulate.header2'),
                t('earn-vault.simulate.header3'),
              ]}
              rows={[
                [t('earn-vault.simulate.rowlabel1'), ...mapSimulation(simulation?.previous30Days)],
                [t('earn-vault.simulate.rowlabel2'), ...mapSimulation(simulation?.previous90Days)],
                [t('earn-vault.simulate.rowlabel3'), ...mapSimulation(simulation?.previous1Year)],
                [t('earn-vault.simulate.rowlabel4'), ...mapSimulation(simulation?.sinceInception)],
              ]}
              footnote={<>{t('earn-vault.simulate.footnote1')}</>}
            />
          </>
        }
        footer={
          <DetailsSectionFooterItemWrapper>
            <ContentFooterItemsEarnSimulate
              token={token || 'ETH'}
              breakeven={simulation?.breakEven || zero}
              entryFees={simulation?.entryFees || zero}
              apy={simulation?.apy || zero}
            />
          </DetailsSectionFooterItemWrapper>
        }
      />
      <Box sx={{ mt: '21px' }} />
      <Banner
        title={t('vault-banners.what-are-the-risks.header')}
        description={t('vault-banners.what-are-the-risks.content')}
        button={{
          text: t('vault-banners.what-are-the-risks.button'),
          action: () => {
            setHash('position-info')
          },
        }}
        image={{
          src: '/static/img/setup-banner/stop-loss.svg',
          backgroundColor: bannerGradientPresets.stopLoss[0],
          backgroundColorEnd: bannerGradientPresets.stopLoss[1],
        }}
      />
    </>
  )
}

export function SimulateSectionComponent() {
  const { stateMachine } = useOpenAaveStateMachineContext()
  const simulationMachine = useSelector(stateMachine, (state) => {
    return state.context.refSimulationMachine
  })

  return simulationMachine ? <SimulationSection actor={simulationMachine} /> : <></>
}
