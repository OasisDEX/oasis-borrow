import { useActor, useSelector } from '@xstate/react'
import BigNumber from 'bignumber.js'
import { AaveStopLossManageDetails } from 'features/aave/components/AaveStopLossManageDetails'
import { AaveTrailingStopLossManageDetails } from 'features/aave/components/AaveTrailingStopLossManageDetails'
import { AutoSellBanner, StopLossBanner } from 'features/aave/components/banners'
import { TrailingStopLossBanner } from 'features/aave/components/banners/trailing-stop-loss-banner'
import type { BasicAutomationDetailsViewProps } from 'features/aave/components/BasicAutomationDetailsView'
import { BasicAutomationDetailsView } from 'features/aave/components/BasicAutomationDetailsView'
import { useProtectionSidebarDropdown } from 'features/aave/hooks'
import { AaveStopLossSelector } from 'features/aave/manage/containers/AaveStopLossSelector'
import { useManageAaveStateMachineContext } from 'features/aave/manage/contexts'
import { mapStopLossFromLambda } from 'features/aave/manage/helpers/map-stop-loss-from-lambda'
import { mapTrailingStopLossFromLambda } from 'features/aave/manage/helpers/map-trailing-stop-loss-from-lambda'
import { getProtectionControlUIstate } from 'features/aave/manage/helpers/protection-control-wrapper-ui-state'
import { getTriggerExecutionPrice } from 'features/aave/manage/services/calculations'
import { AaveManagePositionStopLossLambdaSidebar } from 'features/aave/manage/sidebars/AaveManagePositionStopLossLambdaSidebar'
import { AaveManagePositionTrailingStopLossLambdaSidebar } from 'features/aave/manage/sidebars/AaveManagePositionTrailingStopLossLambdaSidebar'
import { AutoSellSidebarAaveVault } from 'features/aave/manage/sidebars/AutoSellSidebarAaveVault'
import type {
  AutoSellTriggerAaveContext,
  ProtectionTriggersViews,
  TriggersAaveEvent,
  triggersAaveStateMachine,
} from 'features/aave/manage/state'
import { AppSpinner } from 'helpers/AppSpinner'
import { zero } from 'helpers/zero'
import type { AaveLikeReserveConfigurationData } from 'lendingProtocols/aave-like-common'
import React, { useEffect, useState } from 'react'
import { Container, Grid } from 'theme-ui'
import type { Sender, StateFrom } from 'xstate'

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

