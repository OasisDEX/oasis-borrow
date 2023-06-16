import { useWeb3React } from '@web3-react/core'
import { NetworkConnector } from '@web3-react/network-connector'
import { Provider as Web3Provider } from 'ethereum-types'
import { ethers } from 'ethers'
import { useWeb3OnBoardConnectorContext } from 'features/web3OnBoard/web3OnBoardConnectorProvider'
import { isEqual } from 'lodash'
import { useEffect } from 'react'
import { Observable, ReplaySubject } from 'rxjs'
import { distinctUntilChanged } from 'rxjs/operators'

import { Web3Context, Web3ContextConnectedReadonly } from './types'

export type BalanceOfMethod = (address: string) => { call: () => Promise<string> }

type createWeb3ContextReturnType = [
  Observable<Web3Context>,
  () => void,
  (chainId: number, context: Web3ContextConnectedReadonly) => void,
]

export function createWeb3Context$(): createWeb3ContextReturnType {
  const web3Context$ = new ReplaySubject<Web3Context>(1)

  function push(c: Web3Context) {
    web3Context$.next(c)
  }

  function useWeb3Context$() {
    const context = useWeb3React<Web3Provider>()
    const { connector, library, activate, chainId, account, deactivate } = context

    const {
      connector: bridgeConnector,
      networkConnector,
      networkConfig,
    } = useWeb3OnBoardConnectorContext()

    useEffect(() => {
      if (bridgeConnector && !bridgeConnector.isTheSame(connector)) {
        void activate(bridgeConnector)
      }
    }, [bridgeConnector, activate, connector])

    useEffect(() => {
      if (connector && !bridgeConnector) {
        void deactivate()
      }
    }, [bridgeConnector, deactivate, connector])

    useEffect(() => {
      if (library && bridgeConnector && bridgeConnector.chainId === chainId && account) {
        push({
          status: 'connected',
          connectionKind: 'injected',
          web3: library as any,
          chainId: bridgeConnector.chainId,
          connectionMethod: 'web3-onboard',
          account: account,
          magicLinkEmail: undefined,
          walletLabel: bridgeConnector.wallet.label,
          transactionProvider: new ethers.providers.Web3Provider(
            bridgeConnector.basicInfo.provider,
          ).getSigner(),
        })
      }
    }, [account, chainId, library, bridgeConnector])

    useEffect(() => {
      if (networkConnector && !bridgeConnector && !connector) {
        void activate(networkConnector)
      }
    }, [networkConnector, activate, bridgeConnector, connector])

    useEffect(() => {
      if (connector instanceof NetworkConnector && library && networkConfig) {
        push({
          status: 'connectedReadonly',
          connectionKind: 'network',
          web3: library as any,
          connectionMethod: 'web3-onboard',
          chainId: networkConfig.id,
          walletLabel: undefined,
        })
      }
    }, [library, networkConfig, connector])
  }

  function switchChains(_nextChainId: number, context: Web3ContextConnectedReadonly) {
    push({
      status: context.status,
      connectionKind: context.connectionKind,
      web3: context.web3,
      chainId: _nextChainId,
      connectionMethod: context.connectionMethod,
      walletLabel: context.walletLabel,
    })
    // this is currently not being used
  }

  return [web3Context$.pipe(distinctUntilChanged(isEqual)), useWeb3Context$, switchChains]
}
