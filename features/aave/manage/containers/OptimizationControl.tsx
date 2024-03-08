import type { AaveLikeReserveConfigurationData } from '@oasisdex/dma-library'
import { useActor, useSelector } from '@xstate/react'
import BigNumber from 'bignumber.js'
import { AavePartialTakeProfitManageDetails } from 'features/aave/components/AavePartialTakeProfitManageDetails'
import { AutoBuyBanner } from 'features/aave/components/banners'
import { PartialTakeProfitBanner } from 'features/aave/components/banners/partial-take-profit-banner'
import type { BasicAutomationDetailsViewProps } from 'features/aave/components/BasicAutomationDetailsView'
import { BasicAutomationDetailsView } from 'features/aave/components/BasicAutomationDetailsView'
import { useOptimizationSidebarDropdown } from 'features/aave/hooks'
import { useManageAaveStateMachineContext } from 'features/aave/manage/contexts'
import { mapPartialTakeProfitFromLambda } from 'features/aave/manage/helpers/map-partial-take-profit-from-lambda'
import { getTriggerExecutionPrice } from 'features/aave/manage/services/calculations'
import { AaveManagePositionPartialTakeProfitLambdaSidebar } from 'features/aave/manage/sidebars/AaveManagePositionPartialTakeProfitLambdaSidebar'
import { AutoBuySidebarAaveVault } from 'features/aave/manage/sidebars/AutoBuySidebarAaveVault'
import type {
  AutoBuyTriggerAaveContext,
  TriggersAaveEvent,
  triggersAaveStateMachine,
} from 'features/aave/manage/state'
import { getAaveLikePartialTakeProfitParams } from 'features/aave/open/helpers/get-aave-like-partial-take-profit-params'
import type { OmniNetValuePnlDataReturnType } from 'features/omni-kit/helpers'
import { zero } from 'helpers/zero'
import React, { useEffect } from 'react'
import { Container, Grid } from 'theme-ui'
import type { Sender, StateFrom } from 'xstate'

function getAutoBuyDetailsLayoutProps(
  context: AutoBuyTriggerAaveContext,
  isEditing: boolean,
): BasicAutomationDetailsViewProps | undefined {
  if (!context.position) {
    return undefined
  }
  const currentTrigger = context.currentTrigger
    ? {
        executionLTV: new BigNumber(context.currentTrigger.decodedParams.executionLtv).div(100),
        targetLTV: new BigNumber(context.currentTrigger.decodedParams.targetLtv).div(100),
      }
    : undefined

  const nextPrice = getTriggerExecutionPrice({
    position: context.position,
    executionTriggerLTV: currentTrigger?.executionLTV.toNumber(),
  })
  const thresholdPrice = context.usePriceInput
    ? context.usePrice
      ? context.price
      : zero
    : undefined

  if (context.executionTriggerLTV && context.targetTriggerLTV && isEditing) {
    return {
      automationFeature: context.feature,
      position: context.position,
      afterTxTrigger: {
        executionLTV: new BigNumber(context.executionTriggerLTV),
        targetLTV: new BigNumber(context.targetTriggerLTV),
      },
      currentTrigger,
      thresholdPrice,
      nextPrice,
    }
  }

  return {
    automationFeature: context.feature,
    position: context.position,
    currentTrigger,
    thresholdPrice,
    nextPrice,
  }
}

export function OptimizationControl({
  triggersState,
  sendTriggerEvent,
  netValuePnlCollateralData,
  netValuePnlDebtData,
  aaveReserveState,
}: {
  triggersState: StateFrom<typeof triggersAaveStateMachine>
  sendTriggerEvent: Sender<TriggersAaveEvent>
  netValuePnlCollateralData: OmniNetValuePnlDataReturnType
  netValuePnlDebtData: OmniNetValuePnlDataReturnType
  aaveReserveState: AaveLikeReserveConfigurationData
}) {
  const { stateMachine } = useManageAaveStateMachineContext()
  const [state, send] = useActor(stateMachine)

  const [autoBuyState, sendAutoBuyEvent] = useActor(triggersState.context.autoBuyTrigger)
  const shouldLoadTriggers = useSelector(triggersState.context.autoBuyTrigger, (selector) =>
    selector.matches('txDone'),
  )

  // maps the lambda data
  const aaveLikePartialTakeProfitLambdaData = mapPartialTakeProfitFromLambda(
    state.context.strategyConfig,
    triggersState.context.currentTriggers.triggers,
  )
  // calculates the partial take profit params + stores user inputs
  const aaveLikePartialTakeProfitParams = getAaveLikePartialTakeProfitParams.manage({
    state,
    aaveLikePartialTakeProfitLambdaData,
    aaveReserveState,
  })

  const autoBuyDetailsLayoutProps = getAutoBuyDetailsLayoutProps(
    autoBuyState.context,
    !autoBuyState.matches('idle'),
  )

  useEffect(() => {
    if (shouldLoadTriggers) {
      sendTriggerEvent({ type: 'TRANSACTION_DONE' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldLoadTriggers])

  const dropdown = useOptimizationSidebarDropdown(triggersState, sendTriggerEvent)

  return (
    <Container variant="vaultPageContainer" sx={{ zIndex: 0 }}>
      <Grid variant="vaultContainer">
        <Grid gap={3} mb={[0, 5]}>
          {triggersState.context.optimizationCurrentView === 'auto-buy' &&
            autoBuyDetailsLayoutProps && (
              <BasicAutomationDetailsView {...autoBuyDetailsLayoutProps} />
            )}
          {triggersState.context.optimizationCurrentView === 'partial-take-profit' && (
            <AavePartialTakeProfitManageDetails
              aaveLikePartialTakeProfitParams={aaveLikePartialTakeProfitParams}
              aaveLikePartialTakeProfitLambdaData={aaveLikePartialTakeProfitLambdaData}
              netValuePnlCollateralData={netValuePnlCollateralData}
              netValuePnlDebtData={netValuePnlDebtData}
              historyEvents={state.context.historyEvents}
            />
          )}
          {triggersState.context.showAutoBuyBanner && (
            <AutoBuyBanner buttonClicked={() => sendTriggerEvent({ type: 'SHOW_AUTO_BUY' })} />
          )}
          {triggersState.context.showPartialTakeProfitBanner && (
            <PartialTakeProfitBanner
              buttonClicked={() => sendTriggerEvent({ type: 'SHOW_PARTIAL_TAKE_PROFIT' })}
            />
          )}
        </Grid>
        {triggersState.context.optimizationCurrentView === 'auto-buy' &&
          autoBuyState.context.position && (
            <AutoBuySidebarAaveVault
              strategy={state.context.strategyConfig}
              state={{ ...autoBuyState.context, position: autoBuyState.context.position }}
              updateState={sendAutoBuyEvent}
              isStateMatch={(s) => autoBuyState.matches(s)}
              canTransitWith={(s) => autoBuyState.can(s)}
              isEditing={autoBuyState.value === 'editing'}
              dropdown={dropdown}
            />
          )}
        {triggersState.context.optimizationCurrentView === 'partial-take-profit' &&
          state.context.strategyConfig && (
            <AaveManagePositionPartialTakeProfitLambdaSidebar
              state={state}
              send={send}
              dropdown={dropdown}
              aaveLikePartialTakeProfitParams={aaveLikePartialTakeProfitParams}
              aaveLikePartialTakeProfitLambdaData={aaveLikePartialTakeProfitLambdaData}
              onTxFinished={() => sendTriggerEvent({ type: 'TRANSACTION_DONE' })}
            />
          )}
      </Grid>
    </Container>
  )
}
