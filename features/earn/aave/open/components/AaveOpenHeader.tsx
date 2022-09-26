import { useActor, useSelector } from '@xstate/react'
import BigNumber from 'bignumber.js'
import { AaveReserveConfigurationData } from 'blockchain/calls/aaveProtocolDataProvider'
import { getPriceChangeColor } from 'components/vault/VaultDetails'
import { VaultHeadline } from 'components/vault/VaultHeadline'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { formatPercent } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { ActorRefFrom } from 'xstate'

import { useAaveContext } from '../../AaveContextProvider'
import { PreparedAaveReserveData } from '../../helpers/aavePrepareAaveTotalValueLocked'
import { useOpenAaveStateMachineContext } from '../containers/AaveOpenStateMachineContext'
import { AaveStEthSimulateStateMachine } from '../state'

const tokenPairList = {
  'aave-steth': {
    name: 'AAVE stETH yield multiple',
    tokenList: ['AAVE', 'STETH', 'ETH'],
  },
} as Record<string, { name: string; tokenList: string[] }>

const minimumMultiple = new BigNumber(1.1)

export function AaveOpenHeader({
  simulationActor,
  strategyName,
  aaveTVL,
  aaveReserveState,
}: {
  simulationActor: ActorRefFrom<AaveStEthSimulateStateMachine>
  aaveTVL: PreparedAaveReserveData
  strategyName: string
  aaveReserveState: AaveReserveConfigurationData
}) {
  const [simulationState] = useActor(simulationActor)

  const { context: simulationContext } = simulationState
  const maximumMultiple = new BigNumber(1).div(aaveReserveState.ltv)

  const headlineDetails = []
  if (simulationContext.yields) {
    const formatYield = (yieldVal: BigNumber) =>
      formatPercent(yieldVal, {
        precision: 2,
      })
    const yield7DaysMin = minimumMultiple.times(simulationContext.yields.annualisedYield7days)
    const yield7DaysMax = maximumMultiple.times(simulationContext.yields.annualisedYield7days)

    const yield7DaysDiff = maximumMultiple.times(
      simulationContext.yields.annualisedYield7days.minus(
        simulationContext.yields.annualisedYield7daysOffset,
      ),
    )

    headlineDetails.push({
      label: 'Current yield',
      value: `${formatYield(yield7DaysMin).toString()} - ${formatYield(yield7DaysMax).toString()}`,
      sub: formatPercent(yield7DaysDiff, {
        precision: 2,
        plus: true,
      }),
      subColor: getPriceChangeColor({
        collateralPricePercentageChange: yield7DaysDiff,
      }),
    })
  }
  if (simulationContext.yields?.annualisedYield90days) {
    const yield90DaysDiff = maximumMultiple.times(
      simulationContext.yields.annualisedYield90daysOffset.minus(
        simulationContext.yields.annualisedYield90days,
      ),
    )
    headlineDetails.push({
      label: '90 Day Avg',
      value: formatPercent(maximumMultiple.times(simulationContext.yields.annualisedYield90days), {
        precision: 2,
      }),
      sub: formatPercent(yield90DaysDiff, {
        precision: 2,
        plus: true,
      }),
      subColor: getPriceChangeColor({
        collateralPricePercentageChange: yield90DaysDiff,
      }),
    })
  }

  aaveTVL?.totalValueLocked &&
    headlineDetails.push({
      label: 'Total value locked',
      value: Intl.NumberFormat('en', { notation: 'compact', minimumFractionDigits: 3 }).format(
        aaveTVL.totalValueLocked.toNumber(),
      ),
    })

  return (
    <VaultHeadline
      header={tokenPairList[strategyName].name}
      token={tokenPairList[strategyName].tokenList}
      details={headlineDetails}
    />
  )
}

export function AaveOpenHeaderComponent({ strategyName }: { strategyName: string }) {
  const { stateMachine: openAaveStateMachine } = useOpenAaveStateMachineContext()
  const simulationMachine = useSelector(openAaveStateMachine, (state) => {
    return state.context.refSimulationMachine
  })

  const { aaveTotalValueLocked$, aaveReserveStEthData$ } = useAaveContext()
  const [tvlState, tvlStateError] = useObservable(aaveTotalValueLocked$)
  const [aaveReserveState, aaveReserveStateError] = useObservable(aaveReserveStEthData$)

  return (
    <WithErrorHandler error={[tvlStateError, aaveReserveStateError]}>
      <WithLoadingIndicator
        value={[tvlState, simulationMachine, aaveReserveState]}
        customLoader={<VaultContainerSpinner />}
      >
        {([_tvlState, _simulationMachine, _aaveReserveState]) => {
          return (
            <AaveOpenHeader
              strategyName={strategyName}
              simulationActor={_simulationMachine}
              aaveTVL={_tvlState}
              aaveReserveState={_aaveReserveState}
            />
          )
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
