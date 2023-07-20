import { ConnectedChain, WalletState } from '@web3-onboard/core'
import { useConnectWallet, useSetChain } from '@web3-onboard/react'
import { NetworkConfigHexId, networkSetByHexId, useCustomForkParameter } from 'blockchain/networks'
import { useCallback } from 'react'

import { addCustomForkToTheWallet } from './injected-wallet-interactions'

export interface ChainSetter {
  setChain: (
    chainId: NetworkConfigHexId,
    onSuccess: () => void,
    onReject: () => void,
  ) => Promise<void>
  connectedChain: ConnectedChain | null
}

export function useChainSetter(): ChainSetter {
  const [{ wallet }] = useConnectWallet()
  const [{ connectedChain }, setChain] = useSetChain()
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

  const setChainProxy = useCallback(
    async (networkHexId: NetworkConfigHexId, onSuccess: () => void, onReject: () => void) => {
      if (!wallet) {
        return
      }

      await addForkToWallet(wallet, networkHexId)
      const setChainResult = await setChain({ chainId: networkHexId })
      if (setChainResult) {
        onSuccess()
      } else {
        onReject()
      }
    },
    [addForkToWallet, setChain, wallet],
  )

  return {
    setChain: setChainProxy,
    connectedChain,
  }
}
