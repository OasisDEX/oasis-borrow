import { useActor } from '@xstate/react'
import { useOpenAaveStateMachineContext } from 'features/aave/open/containers/AaveOpenStateMachineContext'
import { OpenAaveEditingStateView } from 'features/aave/open/sidebars/components/OpenAaveEditingStateView'
import { OpenAaveFailureStateView } from 'features/aave/open/sidebars/components/OpenAaveFailureStateView'
import { OpenAaveReviewingStateView } from 'features/aave/open/sidebars/components/OpenAaveReviewingStateView'
import { OpenAaveSuccessStateView } from 'features/aave/open/sidebars/components/OpenAaveSuccessStateView'
import { OpenAaveTransactionInProgressStateView } from 'features/aave/open/sidebars/components/OpenAaveTransactionInProgressStateView'
import { SidebarOpenAaveVaultStopLoss } from 'features/aave/open/sidebars/components/SidebarOpenAaveVaultStopLoss'
import { StopLossInProgressStateView } from 'features/aave/open/sidebars/components/StopLossInProgressStateView'
import { StopLossLambdaInProgressStateView } from 'features/aave/open/sidebars/components/StopLossLambdaInProgressStateView'
import { StopLossTxFailureStateView } from 'features/aave/open/sidebars/components/StopLossTxFailureStateView'
import { StopLossTxStateView } from 'features/aave/open/sidebars/components/StopLossTxStateView'
import type { OpenAaveStateMachine } from 'features/aave/open/state'
import { AllowanceView } from 'features/stateMachines/allowance'
import { CreateDPMAccountView } from 'features/stateMachines/dpmAccount/CreateDPMAccountView'
import { ProxyView } from 'features/stateMachines/proxy'
import React from 'react'
import type { StateFrom } from 'xstate'

function isLoading(state: StateFrom<OpenAaveStateMachine>) {
  return state.matches('background.loading')
}

export function SidebarOpenAaveVault() {
  const { stateMachine } = useOpenAaveStateMachineContext()
  const [state, send] = useActor(stateMachine)

  function loading(): boolean {
    return isLoading(state)
  }

  const sidebarProps = {
    state,
    send,
    isLoading: loading,
  }

  switch (true) {
    case state.matches('frontend.editing'):
      return <OpenAaveEditingStateView {...sidebarProps} />
    case state.matches('frontend.dsProxyCreating'):
      return (
        <ProxyView
          proxyMachine={state.context.refProxyMachine!}
          steps={[state.context.currentStep, state.context.totalSteps]}
        />
      )
    case state.matches('frontend.dpmProxyCreating'):
      return <CreateDPMAccountView machine={state.context.refDpmAccountMachine!} />
    case state.matches('frontend.allowanceSetting'):
      return (
        <AllowanceView
          allowanceMachine={state.context.refAllowanceStateMachine!}
          steps={[state.context.currentStep, state.context.totalSteps]}
        />
      )
    case state.matches('frontend.optionalStopLoss'):
      return <SidebarOpenAaveVaultStopLoss {...sidebarProps} />
    case state.matches('frontend.reviewing'):
      return <OpenAaveReviewingStateView {...sidebarProps} />
    case state.matches('frontend.txInProgress'):
    case state.matches('frontend.txInProgressEthers'):
      return <OpenAaveTransactionInProgressStateView {...sidebarProps} />
    case state.matches('frontend.txStopLoss'):
      return <StopLossTxStateView {...sidebarProps} />
    case state.matches('frontend.txStopLossInProgress'):
      return <StopLossInProgressStateView {...sidebarProps} />
    case state.matches('frontend.txStopLossLambdaInProgress'):
      return <StopLossLambdaInProgressStateView {...sidebarProps} />
    case state.matches('frontend.txFailure'):
      return <OpenAaveFailureStateView {...sidebarProps} />
    case state.matches('frontend.stopLossTxFailure'):
      return <StopLossTxFailureStateView {...sidebarProps} />
    case state.matches('frontend.txSuccess'):
    case state.matches('frontend.savePositionToDb'):
    case state.matches('frontend.finalized'):
      return <OpenAaveSuccessStateView {...sidebarProps} />
    default: {
      console.error('Unknown state', state, JSON.stringify(state.value))
      return <>Error, see console.</>
    }
  }
}
