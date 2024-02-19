import { useActor, useSelector } from '@xstate/react'
import BigNumber from 'bignumber.js'
import { ProtectionControl } from 'components/vault/ProtectionControl'
import { useAaveContext } from 'features/aave/aave-context-provider'
import { AaveStopLossManageDetails } from 'features/aave/components/AaveStopLossManageDetails'
import { AutoSellBanner, StopLossBanner } from 'features/aave/components/banners'
import { TrailingStopLossBanner } from 'features/aave/components/banners/trailing-stop-loss-banner'
import type { BasicAutomationDetailsViewProps } from 'features/aave/components/BasicAutomationDetailsView'
import { BasicAutomationDetailsView } from 'features/aave/components/BasicAutomationDetailsView'
import { useProtectionSidebarDropdown } from 'features/aave/hooks'
import { AaveStopLossSelector } from 'features/aave/manage/containers/AaveStopLossSelector'
import { useManageAaveStateMachineContext } from 'features/aave/manage/contexts'
import { mapStopLossFromLambda } from 'features/aave/manage/helpers/map-stop-loss-from-lambda'
import { mapTrailingStopLossFromLambda } from 'features/aave/manage/helpers/map-trailing-stop-loss-from-lambda'
import { getProtectionControlVisibilityToggles } from 'features/aave/manage/helpers/protection-control-wrapper-visibility-toggles'
import { getTriggerExecutionPrice } from 'features/aave/manage/services/calculations'
import { AaveManagePositionStopLossLambdaSidebar } from 'features/aave/manage/sidebars/AaveManagePositionStopLossLambdaSidebar'
import { AaveManagePositionTrailingStopLossLambdaSidebar } from 'features/aave/manage/sidebars/AaveManagePositionTrailingStopLossLambdaSidebar'
import { AutoSellSidebarAaveVault } from 'features/aave/manage/sidebars/AutoSellSidebarAaveVault'
import type {
  AutoSellTriggerAaveContext,
  TriggersAaveEvent,
  triggersAaveStateMachine,
  TriggersViews,
} from 'features/aave/manage/state'
import { AppSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { zero } from 'helpers/zero'
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
}: {
  readonly triggersState: StateFrom<typeof triggersAaveStateMachine>
  readonly sendTriggerEvent: Sender<TriggersAaveEvent>
}) {
  const { stateMachine } = useManageAaveStateMachineContext()
  const [state, send] = useActor(stateMachine)

  const [autoSellState, sendAutoSellEvent] = useActor(triggersState.context.autoSellTrigger)
  const stopLossLambdaData = mapStopLossFromLambda(triggersState.context.currentTriggers.triggers)
  const trailingStopLossLambdaData = mapTrailingStopLossFromLambda(
    triggersState.context.currentTriggers.triggers,
  )
  const [stopLossToken, setStopLossToken] = useState<'debt' | 'collateral'>(
    stopLossLambdaData.stopLossToken ?? 'debt',
  )
  const { aaveLikeReserveConfigurationData$ } = useAaveContext(
    state.context.strategyConfig.protocol,
    state.context.strategyConfig.network,
  )
  const [reserveConfigurationData, reserveConfigurationDataError] = useObservable(
    aaveLikeReserveConfigurationData$({
      collateralToken: state.context.strategyConfig.tokens.collateral,
      debtToken: state.context.strategyConfig.tokens.debt,
    }),
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
  const visibilityToggles = getProtectionControlVisibilityToggles(triggersState)
  const goToView = (view: TriggersViews) => () => sendTriggerEvent({ type: 'CHANGE_VIEW', view })

  console.log(
    'setup',
    JSON.stringify(
      {
        currentProtectionView: triggersState.context.protectionCurrentView,
        visibilityToggles,
      },
      null,
      2,
    ),
  )

  if (triggersState.context.protectionCurrentView) {
    if (triggersState.context.protectionCurrentView === 'stop-loss-selector') {
      return <AaveStopLossSelector sendTriggerEvent={sendTriggerEvent} />
    }
    const isTriggersLoading = triggersState.matches('loading') ? undefined : true
    return (
      <WithErrorHandler error={[reserveConfigurationDataError]}>
        <WithLoadingIndicator
          value={[reserveConfigurationData, isTriggersLoading]}
          customLoader={<AppSpinner />}
        >
          {([_reserveConfigurationData]) => {
            return (
              <Container variant="vaultPageContainer" sx={{ zIndex: 0 }}>
                <Grid variant="vaultContainer">
                  <Grid gap={3} mb={[0, 5]}>
                    {/** this is visible when we're adding a new trigger */}
                    {visibilityToggles.stopLossConfiguring && (
                      <AaveStopLossManageDetails
                        state={state}
                        stopLossToken={stopLossToken}
                        stopLossLambdaData={stopLossLambdaData}
                        triggers={triggersState.context.currentTriggers.triggers}
                        reserveConfigurationData={_reserveConfigurationData}
                      />
                    )}
                    {visibilityToggles.autoSellConfiguring && autoSellDetailsLayoutProps && (
                      <BasicAutomationDetailsView {...autoSellDetailsLayoutProps} />
                    )}
                    {visibilityToggles.trailingStopLossConfiguring &&
                      autoSellDetailsLayoutProps && <div>Trailing stop loss details here</div>}
                    {/** this is visible when we're adding a new trigger */}
                    {/** its because we want the adding panel always at the top */}
                    {/** this is visible when theres current trigger */}
                    {visibilityToggles.stopLossViewing && (
                      <AaveStopLossManageDetails
                        state={state}
                        stopLossToken={stopLossToken}
                        stopLossLambdaData={stopLossLambdaData}
                        triggers={triggersState.context.currentTriggers.triggers}
                        reserveConfigurationData={_reserveConfigurationData}
                      />
                    )}
                    {visibilityToggles.autoSellViewing && autoSellDetailsLayoutProps && (
                      <BasicAutomationDetailsView {...autoSellDetailsLayoutProps} />
                    )}
                    {visibilityToggles.trailingStopLossViewing && autoSellDetailsLayoutProps && (
                      <div>Trailing stop loss details here</div>
                    )}
                    {/** this is visible when theres current trigger */}
                    {visibilityToggles.bannerAutoSell && (
                      <AutoSellBanner buttonClicked={goToView('auto-sell')} />
                    )}
                    {visibilityToggles.bannerStopLoss &&
                      !visibilityToggles.bannerTrailingStopLoss && (
                        <StopLossBanner buttonClicked={goToView('stop-loss')} />
                      )}
                    {visibilityToggles.bannerTrailingStopLoss &&
                      !visibilityToggles.bannerStopLoss && (
                        <TrailingStopLossBanner buttonClicked={goToView('trailing-stop-loss')} />
                      )}
                    {visibilityToggles.bannerStopLoss &&
                      visibilityToggles.bannerTrailingStopLoss && (
                        <StopLossBanner buttonClicked={goToView('stop-loss-selector')} />
                      )}
                  </Grid>
                  {visibilityToggles.autoSellSidebar && autoSellState.context.position && (
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
                  {visibilityToggles.stopLossSidebar && (
                    <AaveManagePositionStopLossLambdaSidebar
                      state={state}
                      send={send}
                      stopLossToken={stopLossToken}
                      setStopLossToken={setStopLossToken}
                      stopLossLambdaData={stopLossLambdaData}
                      trailingStopLossLambdaData={trailingStopLossLambdaData}
                      reserveConfigurationData={_reserveConfigurationData}
                      dropdown={dropdown}
                      onTxFinished={() => sendTriggerEvent({ type: 'TRANSACTION_DONE' })}
                    />
                  )}
                  {visibilityToggles.trailingStopLossSidebar && (
                    <AaveManagePositionTrailingStopLossLambdaSidebar
                      state={state}
                      send={send}
                      stopLossToken={stopLossToken}
                      setStopLossToken={setStopLossToken}
                      stopLossLambdaData={stopLossLambdaData}
                      trailingStopLossLambdaData={trailingStopLossLambdaData}
                      reserveConfigurationData={_reserveConfigurationData}
                      dropdown={dropdown}
                      onTxFinished={() => sendTriggerEvent({ type: 'TRANSACTION_DONE' })}
                    />
                  )}
                </Grid>
              </Container>
            )
          }}
        </WithLoadingIndicator>
      </WithErrorHandler>
    )
  }

  // all below is the old protection - so when all of the lambda flags are off
  // we can remove it when we're sure that the new protection is fine

  return <ProtectionControl />
}