export function ProtectionControlWrapper({
  triggersState,
  sendTriggerEvent,
  aaveReserveState,
}: {
  readonly triggersState: StateFrom<typeof triggersAaveStateMachine>
  readonly sendTriggerEvent: Sender<TriggersAaveEvent>
  readonly aaveReserveState: AaveLikeReserveConfigurationData
}) {
  const { stateMachine } = useManageAaveStateMachineContext()
  const [state, send] = useActor(stateMachine)

  const [autoSellState, sendAutoSellEvent] = useActor(triggersState.context.autoSellTrigger)
  const stopLossLambdaData = mapStopLossFromLambda({
    protocol: state.context.strategyConfig.protocol,
    triggers: triggersState.context.currentTriggers.triggers,
  })
  const trailingStopLossLambdaData = mapTrailingStopLossFromLambda({
    protocol: state.context.strategyConfig.protocol,
    triggers: triggersState.context.currentTriggers.triggers,
  })
  const [stopLossToken, setStopLossToken] = useState<'debt' | 'collateral'>(
    stopLossLambdaData.stopLossToken ?? 'debt',
  )
  const [trailingStopLossToken, setTrailingStopLossToken] = useState<'debt' | 'collateral'>(
    trailingStopLossLambdaData.trailingStopLossToken ?? 'debt',
  )

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
  const protectionControlUI = getProtectionControlUIstate(triggersState)
  const goToView = (view: ProtectionTriggersViews) => () =>
    sendTriggerEvent({ type: 'CHANGE_PROTECTION_VIEW', view })
  if (triggersState.context.protectionCurrentView === 'stop-loss-selector') {
    return <AaveStopLossSelector sendTriggerEvent={sendTriggerEvent} />
  }
  const isTriggersLoading = triggersState.matches('loading')
  if (isTriggersLoading) {
    return (
      <Container variant="vaultPageContainer">
        <AppSpinner variant="" />
      </Container>
    )
  }
  return (
    <Container variant="vaultPageContainer" sx={{ zIndex: 0 }}>
      <Grid variant="vaultContainer">
        <Grid gap={3} mb={[0, 5]}>
          {/** this is visible when we're adding a new trigger */}
          {protectionControlUI.stopLoss.configure && (
            <AaveStopLossManageDetails
              state={state}
              stopLossToken={stopLossToken}
              stopLossLambdaData={stopLossLambdaData}
              triggers={triggersState.context.currentTriggers.triggers}
              reserveConfigurationData={aaveReserveState}
            />
          )}
          {protectionControlUI.autoSell.configure && autoSellDetailsLayoutProps && (
            <BasicAutomationDetailsView {...autoSellDetailsLayoutProps} />
          )}
          {protectionControlUI.trailingStopLoss.configure && trailingStopLossLambdaData && (
            <AaveTrailingStopLossManageDetails
              trailingStopLossLambdaData={trailingStopLossLambdaData}
              trailingStopLossToken={trailingStopLossToken}
              state={state}
              isEditing
            />
          )}
          {/** this is visible when we're adding a new trigger */}
          {/** its because we want the adding panel always at the top */}
          {/** this is visible when theres current trigger */}
          {protectionControlUI.stopLoss.view && (
            <AaveStopLossManageDetails
              state={state}
              stopLossToken={stopLossToken}
              stopLossLambdaData={stopLossLambdaData}
              triggers={triggersState.context.currentTriggers.triggers}
              reserveConfigurationData={aaveReserveState}
            />
          )}
          {protectionControlUI.autoSell.view && autoSellDetailsLayoutProps && (
            <BasicAutomationDetailsView {...autoSellDetailsLayoutProps} />
          )}
          {protectionControlUI.trailingStopLoss.view && trailingStopLossLambdaData && (
            <AaveTrailingStopLossManageDetails
              trailingStopLossLambdaData={trailingStopLossLambdaData}
              trailingStopLossToken={trailingStopLossToken}
              state={state}
              isEditing={false}
            />
          )}
          {/** this is visible when theres current trigger */}
          {protectionControlUI.autoSell.banner && (
            <AutoSellBanner buttonClicked={goToView('auto-sell')} />
          )}
          {protectionControlUI.stopLoss.banner && !protectionControlUI.trailingStopLoss.banner && (
            <StopLossBanner buttonClicked={goToView('stop-loss')} />
          )}
          {protectionControlUI.trailingStopLoss.banner && !protectionControlUI.stopLoss.banner && (
            <TrailingStopLossBanner buttonClicked={goToView('trailing-stop-loss')} />
          )}
          {protectionControlUI.stopLoss.banner && protectionControlUI.trailingStopLoss.banner && (
            <StopLossBanner buttonClicked={goToView('stop-loss-selector')} />
          )}
        </Grid>
        {protectionControlUI.autoSell.sidebar && autoSellState.context.position && (
          <AutoSellSidebarAaveVault
            strategy={state.context.strategyConfig}
            state={{
              ...autoSellState.context,
              position: autoSellState.context.position,
            }}
            isStateMatch={(s) => autoSellState.matches(s)}
            canTransitWith={(s) => autoSellState.can(s)}
            updateState={sendAutoSellEvent}
            isEditing={autoSellState.value === 'editing'}
            dropdown={dropdown}
          />
        )}
        {protectionControlUI.stopLoss.sidebar && (
          <AaveManagePositionStopLossLambdaSidebar
            state={state}
            send={send}
            stopLossToken={stopLossToken}
            setStopLossToken={setStopLossToken}
            stopLossLambdaData={stopLossLambdaData}
            trailingStopLossLambdaData={trailingStopLossLambdaData}
            reserveConfigurationData={aaveReserveState}
            dropdown={dropdown}
            sendTriggerEvent={sendTriggerEvent}
            onTxFinished={() => sendTriggerEvent({ type: 'TRANSACTION_DONE' })}
          />
        )}
        {protectionControlUI.trailingStopLoss.sidebar && (
          <AaveManagePositionTrailingStopLossLambdaSidebar
            state={state}
            send={send}
            trailingStopLossToken={trailingStopLossToken}
            setTrailingStopLossToken={setTrailingStopLossToken}
            stopLossLambdaData={stopLossLambdaData}
            trailingStopLossLambdaData={trailingStopLossLambdaData}
            dropdown={dropdown}
            sendTriggerEvent={sendTriggerEvent}
            onTxFinished={() => sendTriggerEvent({ type: 'TRANSACTION_DONE' })}
          />
        )}
      </Grid>
    </Container>
  )
}
