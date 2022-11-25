import React from 'react'
import { SidebarSection } from 'components/sidebar/SidebarSection'
import { SidebarVaultProxyStage } from 'components/vault/sidebar/SidebarVaultProxyStage'
import { SidebarVaultAllowanceStage } from 'components/vault/sidebar/SidebarVaultAllowanceStage'
import { ProxyView } from 'features/proxyNew'
import { getGasEstimation$, getOpenProxyStateMachine } from 'features/proxyNew/pipelines'
import { useAppContext } from 'components/AppContextProvider'
import { distinctUntilKeyChanged, shareReplay, switchMap } from 'rxjs/operators'
import { curry } from 'ramda'
import { Observable } from 'rxjs'
import { spawn } from 'xstate'
import { useInterpret } from '@xstate/react'

export function SidebarDsr() {
  const { txHelpers$, gasPrice$, daiEthTokenPrice$, proxyAddress$, connectedContext$ } = useAppContext()

  const contextForAddress$ = connectedContext$.pipe(
    distinctUntilKeyChanged('account'),
    shareReplay(1),
  )
  const gasEstimation$ = curry(getGasEstimation$)(gasPrice$, daiEthTokenPrice$)
  const proxyForAccount$: Observable<string | undefined> = contextForAddress$.pipe(
    switchMap(({ account }) => proxyAddress$(account)),
  )
  const proxyStateMachine = getOpenProxyStateMachine(
    contextForAddress$,
    txHelpers$,
    proxyForAccount$,
    gasEstimation$,
  )
  const stateMachine = useInterpret(proxyStateMachine).start()
  return (
    <SidebarSection
      title="Set up DSR strategy"
      content={
        <div>
          <ProxyView proxyMachine={stateMachine} steps={[1, 3]} />
          {/*<SidebarVaultProxyStage*/}
          {/*  stage="proxyWaitingForConfirmation"*/}
          {/*  gasData={{ gasEstimationStatus: 'calculating' }}*/}
          {/*/>*/}
          {/*<SidebarVaultAllowanceStage />*/}
        </div>
      }
      primaryButton={{ label: 'Open Earn position' }}
    />
  )
}
