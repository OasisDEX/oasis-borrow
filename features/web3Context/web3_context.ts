import { AbstractConnector } from '@web3-react/abstract-connector'
import { useWeb3React } from '@web3-react/core'
import { NetworkConnector } from '@web3-react/network-connector'
import { Provider as Web3Provider } from 'ethereum-types'
import { BridgeConnector } from 'features/web3OnBoard'
import { isEqual } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { Observable, ReplaySubject } from 'rxjs'
import { distinctUntilChanged } from 'rxjs/operators'

import { getNetworkId } from './network'
import { ConnectionKind, Web3Context } from './types'

export type BalanceOfMethod = (address: string) => { call: () => Promise<string> }

export function createWeb3Context$(chainIdToRpcUrl: {
  [chainId: number]: string
}): [Observable<Web3Context>, () => void] {
  const web3Context$ = new ReplaySubject<Web3Context>(1)

  function push(c: Web3Context) {
    web3Context$.next(c)
  }

  function setupWeb3Context$() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const context = useWeb3React<Web3Provider>()

    const {
      connector,
      library,
      chainId,
      account,
      activate,
      deactivate,
      active,
      error,
      setError,
    } = context
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [activatingConnector, setActivatingConnector] = useState<AbstractConnector>()
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [connectionKind, setConnectionKind] = useState<ConnectionKind>()

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const connect = useCallback(
      async (connector: AbstractConnector, connectionKind: ConnectionKind) => {
        setActivatingConnector(connector)
        setConnectionKind(connectionKind)

        try {
          await activate(connector)
        } catch (e) {
          console.error(`Error while connecting`, e)
          setError(new Error('Error while connecting'))
        }
      },
      [activate, setError],
    )

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (activatingConnector && activatingConnector === connector) {
        setActivatingConnector(undefined)
      }
    }, [activatingConnector, connector])

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (activatingConnector) {
        push({
          status: 'connecting',
          connectionKind: connectionKind!,
        })
        return
      }

      if (error) {
        push({
          status: 'error',
          error,
          connect,
          deactivate,
        })
        return
      }

      if (!connector) {
        push({
          status: 'notConnected',
          connect,
        })
        return
      }

      if (!account) {
        push({
          status: 'connectedReadonly',
          connectionKind: connectionKind!,
          web3: library as any,
          chainId: chainId!,
          connect,
          deactivate,
          walletLabel: undefined,
          connectionMethod: 'legacy',
        })
        return
      }

      if (chainId !== getNetworkId()) {
        setTimeout(() => {
          connect(
            new NetworkConnector({
              urls: chainIdToRpcUrl,
              defaultChainId: getNetworkId(),
            }),
            'network',
            // eslint-disable-next-line @typescript-eslint/no-empty-function
          )
            .then(() => {})
            .catch((e) => {
              console.error('Error while connecting to network', e)
            })
        })
        return
      }

      if (connectionKind) {
        push({
          status: 'connected',
          connectionKind,
          web3: library as any,
          chainId: chainId!,
          account,
          deactivate,
          magicLinkEmail: undefined,
          connectionMethod: connector instanceof BridgeConnector ? 'web3-onboard' : 'legacy',
          walletLabel: connector instanceof BridgeConnector ? connector.wallet.label : undefined,
        })
      }
    }, [
      activatingConnector,
      connectionKind,
      connector,
      library,
      chainId,
      account,
      activate,
      deactivate,
      active,
      error,
      connect,
    ])
  }

  return [web3Context$.pipe(distinctUntilChanged(isEqual)), setupWeb3Context$]
}
