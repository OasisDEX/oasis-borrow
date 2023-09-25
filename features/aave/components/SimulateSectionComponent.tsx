import type { IMultiplyStrategy, IRiskRatio, IStrategy } from '@oasisdex/dma-library'
import { useSelector } from '@xstate/react'
import BigNumber from 'bignumber.js'
import { Banner } from 'components/Banner'
import { bannerGradientPresets } from 'components/Banner.constants'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentTable } from 'components/DetailsSectionContentTable'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { SimulateTitle } from 'components/SimulateTitle'
import { ContentFooterItemsEarnSimulate } from 'components/vault/detailsSection/ContentFooterItemsEarnSimulate'
import { convertDefaultRiskRatioToActualRiskRatio } from 'features/aave'
import { useSimulationYields } from 'features/aave/hooks'
import { useOpenAaveStateMachineContext } from 'features/aave/open/containers/AaveOpenStateMachineContext'
import type { Simulation } from 'features/aave/open/services'
import type { IStrategyConfig } from 'features/aave/types/strategy-config'
import { formatCryptoBalance } from 'helpers/formatters/format'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation.types'
import { useHash } from 'helpers/useHash'
import { zero } from 'helpers/zero'
import type { FilterYieldFieldsType } from 'lendingProtocols/aave-like-common'
import { useTranslation } from 'next-i18next'
import React, { useMemo } from 'react'
import { Box } from 'theme-ui'

function mapSimulation(simulation?: Simulation): string[] {
  if (!simulation) return [formatCryptoBalance(zero), formatCryptoBalance(zero)]
  return [
    `${formatCryptoBalance(simulation.earningAfterFees)} ${simulation.token}`,
    `${formatCryptoBalance(simulation.netValue)} ${simulation.token}`,
  ]
}

const defaultYieldFields: FilterYieldFieldsType[] = ['7Days', '30Days', '90Days', '1Year']

function transitionHasSwap(
  transition?: IMultiplyStrategy | IStrategy,
): transition is IMultiplyStrategy {
  return (
    !!transition && (transition.simulation as IMultiplyStrategy['simulation']).swap !== undefined
  )
}

function SimulationSection({
  strategy,
  transition,
  token,
  userInputAmount,
  gasPrice,
  defaultRiskRatio,
}: {
  strategy: IStrategyConfig
  transition?: IMultiplyStrategy | IStrategy
  token: string
  userInputAmount?: BigNumber
  gasPrice?: HasGasEstimation
  defaultRiskRatio: IRiskRatio
}) {
  const { t } = useTranslation()
  const [, setHash] = useHash<string>()
  const amount = useMemo(() => userInputAmount || new BigNumber(100), [userInputAmount])

  const fees = useMemo(() => {
    const swapFee = (transitionHasSwap(transition) && transition.simulation.swap.tokenFee) || zero
    const gasFee = gasPrice?.gasEstimationEth || zero
    return swapFee.plus(gasFee)
  }, [transition, gasPrice])

  const riskRatio = useMemo(
    () => transition?.simulation.position.riskRatio || defaultRiskRatio,
    [defaultRiskRatio, transition],
  )

  const simulation = useSimulationYields({
    amount,
    riskRatio,
    fields: defaultYieldFields,
    token,
    strategy,
    fees,
  })

  return (
    <>
      <DetailsSection
        title={<SimulateTitle token={token} depositAmount={amount} />}
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
      strategy: state.context.strategyConfig,
      transition: state.context.transition,
      token: state.context.tokens.debt,
      userInputAmount: state.context.userInput.amount,
      gasPrice: state.context.estimatedGasPrice,
      defaultRiskRatio: convertDefaultRiskRatioToActualRiskRatio(
        state.context.strategyConfig.riskRatios.default,
        state.context.reserveConfig?.ltv,
      ),
    }
  })

  return <SimulationSection {...simulationSectionProps} />
}
