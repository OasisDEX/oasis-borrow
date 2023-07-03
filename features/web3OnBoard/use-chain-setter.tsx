import { WalletState } from '@web3-onboard/core'
import { useConnectWallet, useSetChain } from '@web3-onboard/react'
import { NetworkConfigHexId, networkSetByHexId, useCustomForkParameter } from 'blockchain/networks'
import { Dispatch, useCallback, useEffect } from 'react'

import { addCustomForkToTheWallet } from './injected-wallet-interactions'

export interface ChainSetterState {
  networkHexId: NetworkConfigHexId | undefined
  setNetworkHexId: Dispatch<NetworkConfigHexId | undefined>
  pageChainsId: NetworkConfigHexId[] | undefined
  dispatchPageChainId: Dispatch<NetworkConfigHexId | undefined>
}

export function useChainSetter(): ChainSetterState {
  const [{ wallet }] = useConnectWallet()
  const [, setChain] = useSetChain()
  const [customFork, setCustomFork] = useCustomForkParameter()

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
    if (wallet) {
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
            console.log(`Chain added: ${chainAdded}`)
            // if (chainAdded) {
            //   setRouterAction(true)
            //   reload()
            // }
            //
            // if (!chainAdded && (pageChainsId === undefined || pageChainsId.length === 0)) {
            //   setNetworkHexId(walletNetwork.hexId)
            //   setRouterAction(false)
            // }
            //
            // if (!chainAdded) {
            //   setRouterAction(true)
            //   await replace(INTERNAL_LINKS.homepage).then(() => {
            //     reload()
            //   })
            // }
          })
      }
    }
  }, [wallet, setChain, networkHexId, addForkToWallet, customFork, setCustomNetwork, pageChainsId])

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
