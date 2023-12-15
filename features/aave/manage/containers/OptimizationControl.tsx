import { useActor } from '@xstate/react'
import BigNumber from 'bignumber.js'
import type { AutoBuyDetailsLayoutProps } from 'features/aave/components/AutoBuySection'
import { AutoBuySection } from 'features/aave/components/AutoBuySection'
import { AutoBuyBanner } from 'features/aave/components/banners'
import {
  useManageAaveStateMachineContext,
  useOptimizationAaveStateMachineContext,
} from 'features/aave/manage/contexts'
import { AutoBuySidebarAaveVault } from 'features/aave/manage/sidebars/AutoBuySidebarAaveVault'
import type { AutoBuyTriggerAaveContext } from 'features/aave/manage/state'
import React from 'react'
import { Box, Container, Grid } from 'theme-ui'

function getAutoBuyDetailsLayoutProps(
  context: AutoBuyTriggerAaveContext,
  isEditing: boolean,
): AutoBuyDetailsLayoutProps | undefined {
  if (!context.position) {
    return undefined
  }

  if (context.executionTriggerLTV && context.targetTriggerLTV && isEditing) {
    return {
      position: context.position,
      afterTxTrigger: {
        executionLTV: new BigNumber(context.executionTriggerLTV),
        targetLTV: new BigNumber(context.targetTriggerLTV),
      },
    }
  }

  return {
    position: context.position,
  }
}

export function OptimizationControl() {
  const { stateMachine } = useManageAaveStateMachineContext()
  const [state] = useActor(stateMachine)

  const optimizationStateMachine = useOptimizationAaveStateMachineContext()
  const [optimizationState, sendOptimizationEvent] = useActor(optimizationStateMachine)
  const [autoBuyState, sendAutoBuyEvent] = useActor(optimizationState.context.autoBuyTrigger)

  const autoBuyDetailsLayoutProps = getAutoBuyDetailsLayoutProps(
    autoBuyState.context,
    !autoBuyState.matches('idle'),
  )

  return (
    <Container variant="vaultPageContainer" sx={{ zIndex: 0 }}>
      <Grid variant="vaultContainer">
        <Grid gap={3} mb={[0, 5]}>
          {optimizationState.context.currentView === 'auto-buy' && autoBuyDetailsLayoutProps && (
            <AutoBuySection {...autoBuyDetailsLayoutProps} />
          )}
          {optimizationState.context.showAutoBuyBanner && (
            <AutoBuyBanner buttonClicked={() => sendOptimizationEvent({ type: 'SHOW_AUTO_BUY' })} />
          )}
        </Grid>
        {optimizationState.context.currentView === 'auto-buy' && autoBuyState.context.position && (
          <Box>
            <AutoBuySidebarAaveVault
              strategy={state.context.strategyConfig}
              state={{ ...autoBuyState.context, position: autoBuyState.context.position }}
              updateState={sendAutoBuyEvent}
              isStateMatch={(s) => autoBuyState.matches(s)}
              canTransitWith={(s) => autoBuyState.can(s)}
              isEditing={autoBuyState.value === 'editing'}
            />
          </Box>
        )}
      </Grid>
    </Container>
  )
}
