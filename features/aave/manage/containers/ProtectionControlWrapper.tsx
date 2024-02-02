import { useActor, useSelector } from '@xstate/react'
import BigNumber from 'bignumber.js'
import { ProtectionControl } from 'components/vault/ProtectionControl'
import { AutoSellBanner, StopLossBanner } from 'features/aave/components/banners'
import type { BasicAutomationDetailsViewProps } from 'features/aave/components/BasicAutomationDetailsView'
import { BasicAutomationDetailsView } from 'features/aave/components/BasicAutomationDetailsView'
import { useProtectionSidebarDropdown } from 'features/aave/hooks'
import {
  useManageAaveStateMachineContext,
  useTriggersAaveStateMachineContext,
} from 'features/aave/manage/contexts'
import { getTriggerExecutionCollateralPriceDenominatedInDebt } from 'features/aave/manage/services/calculations'
import { AutoSellSidebarAaveVault } from 'features/aave/manage/sidebars/AutoSellSidebarAaveVault'
import type { AutoSellTriggerAaveContext } from 'features/aave/manage/state'
import { isAutoSellEnabled } from 'features/aave/manage/state'
import { zero } from 'helpers/zero'
import React, { useEffect } from 'react'
import { Box, Container, Grid } from 'theme-ui'

function getAutoSellDetailsLayoutProps(
  context: AutoSellTriggerAaveContext,
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

  const nextPrice = getTriggerExecutionCollateralPriceDenominatedInDebt({
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

export function ProtectionControlWrapper() {
  const { stateMachine } = useManageAaveStateMachineContext()
  const [state] = useActor(stateMachine)

  const triggersStateMachine = useTriggersAaveStateMachineContext()
  const [triggersState, sendTriggerEvent] = useActor(triggersStateMachine)
  const [autoSellState, sendAutoSellEvent] = useActor(triggersState.context.autoSellTrigger)

  const shouldLoadTriggers = useSelector(triggersState.context.autoSellTrigger, (selector) =>
    selector.matches('txDone'),
  )

  const autoSellDetailsLayoutProps = getAutoSellDetailsLayoutProps(
    autoSellState.context,
    !autoSellState.matches('idle'),
  )

  useEffect(() => {
    if (shouldLoadTriggers) {
      sendTriggerEvent({ type: 'TRANSACTION_DONE' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldLoadTriggers])

  const dropdown = useProtectionSidebarDropdown(triggersState, sendTriggerEvent)

  const showAutoSell = isAutoSellEnabled(triggersState)

  if (triggersState.context.protectionCurrentView !== 'stop-loss') {
    return (
      <Container variant="vaultPageContainer" sx={{ zIndex: 0 }}>
        <Grid variant="vaultContainer">
          <Grid gap={3} mb={[0, 5]}>
            {triggersState.context.protectionCurrentView === 'auto-sell' &&
              autoSellDetailsLayoutProps && (
                <BasicAutomationDetailsView {...autoSellDetailsLayoutProps} />
              )}
            {triggersState.context.showAutoSellBanner && (
              <AutoSellBanner buttonClicked={() => sendTriggerEvent({ type: 'SHOW_AUTO_SELL' })} />
            )}
            {triggersState.context.showStopLossBanner && (
              <StopLossBanner buttonClicked={() => sendTriggerEvent({ type: 'SHOW_STOP_LOSS' })} />
            )}
          </Grid>
          {triggersState.context.protectionCurrentView === 'auto-sell' &&
            autoSellState.context.position && (
              <Box>
                <AutoSellSidebarAaveVault
                  strategy={state.context.strategyConfig}
                  state={{ ...autoSellState.context, position: autoSellState.context.position }}
                  isStateMatch={(s) => autoSellState.matches(s)}
                  canTransitWith={(s) => autoSellState.can(s)}
                  updateState={sendAutoSellEvent}
                  isEditing={autoSellState.value === 'editing'}
                  dropdown={dropdown}
                />
              </Box>
            )}
        </Grid>
      </Container>
    )
  }

  const DetailsView = () => {
    return (
      <>
        {showAutoSell &&
          triggersState.context.protectionCurrentView === 'auto-sell' &&
          autoSellDetailsLayoutProps && (
            <BasicAutomationDetailsView {...autoSellDetailsLayoutProps} />
          )}
        {showAutoSell && triggersState.context.showAutoSellBanner && (
          <AutoSellBanner buttonClicked={() => sendTriggerEvent({ type: 'SHOW_AUTO_SELL' })} />
        )}
      </>
    )
  }

  const FormView = () => {
    return (
      <>
        {showAutoSell &&
          triggersState.context.protectionCurrentView === 'auto-sell' &&
          autoSellState.context.position && (
            <AutoSellSidebarAaveVault
              strategy={state.context.strategyConfig}
              state={{ ...autoSellState.context, position: autoSellState.context.position }}
              isStateMatch={(s) => autoSellState.matches(s)}
              canTransitWith={(s) => autoSellState.can(s)}
              updateState={sendAutoSellEvent}
              isEditing={autoSellState.value === 'editing'}
              dropdown={dropdown}
            />
          )}
      </>
    )
  }

  return <ProtectionControl AutoSellDetailsView={DetailsView} AutoSellFormControl={FormView} />
}
