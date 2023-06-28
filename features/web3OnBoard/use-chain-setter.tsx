import { WalletState } from '@web3-onboard/core'
import { useConnectWallet, useSetChain } from '@web3-onboard/react'
import {
  getNetworksHexIdsByHexId,
  NetworkConfigHexId,
  networkSetByHexId,
  useCustomForkParameter,
  useCustomNetworkParameter,
} from 'blockchain/networks'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { useRouter } from 'next/router'
import { Dispatch, useCallback, useEffect, useReducer, useState } from 'react'

import { addCustomForkToTheWallet } from './injected-wallet-interactions'

export interface ChainSetterState {
  networkHexId: NetworkConfigHexId | undefined
  setNetworkHexId: Dispatch<NetworkConfigHexId | undefined>
  pageChainsId: NetworkConfigHexId[] | undefined
  dispatchPageChainId: Dispatch<NetworkConfigHexId | undefined>
}

export function useChainSetter(): ChainSetterState {
  const [{ wallet }] = useConnectWallet()
  const [customNetwork, setCustomNetwork] = useCustomNetworkParameter()
  const [networkHexId, setNetworkHexId] = useReducer(
    (_state: NetworkConfigHexId | undefined, action: NetworkConfigHexId | undefined) => {
      return action
    },
    customNetwork?.hexId,
  )

  const [, setChain] = useSetChain()
  const [customFork, setCustomFork] = useCustomForkParameter()

  const { reload, push, replace } = useRouter()
  const [routerAction, setRouterAction] = useState(false)

  const [pageChainsId, dispatchPageChainId] = useReducer(
    (state: NetworkConfigHexId[] | undefined, action: NetworkConfigHexId | undefined) => {
      if (state && action && !state.includes(action)) {
        throw new Error('Page chainId is already set')
      }

      const idsToSet = action ? getNetworksHexIdsByHexId(action) : []

      if (idsToSet.length === 0) {
        return state
      }

      return [...idsToSet]
    },
    undefined,
  )

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
              setCustomFork({
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
    if (wallet && networkHexId && !routerAction) {
      const walletNetwork = networkSetByHexId[wallet.chains[0].id]
      const currentNetwork = networkSetByHexId[networkHexId]
      if (walletNetwork.hexId !== networkHexId) {
        void addForkToWallet(wallet, networkHexId)
          .then(() => {
            return setChain({ chainId: networkHexId })
          })
          .then((chainAdded) => {
            if (chainAdded) {
              setCustomNetwork({
                hexId: currentNetwork.hexId,
                id: currentNetwork.id,
                network: currentNetwork.name,
              })
            }

            return chainAdded
          })
          .then(async (chainAdded) => {
            if (chainAdded) {
              setRouterAction(true)
              reload()
            }

            if (!chainAdded && (pageChainsId === undefined || pageChainsId.length === 0)) {
              setNetworkHexId(walletNetwork.hexId)
              setRouterAction(false)
            }

            if (!chainAdded) {
              setRouterAction(true)
              await replace(INTERNAL_LINKS.homepage).then(() => {
                reload()
              })
            }
          })
      }
    }
  }, [
    wallet,
    setChain,
    networkHexId,
    addForkToWallet,
    reload,
    push,
    customFork,
    setCustomNetwork,
    routerAction,
    pageChainsId,
  ])

  useEffect(() => {
    if (wallet) {
      void addForkToWallet(wallet, wallet.chains[0].id as NetworkConfigHexId)
    }
  }, [addForkToWallet, wallet])

  return {
    networkHexId,
    setNetworkHexId,
    pageChainsId,
    dispatchPageChainId,
  }
}
