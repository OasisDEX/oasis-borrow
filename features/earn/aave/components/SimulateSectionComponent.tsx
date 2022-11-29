import { IPositionTransition, IRiskRatio } from '@oasisdex/oasis-actions'
import { useSelector } from '@xstate/react'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'
import { Box } from 'theme-ui'

import { useAppContext } from '../../../../components/AppContextProvider'
import { Banner, bannerGradientPresets } from '../../../../components/Banner'
import { DetailsSection } from '../../../../components/DetailsSection'
import { DetailsSectionContentTable } from '../../../../components/DetailsSectionContentTable'
import { DetailsSectionFooterItemWrapper } from '../../../../components/DetailsSectionFooterItem'
import { ContentFooterItemsEarnSimulate } from '../../../../components/vault/detailsSection/ContentFooterItemsEarnSimulate'
import { HasGasEstimation } from '../../../../helpers/form'
import { formatCryptoBalance } from '../../../../helpers/formatters/format'
import { useHash } from '../../../../helpers/useHash'
import { zero } from '../../../../helpers/zero'
import { getFee } from '../../../aave/oasisActionsLibWrapper'
import { AaveSimulateTitle } from '../../../aave/open/components/AaveSimulateTitle'
import { useOpenAaveStateMachineContext } from '../../../aave/open/containers/AaveOpenStateMachineContext'
import {
  calculateSimulation,
  CalculateSimulationResult,
  Simulation,
} from '../../../aave/open/services'

function mapSimulation(simulation?: Simulation): string[] {
  if (!simulation) return [formatCryptoBalance(zero), formatCryptoBalance(zero)]
  return [
    `${formatCryptoBalance(simulation.earningAfterFees)} ${simulation.token}`,
    `${formatCryptoBalance(simulation.netValue)} ${simulation.token}`,
  ]
}

function SimulationSection({
  strategy,
  token,
  userInputAmount,
  gasPrice,
  minRiskRatio,
}: {
  strategy?: IPositionTransition
  token: string
  userInputAmount?: BigNumber
  gasPrice?: HasGasEstimation
  minRiskRatio: IRiskRatio
}) {
  const { t } = useTranslation()
  const [, setHash] = useHash<string>()
  const { aaveSthEthYieldsQuery } = useAppContext()
  const [simulation, setSimulation] = useState<CalculateSimulationResult>()
  const amount = userInputAmount || new BigNumber(100)

  const swapFee = (strategy?.simulation.swap && getFee(strategy?.simulation.swap)) || zero
  const gasFee = gasPrice?.gasEstimationEth || zero
  const fees = swapFee.plus(gasFee)
  const riskRatio = strategy?.simulation.position.riskRatio || minRiskRatio

  useEffect(() => {
    aaveSthEthYieldsQuery(riskRatio, ['7Days', '30Days', '90Days', '1Year'])
      .then((yields) => {
        const simulation = calculateSimulation({ amount, yields, token, fees })
        setSimulation(simulation)
      })
      .catch((e) => {
        console.error('unable to get yields', e)
      })
  }, [amount.toString(), fees.toString(), riskRatio.multiple.toString()])

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
              ]}
              footnote={<>{t('earn-vault.simulate.footnote1')}</>}
            />
          </>
        }
        footer={
          <DetailsSectionFooterItemWrapper>
            <ContentFooterItemsEarnSimulate
              token={token}
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
  const simulationSectionProps = useSelector(stateMachine, (state) => {
    return {
      strategy: state.context.strategy,
      token: state.context.tokens.debt,
      userInputAmount: state.context.userInput.amount,
      gasPrice: state.context.estimatedGasPrice,
      minRiskRatio: state.context.strategyConfig.riskRatios.minimum,
    }
  })

  return <SimulationSection {...simulationSectionProps} />
}
