import { useActor, useSelector } from '@xstate/react'
import { getPriceChangeColor } from 'components/vault/VaultDetails'
import { VaultHeadline } from 'components/vault/VaultHeadline'
import { formatPercent } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { ActorRefFrom } from 'xstate'

import { useAaveContext } from '../../AaveContextProvider'
import { useOpenAaveStateMachineContext } from '../containers/AaveOpenStateMachineContext'
import { AaveStEthSimulateStateMachine } from '../state'

const tokenPairList = {
  'aave-steth': {
    name: 'AAVE stETH yield multiple',
    tokenList: ['AAVE', 'STETH', 'ETH'],
  },
} as Record<string, { name: string; tokenList: string[] }>

export function AaveOpenHeader({
  actor,
  strategyName,
}: {
  actor: ActorRefFrom<AaveStEthSimulateStateMachine>
  strategyName: string
}) {
  const [state] = useActor(actor)
  const { aaveTotalValueLocked$ } = useAaveContext()
  const [aaveTotalValueLocked] = useObservable(aaveTotalValueLocked$)

  const { context } = state

  const headlineDetails = []
  if (context.yields?.annualisedYield7days) {
    headlineDetails.push({
      label: 'Current yield',
      value: '10.33% - 12.23%',
      sub: formatPercent(context.yields.annualisedYield7days, {
        precision: 2,
        plus: true,
      }),
      subColor: getPriceChangeColor({
        collateralPricePercentageChange: context.yields.annualisedYield7days,
      }),
    })
  }
  if (context.yields?.annualisedYield90days) {
    headlineDetails.push({
      label: '90 Day Avg',
      value: '8.92',
      sub: formatPercent(context.yields.annualisedYield90days, {
        precision: 2,
        plus: true,
      }),
      subColor: getPriceChangeColor({
        collateralPricePercentageChange: context.yields.annualisedYield90days,
      }),
    })
  }
  // console.log('context', context)

  aaveTotalValueLocked?.totalValueLocked &&
    headlineDetails.push({
      label: 'Total value locked',
      value: Intl.NumberFormat('en', { notation: 'compact', minimumFractionDigits: 3 }).format(
        aaveTotalValueLocked.totalValueLocked.toNumber(),
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
  const { stateMachine } = useOpenAaveStateMachineContext()
  const simulationMachine = useSelector(stateMachine, (state) => {
    return state.context.refSimulationMachine
  })

  return simulationMachine ? (
    <AaveOpenHeader actor={simulationMachine} strategyName={strategyName} />
  ) : (
    <></>
  )
}
