import { useConnectWallet, useSetChain } from '@web3-onboard/react'
import {
  NetworkConfigHexId,
  networkSetByHexId,
  shouldSetRequestedNetworkHexId,
  useCustomNetworkParameter,
} from 'blockchain/networks'
import React, { Dispatch, useCallback, useEffect, useMemo, useState } from 'react'

import { BridgeConnector } from './BridgeConnector'

export interface BridgeConnectorState {
  createConnector: (
    setNetworkHexId: Dispatch<NetworkConfigHexId>,
    networkId?: NetworkConfigHexId,
    forced?: boolean,
  ) => Promise<void>
  connecting: boolean
  connectorState: [BridgeConnector | undefined, React.Dispatch<BridgeConnector | undefined>]
}

export function useBridgeConnector(): BridgeConnectorState {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()
  const [{ chains }] = useSetChain()
  const [connector, setConnector] = useState<BridgeConnector | undefined>(undefined)
  const [customNetwork, setCustomNetwork] = useCustomNetworkParameter()

  const automaticConnector = useMemo(() => {
    if (wallet) {
      return new BridgeConnector(wallet, chains, disconnect)
    }
    return undefined
  }, [wallet, chains, disconnect])

  useEffect(() => {
    setConnector(automaticConnector)
  }, [automaticConnector])

  useEffect(() => {
    if (wallet) {
      wallet.provider.on('connect', ({ chainId }) => {
        const currentNetwork = networkSetByHexId[chainId]
        setCustomNetwork({
          hexId: currentNetwork.hexId,
          id: currentNetwork.id,
          network: currentNetwork.name,
        })
      })

      wallet.provider.on('chainChanged', (chainId) => {
        const currentNetwork = networkSetByHexId[chainId]
        setCustomNetwork({
          hexId: currentNetwork.hexId,
          id: currentNetwork.id,
          network: currentNetwork.name,
        })
      })
    }
  }, [setCustomNetwork, wallet])

  const createConnector = useCallback(
    async (
      setNetworkHexId: Dispatch<NetworkConfigHexId>,
      networkId?: NetworkConfigHexId,
      forced: boolean = false,
    ) => {
      console.log('createConnector context setup 1', connect)
      if (!connecting) {
        if (networkId && shouldSetRequestedNetworkHexId(customNetwork?.hexId, networkId)) {
          console.log(
            `Network change to ${networkId} because shouldSetRequestedNetworkHexId. Current network is ${customNetwork?.hexId}`,
          )
          setNetworkHexId(networkId)
        } else if (networkId && forced) {
          console.log(
            `Forced network change to ${networkId}. Current network is ${customNetwork?.hexId}`,
          )
          setNetworkHexId(networkId)
        }
        console.log('createConnector context setup 2')
        if (automaticConnector) {
          console.log('createConnector context setup 2.5')
          return
        }
        console.log('createConnector context setup 3')
        await connect()
      }
    },
    [customNetwork, automaticConnector, connect, connecting],
  )

  return {
    createConnector,
    connecting,
    connectorState: [connector, setConnector],
  }
}
