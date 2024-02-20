import { useActor, useSelector } from '@xstate/react'
import BigNumber from 'bignumber.js'
import { AutoBuyBanner } from 'features/aave/components/banners'
import type { BasicAutomationDetailsViewProps } from 'features/aave/components/BasicAutomationDetailsView'
import { BasicAutomationDetailsView } from 'features/aave/components/BasicAutomationDetailsView'
import { useOptimizationSidebarDropdown } from 'features/aave/hooks'
import { useManageAaveStateMachineContext } from 'features/aave/manage/contexts'
import { getTriggerExecutionPrice } from 'features/aave/manage/services/calculations'
import { AutoBuySidebarAaveVault } from 'features/aave/manage/sidebars/AutoBuySidebarAaveVault'
import type {
  AutoBuyTriggerAaveContext,
  TriggersAaveEvent,
  triggersAaveStateMachine,
} from 'features/aave/manage/state'
import { zero } from 'helpers/zero'
import React, { useEffect } from 'react'
import { Box, Container, Grid } from 'theme-ui'
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
}: {
  triggersState: StateFrom<typeof triggersAaveStateMachine>
  sendTriggerEvent: Sender<TriggersAaveEvent>
}) {
  const { stateMachine } = useManageAaveStateMachineContext()
  const [state] = useActor(stateMachine)

  const [autoBuyState, sendAutoBuyEvent] = useActor(triggersState.context.autoBuyTrigger)
  const shouldLoadTriggers = useSelector(triggersState.context.autoBuyTrigger, (selector) =>
    selector.matches('txDone'),
  )

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
          {triggersState.context.showAutoBuyBanner && (
            <AutoBuyBanner buttonClicked={() => sendTriggerEvent({ type: 'SHOW_AUTO_BUY' })} />
          )}
        </Grid>
        {triggersState.context.optimizationCurrentView === 'auto-buy' &&
          autoBuyState.context.position && (
            <Box>
              <AutoBuySidebarAaveVault
                strategy={state.context.strategyConfig}
                state={{ ...autoBuyState.context, position: autoBuyState.context.position }}
                updateState={sendAutoBuyEvent}
                isStateMatch={(s) => autoBuyState.matches(s)}
                canTransitWith={(s) => autoBuyState.can(s)}
                isEditing={autoBuyState.value === 'editing'}
                dropdown={dropdown}
              />
            </Box>
          )}
      </Grid>
    </Container>
  )
}
