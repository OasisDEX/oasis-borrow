import { WalletState } from '@web3-onboard/core'
import { useConnectWallet, useSetChain } from '@web3-onboard/react'
import {
  NetworkConfigHexId,
  networkSetByHexId,
  shouldSetRequestedNetworkHexId,
  useCustomForkParameter,
  useCustomNetworkParameter,
} from 'blockchain/networks'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { BridgeConnector } from './BridgeConnector'
import { addCustomForkToTheWallet } from './injected-wallet-interactions'

export interface BridgeConnectorState {
  createConnector: (networkId?: NetworkConfigHexId, forced?: boolean) => Promise<void>
  connecting: boolean
  connectorState: [BridgeConnector | undefined, React.Dispatch<BridgeConnector | undefined>]
}

export function useBridgeConnector(): BridgeConnectorState {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()
  const [{ chains }, setChain] = useSetChain()
  const [connector, setConnector] = useState<BridgeConnector | undefined>(undefined)
  const [customNetwork, setCustomNetwork] = useCustomNetworkParameter()
  const [networkHexId, setNetworkHexId] = useState<NetworkConfigHexId>(customNetwork.hexId)

  const [customFork, setCustomFrok] = useCustomForkParameter()
  const { reload } = useRouter()

  const addForkToWallet = useCallback(
    async (wallet: WalletState, networkHexId: NetworkConfigHexId) => {
      const networkConfig = networkSetByHexId[networkHexId]
      if (!networkConfig) {
        return
      }
      if (networkConfig.isCustomFork && wallet.label === 'MetaMask') {
        const parentConfig = networkConfig.getParentNetwork()
        if (parentConfig) {
          const forkConfig = customFork[parentConfig.name]
          if (forkConfig && !forkConfig.isAddedToWallet) {
            await addCustomForkToTheWallet(networkConfig).then(() => {
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
    },
    [customFork],
  )

  useEffect(() => {
    if (wallet && networkHexId && wallet.chains[0].id !== networkHexId) {
      void addForkToWallet(wallet, networkHexId)
        .then(() => {
          return setChain({ chainId: networkHexId })
        })
        .then((chainAdded) => {
          if (chainAdded) {
            const currentNetwork = networkSetByHexId[networkHexId]
            setCustomNetwork({
              hexId: currentNetwork.hexId,
              id: currentNetwork.id,
              network: currentNetwork.name,
            })
          }

          return chainAdded
        })
        .then((value) => {
          if (value) {
            return reload()
          }
        })
    }
  }, [wallet, setChain, networkHexId, addForkToWallet, reload, customFork, setCustomNetwork])

  useEffect(() => {
    if (wallet) {
      void addForkToWallet(wallet, wallet.chains[0].id as NetworkConfigHexId)
    }
  }, [addForkToWallet, wallet])

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
    async (networkId?: NetworkConfigHexId, forced: boolean = false) => {
      if (!connecting) {
        if (networkId && shouldSetRequestedNetworkHexId(customNetwork.hexId, networkId)) {
          console.log(
            `Network change to ${networkId} because shouldSetRequestedNetworkHexId. Current network is ${customNetwork.hexId}`,
          )
          setNetworkHexId(networkId)
        }
        if (networkId && forced) {
          console.log(
            `Forced network change to ${networkId}. Current network is ${customNetwork.hexId}`,
          )
          setNetworkHexId(networkId)
        }
        if (automaticConnector) {
          return
        }
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
