import { useConnectWallet, useSetChain } from '@web3-onboard/react'
import {
  NetworkConfigHexId,
  networkSetByHexId,
  useCustomForkParameter,
  useCustomNetworkParameter,
} from 'blockchain/networks'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { BridgeConnector } from './BridgeConnector'
import { addCustomForkToTheWallet } from './injected-wallet-interactions'

export interface BridgeConnectorState {
  createConnector: (networkId?: NetworkConfigHexId) => Promise<void>
  connecting: boolean
  connectorState: [BridgeConnector | undefined, React.Dispatch<BridgeConnector | undefined>]
}

export function useBridgeConnector(): BridgeConnectorState {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()
  const [{ chains }, setChain] = useSetChain()
  const [connector, setConnector] = useState<BridgeConnector | undefined>(undefined)
  const [networkHexId, setNetworkHexId] = useState<NetworkConfigHexId | undefined>(undefined)
  const [, setCustomNetwork] = useCustomNetworkParameter()
  const [customFork, setCustomFrok] = useCustomForkParameter()

  useEffect(() => {
    if (wallet && networkHexId && wallet.chains[0].id !== networkHexId) {
      void setChain({ chainId: networkHexId })
    }
  }, [wallet, setChain, networkHexId])

  useEffect(() => {
    if (wallet) {
      const networkConfig = networkSetByHexId[wallet.chains[0].id]
      if (networkConfig.isCustomFork && wallet.label === 'MetaMask') {
        const parentConfig = networkConfig.getParentNetwork()
        if (parentConfig) {
          const forkConfig = customFork[parentConfig.name]
          if (forkConfig && !forkConfig.isAddedToWallet) {
            void addCustomForkToTheWallet(networkConfig).then(() => {
              setCustomFrok({
                ...customFork,
                [parentConfig.name]: {
                  ...forkConfig,
                  isAddedToWallet: true,
                },
              })
            })
          }
        }
      }
    }
  }, [wallet])

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
    async (networkId?: NetworkConfigHexId) => {
      if (!connecting) {
        setNetworkHexId(networkId)
        if (automaticConnector) {
          return
        }
        await connect()
      }
    },
    [automaticConnector, connect, connecting],
  )

  return {
    createConnector,
    connecting,
    connectorState: [connector, setConnector],
  }
}
