import { useWeb3React } from '@web3-react/core'
import { NetworkConnector } from '@web3-react/network-connector'
import type { Provider as Web3Provider } from 'ethereum-types'
import { ethers } from 'ethers'
import { BridgeConnector } from 'features/web3OnBoard/bridge-connector'
import { useWeb3OnBoardConnectorContext } from 'features/web3OnBoard/web3-on-board-connector-provider'
import { isEqual } from 'lodash'
import { useEffect } from 'react'
import type { Observable } from 'rxjs'
import { ReplaySubject } from 'rxjs'
import { distinctUntilChanged } from 'rxjs/operators'

import type { Web3Context } from './types'

export type BalanceOfMethod = (address: string) => { call: () => Promise<string> }

type createWeb3ContextReturnType = [Observable<Web3Context>, () => void]

export function createWeb3Context$(): createWeb3ContextReturnType {
  const web3Context$ = new ReplaySubject<Web3Context>(1)

  function push(c: Web3Context) {
    web3Context$.next(c)
  }

  function useWeb3Context$() {
    const context = useWeb3React<Web3Provider>()
    const { connector, library, activate, chainId, account, deactivate } = context

    const {
      state: { connector: bridgeConnector, networkConnector, networkConnectorNetworkId, status },
    } = useWeb3OnBoardConnectorContext()

    useEffect(() => {
      if (bridgeConnector && !bridgeConnector.isTheSame(connector)) {
        void activate(bridgeConnector)
      }
    }, [bridgeConnector, activate, connector])

    useEffect(() => {
      if (connector && !bridgeConnector && connector instanceof BridgeConnector) {
        void deactivate()
      }
    }, [bridgeConnector, deactivate, connector])

    useEffect(() => {
      if (library && bridgeConnector) {
        push({
          status: 'connected',
          connectionKind: 'injected',
          web3: library as any,
          chainId: bridgeConnector.chainId,
          connectionMethod: 'web3-onboard',
          account: bridgeConnector.connectedAccount,
          magicLinkEmail: undefined,
          walletLabel: bridgeConnector.wallet.label,
          transactionProvider: new ethers.providers.Web3Provider(
            bridgeConnector.connectorInformation.provider,
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
      if (
        connector &&
        connector instanceof NetworkConnector &&
        library &&
        networkConnectorNetworkId
      ) {
        push({
          status: 'connectedReadonly',
          connectionKind: 'network',
          web3: library as any,
          connectionMethod: 'web3-onboard',
          chainId: networkConnectorNetworkId,
          walletLabel: undefined,
        })
      }
    }, [networkConnectorNetworkId, library, connector, status])
  }

  return [web3Context$.pipe(distinctUntilChanged(isEqual)), useWeb3Context$]
}
