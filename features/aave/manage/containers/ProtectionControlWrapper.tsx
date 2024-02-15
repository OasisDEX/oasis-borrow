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
import {
  useManageAaveStateMachineContext,
  useTriggersAaveStateMachineContext,
} from 'features/aave/manage/contexts'
import { mapStopLossFromLambda } from 'features/aave/manage/helpers/map-stop-loss-from-lambda'
import { getTriggerExecutionPrice } from 'features/aave/manage/services/calculations'
import { AaveManagePositionStopLossLambdaSidebar } from 'features/aave/manage/sidebars/AaveManagePositionStopLossLambdaSidebar'
import { AutoSellSidebarAaveVault } from 'features/aave/manage/sidebars/AutoSellSidebarAaveVault'
import type { AutoSellTriggerAaveContext } from 'features/aave/manage/state'
import {
  hasActiveAutoSell,
  hasActiveStopLoss,
  hasActiveTrailingStopLoss,
  isAutoSellEnabled,
} from 'features/aave/manage/state'
import { AutomationFeatures } from 'features/automation/common/types'
import { AppSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { zero } from 'helpers/zero'
import React, { useEffect, useState } from 'react'
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

export function ProtectionControlWrapper() {
  const { stateMachine } = useManageAaveStateMachineContext()
  const [state, send] = useActor(stateMachine)

  const triggersStateMachine = useTriggersAaveStateMachineContext()
  const [triggersState, sendTriggerEvent] = useActor(triggersStateMachine)
  const [autoSellState, sendAutoSellEvent] = useActor(triggersState.context.autoSellTrigger)
  const stopLossLambdaData = mapStopLossFromLambda(triggersState.context.currentTriggers.triggers)
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

  const showAutoSell = isAutoSellEnabled(triggersState)
  const hasStopLoss = hasActiveStopLoss(triggersState)
  const hasTrailingStopLoss = hasActiveTrailingStopLoss(triggersState)
  const hasAutoSell = hasActiveAutoSell(triggersState)
  const showStopLossBanner =
    !hasStopLoss &&
    triggersState.context.strategyConfig.isAutomationFeatureEnabled(AutomationFeatures.STOP_LOSS)
  const showTrailingStopLossBanner =
    !hasTrailingStopLoss &&
    triggersState.context.strategyConfig.isAutomationFeatureEnabled(
      AutomationFeatures.TRAILING_STOP_LOSS,
    )
  const showAutoSellBanner =
    !hasAutoSell &&
    triggersState.context.strategyConfig.isAutomationFeatureEnabled(AutomationFeatures.AUTO_SELL)

  console.log(
    'setup',
    JSON.stringify(
      {
        currentProtectionView: triggersState.context.protectionCurrentView,
        hasStopLoss,
        hasAutoSell,
        showStopLossBanner,
        showAutoSellBanner,
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
                    {(hasStopLoss ||
                      triggersState.context.protectionCurrentView === 'stop-loss') && (
                      <AaveStopLossManageDetails
                        state={state}
                        stopLossToken={stopLossToken}
                        stopLossLambdaData={stopLossLambdaData}
                        triggers={triggersState.context.currentTriggers.triggers}
                        reserveConfigurationData={_reserveConfigurationData}
                      />
                    )}
                    {(hasAutoSell || triggersState.context.protectionCurrentView === 'auto-sell') &&
                      autoSellDetailsLayoutProps && (
                        <BasicAutomationDetailsView {...autoSellDetailsLayoutProps} />
                      )}
                    {showAutoSellBanner && (
                      <AutoSellBanner
                        buttonClicked={() =>
                          sendTriggerEvent({ type: 'CHANGE_VIEW', view: 'auto-sell' })
                        }
                      />
                    )}
                    {showStopLossBanner && (
                      <StopLossBanner
                        buttonClicked={() =>
                          sendTriggerEvent({ type: 'CHANGE_VIEW', view: 'stop-loss-selector' })
                        }
                      />
                    )}
                    {showTrailingStopLossBanner && (
                      <TrailingStopLossBanner
                        buttonClicked={() =>
                          sendTriggerEvent({ type: 'CHANGE_VIEW', view: 'trailing-stop-loss' })
                        }
                      />
                    )}
                  </Grid>
                  {triggersState.context.protectionCurrentView === 'auto-sell' &&
                    autoSellState.context.position && (
                      <Box>
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
                      </Box>
                    )}
                  {triggersState.context.protectionCurrentView === 'stop-loss' && (
                    <AaveManagePositionStopLossLambdaSidebar
                      state={state}
                      send={send}
                      stopLossToken={stopLossToken}
                      setStopLossToken={setStopLossToken}
                      stopLossLambdaData={stopLossLambdaData}
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

  const DetailsView = () => {
    return (
      <>
        {showAutoSell &&
          triggersState.context.protectionCurrentView === 'auto-sell' &&
          autoSellDetailsLayoutProps && (
            <BasicAutomationDetailsView {...autoSellDetailsLayoutProps} />
          )}
        {showAutoSell && showAutoSellBanner && (
          <AutoSellBanner
            buttonClicked={() => sendTriggerEvent({ type: 'CHANGE_VIEW', view: 'auto-sell' })}
          />
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
