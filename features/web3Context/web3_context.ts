import { AbstractConnector } from '@web3-react/abstract-connector'
import { useWeb3React } from '@web3-react/core'
import { NetworkConnector } from '@web3-react/network-connector'
import { networksById } from 'blockchain/networksConfig'
import { Provider as Web3Provider } from 'ethereum-types'
import { ethers } from 'ethers'
import { BridgeConnector } from 'features/web3OnBoard'
import { useCustomNetworkParameter } from 'helpers/getCustomNetworkParameter'
import { isEqual } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { Observable, ReplaySubject } from 'rxjs'
import { distinctUntilChanged } from 'rxjs/operators'

import { getNetworkId } from './network'
import { ConnectionKind, Web3Context, Web3ContextConnectedReadonly } from './types'

export type BalanceOfMethod = (address: string) => { call: () => Promise<string> }

type createWeb3ContextReturnType = [
  Observable<Web3Context>,
  () => void,
  (chainId: number, context: Web3ContextConnectedReadonly) => void,
]

export function createWeb3Context$(chainIdToRpcUrl: {
  [chainId: number]: string
}): createWeb3ContextReturnType {
  const web3Context$ = new ReplaySubject<Web3Context>(1)

  function push(c: Web3Context) {
    web3Context$.next(c)
  }

  function setupWeb3Context$() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const context = useWeb3React<Web3Provider>()

    const { connector, library, chainId, account, activate, deactivate, active, error, setError } =
      context
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [activatingConnector, setActivatingConnector] = useState<AbstractConnector>()
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [connectionKind, setConnectionKind] = useState<ConnectionKind>()
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [, setCustomNetwork] = useCustomNetworkParameter()

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const connect = useCallback(
      async (connector: AbstractConnector, connectionKind: ConnectionKind) => {
        setActivatingConnector(connector)
        setConnectionKind(connectionKind)

        try {
          await activate(connector)
          return true
        } catch (e) {
          console.error(`Error while connecting`, e)
          setError(new Error('Error while connecting'))
          return false
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
        const networkIdParam = getNetworkId()
        setTimeout(() => {
          connect(
            new NetworkConnector({
              urls: chainIdToRpcUrl,
              defaultChainId: networkIdParam,
            }),
            'network',
            // eslint-disable-next-line @typescript-eslint/no-empty-function
          )
            .then(() => {
              const network = networksById[networkIdParam]
              setCustomNetwork({
                network: network.name!,
                id: network.id!,
                hexId: network.hexId!,
              })
              console.log('Chain ID changed:', chainId, '/', networkIdParam)
            })
            .catch((e) => {
              console.error('Error while connecting to network', e)
            })
        })
        return
      }

      if (connectionKind && connector instanceof BridgeConnector) {
        push({
          status: 'connected',
          connectionKind,
          web3: library as any,
          chainId: chainId!,
          account,
          deactivate,
          magicLinkEmail: undefined,
          connectionMethod: 'web3-onboard',
          walletLabel: connector.wallet.label,
          transactionProvider: new ethers.providers.Web3Provider(
            connector.basicInfo.provider,
          ).getSigner(),
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
      setCustomNetwork,
    ])
  }

  function switchChains(_nextChainId: number, context: Web3ContextConnectedReadonly) {
    push({
      status: context.status,
      connectionKind: context.connectionKind,
      web3: context.web3,
      chainId: _nextChainId,
      deactivate: context.deactivate,
      connect: context.connect,
      connectionMethod: context.connectionMethod,
    })
    // this is currently not being used
  }

  return [web3Context$.pipe(distinctUntilChanged(isEqual)), setupWeb3Context$, switchChains]
}
