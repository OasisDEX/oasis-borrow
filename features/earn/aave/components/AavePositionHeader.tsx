import { useActor, useSelector } from '@xstate/react'
import BigNumber from 'bignumber.js'
import { getPriceChangeColor } from 'components/vault/VaultDetails'
import { VaultHeadline } from 'components/vault/VaultHeadline'
import { AppSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { formatHugeNumbersToShortHuman, formatPercent } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { ActorRefFrom } from 'xstate'

import { useAaveContext } from '../../../aave/AaveContextProvider'
import { PreparedAaveTotalValueLocked } from '../../../aave/helpers/aavePrepareAaveTotalValueLocked'
import { useOpenAaveStateMachineContext } from '../../../aave/open/containers/AaveOpenStateMachineContext'
import { AaveStEthSimulateStateMachine } from '../../../aave/open/state'

export type AavePositionHeaderPropsBase = {
  simulationActor?: ActorRefFrom<AaveStEthSimulateStateMachine>
  aaveTVL?: PreparedAaveTotalValueLocked
  strategyName: string
  noDetails?: boolean
}

export function AavePositionHeader({
  simulationActor,
  strategyName,
  aaveTVL,
  noDetails = false,
}: AavePositionHeaderPropsBase) {
  const { t } = useTranslation()
  const tokenPairList = {
    stETHeth: {
      name: t('open-earn.aave.product-header.token-pair-list.aave-steth-eth'),
      tokenList: ['AAVE', 'STETH', 'ETH'],
    },
  } as Record<string, { name: string; tokenList: string[] }>

  const tokenData = tokenPairList[strategyName]
  if (noDetails && (!simulationActor || !aaveTVL)) {
    // this should never change during runtime
    return <VaultHeadline header={tokenData.name} token={tokenData.tokenList} details={[]} />
  }

  const [simulationState] = useActor(simulationActor!)
  const { context: simulationContext } = simulationState

  const headlineDetails = []
  if (simulationContext.baseYieldsMin && simulationContext.yieldsMax) {
    const formatYield = (yieldVal: BigNumber) =>
      formatPercent(yieldVal, {
        precision: 2,
      })
    const yield7DaysMin = simulationContext.baseYieldsMin.annualisedYield7days!
    const yield7DaysMax = simulationContext.yieldsMax.annualisedYield7days!

    const yield7DaysDiff = simulationContext.yieldsMax.annualisedYield7days!.minus(
      simulationContext.yieldsMax.annualisedYield7daysOffset!,
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
  if (simulationContext.yieldsMax?.annualisedYield90days) {
    const yield90DaysDiff = simulationContext.yieldsMax.annualisedYield90daysOffset!.minus(
      simulationContext.yieldsMax.annualisedYield90days,
    )
    headlineDetails.push({
      label: t('open-earn.aave.product-header.90-day-avg-yield'),
      value: formatPercent(simulationContext.yieldsMax.annualisedYield90days, {
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
      loading={!aaveTVL?.totalValueLocked}
    />
  )
}

export function AavePositionHeaderWithDetails({ strategyName }: { strategyName: string }) {
  const { stateMachine: openAaveStateMachine } = useOpenAaveStateMachineContext()
  const simulationMachine = useSelector(openAaveStateMachine, (state) => {
    return state.context.refSimulationMachine
  })

  const { aaveTotalValueLocked$ } = useAaveContext()
  const [tvlState, tvlStateError] = useObservable(aaveTotalValueLocked$)

  return (
    <WithErrorHandler error={[tvlStateError]}>
      <WithLoadingIndicator value={[tvlState, simulationMachine]} customLoader={<AppSpinner />}>
        {([_tvlState, _simulationMachine]) => (
          <AavePositionHeader
            strategyName={strategyName}
            simulationActor={_simulationMachine}
            aaveTVL={_tvlState}
          />
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
