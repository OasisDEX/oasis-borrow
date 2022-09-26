import { useActor, useSelector } from '@xstate/react'
import BigNumber from 'bignumber.js'
import { AaveReserveConfigurationData } from 'blockchain/calls/aaveProtocolDataProvider'
import { getPriceChangeColor } from 'components/vault/VaultDetails'
import { VaultHeadline } from 'components/vault/VaultHeadline'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { formatHugeNumbersToShortHuman, formatPercent } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import { ActorRefFrom } from 'xstate'

import { useAaveContext } from '../../AaveContextProvider'
import { PreparedAaveReserveData } from '../../helpers/aavePrepareAaveTotalValueLocked'
import { useOpenAaveStateMachineContext } from '../containers/AaveOpenStateMachineContext'
import { AaveStEthSimulateStateMachine } from '../state'

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
  const { t } = useTranslation()
  const tokenPairList = {
    'aave-steth': {
      name: t('open-earn.aave.product-header.token-pair-list.aave-steth-eth'),
      tokenList: ['AAVE', 'STETH', 'ETH'],
    },
  } as Record<string, { name: string; tokenList: string[] }>

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
      label: t('open-earn.aave.product-header.current-yield'),
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
      label: t('open-earn.aave.product-header.90-day-avg-yield'),
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
      label: t('open-earn.aave.product-header.total-value-locked'),
      value: formatHugeNumbersToShortHuman(aaveTVL.totalValueLocked),
    })

  return (
    <VaultHeadline
      header={tokenPairList[strategyName].name}
      token={tokenPairList[strategyName].tokenList}
      details={headlineDetails}
      loading={!aaveTVL?.totalValueLocked || simulationState.value === 'loading'}
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
      {tvlState && aaveReserveState && simulationMachine && (
        <AaveOpenHeader
          strategyName={strategyName}
          simulationActor={simulationMachine}
          aaveTVL={tvlState}
          aaveReserveState={aaveReserveState}
        />
      )}
    </WithErrorHandler>
  )
}
