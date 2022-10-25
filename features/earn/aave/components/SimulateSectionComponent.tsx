import { IPosition } from '@oasisdex/oasis-actions'
import {  useSelector } from '@xstate/react'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { formatCryptoBalance } from '../../../../helpers/formatters/format'
import { useHash } from '../../../../helpers/useHash'
import { zero } from '../../../../helpers/zero'
import { useOpenAaveStateMachineContext } from '../../../aave/open/containers/AaveOpenStateMachineContext'
import { Simulation } from '../../../aave/open/services'

function mapSimulation(simulation?: Simulation): string[] {
  if (!simulation) return [formatCryptoBalance(zero), formatCryptoBalance(zero)]
  return [
    `${formatCryptoBalance(simulation.earningAfterFees)} ${simulation.token}`,
    `${formatCryptoBalance(simulation.netValue)} ${simulation.token}`,
  ]
}

function SimulationSection({ position }: { position: IPosition }) {
  const { t } = useTranslation()
  const [, setHash] = useHash<string>()

  return <>iposition: {`position debt: ${position.debt} collateral: ${position.collateral}`}</>

  // sendFeesToSimulationMachine: send(
  //   (_, event): AaveStEthSimulateStateMachineEvents => {
  //     const sourceTokenFee = event.parameters.simulation.swap.sourceTokenFee || zero
  //     const targetTokenFee = event.parameters.simulation.swap.targetTokenFee || zero
  //
  //     const gasFee = event.estimatedGasPrice?.gasEstimationEth || zero
  //
  //     return {
  //       type: 'FEE_CHANGED',
  //       fee: sourceTokenFee.plus(targetTokenFee).plus(gasFee),
  //     }
  //   },
  //   { to: (context) => context.refSimulationMachine! },
  // ),

  // return (
  //   <>
  //     <DetailsSection
  //       title={<AaveSimulateTitle token={token} depositAmount={amount} />}
  //       content={
  //         <>
  //           <DetailsSectionContentTable
  //             headers={[
  //               t('earn-vault.simulate.header1'),
  //               t('earn-vault.simulate.header2'),
  //               t('earn-vault.simulate.header3'),
  //             ]}
  //             rows={[
  //               [t('earn-vault.simulate.rowlabel1'), ...mapSimulation(simulation?.previous30Days)],
  //               [t('earn-vault.simulate.rowlabel2'), ...mapSimulation(simulation?.previous90Days)],
  //               [t('earn-vault.simulate.rowlabel3'), ...mapSimulation(simulation?.previous1Year)],
  //             ]}
  //             footnote={<>{t('earn-vault.simulate.footnote1')}</>}
  //           />
  //         </>
  //       }
  //       footer={
  //         <DetailsSectionFooterItemWrapper>
  //           <ContentFooterItemsEarnSimulate
  //             token={token || 'ETH'}
  //             breakeven={simulation?.breakEven || zero}
  //             entryFees={simulation?.entryFees || zero}
  //             apy={simulation?.apy || zero}
  //           />
  //         </DetailsSectionFooterItemWrapper>
  //       }
  //     />
  //     <Box sx={{ mt: '21px' }} />
  //     <Banner
  //       title={t('vault-banners.what-are-the-risks.header')}
  //       description={t('vault-banners.what-are-the-risks.content')}
  //       button={{
  //         text: t('vault-banners.what-are-the-risks.button'),
  //         action: () => {
  //           setHash('position-info')
  //         },
  //       }}
  //       image={{
  //         src: '/static/img/setup-banner/stop-loss.svg',
  //         backgroundColor: bannerGradientPresets.stopLoss[0],
  //         backgroundColorEnd: bannerGradientPresets.stopLoss[1],
  //       }}
  //     />
  //   </>
  // )
}

export function SimulateSectionComponent() {
  const { stateMachine } = useOpenAaveStateMachineContext()
  const simulation = useSelector(stateMachine, (state) => {
    return state.context.transactionParameters?.simulation
  })

  return simulation ? <SimulationSection position={simulation.position} /> : <>no position</>
}
