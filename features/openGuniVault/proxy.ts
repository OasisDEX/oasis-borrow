import { TxHelpers } from 'components/AppContext'
import { createProxy } from 'features/proxy/createProxy'
import { Observable } from 'rxjs'

export function addProxyTransitions<S extends { stage: string }>(
  txHelpers: TxHelpers,
  proxyAddress$: Observable<string | undefined>,
  change: (ch: OpenVaultChange) => void,
  state: OpenVaultState,
): OpenVaultState {
  if (state.stage === 'proxyWaitingForConfirmation' || state.stage === 'proxyFailure') {
    return {
      ...state,
      progress: () => createProxy(txHelpers, proxyAddress$, change, state),
      regress: () => change({ kind: 'backToEditing' }),
    }
  }

  if (state.stage === 'proxySuccess') {
    return {
      ...state,
      progress: () =>
        change({
          kind: 'progressProxy',
        }),
    }
  }
}
