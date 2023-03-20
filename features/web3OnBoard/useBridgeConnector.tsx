import { WalletState } from '@web3-onboard/core'
import { useConnectWallet, useSetChain } from '@web3-onboard/react'
import { useCustomNetworkParameter } from 'helpers/getCustomNetworkParameter'
import { useCallback } from 'react'

import { BridgeConnector } from './BridgeConnector'

export function useBridgeConnector(): () => Promise<BridgeConnector | undefined> {
  const [, connect, disconnect] = useConnectWallet()
  const [{ chains }, setChain] = useSetChain()
  const networkFromUrl = useCustomNetworkParameter()

  const reconnect = useCallback(
    async (wallet: WalletState) => {
      await disconnect(wallet)
      return await connect({ autoSelect: { label: wallet.label, disableModals: true } })
    },
    [disconnect, connect],
  )

  const changeNetwork = useCallback(
    async (wallet: WalletState) => {
      const forcedChain = chains.find((chain) => chain.id === networkFromUrl.hexId)
      if (forcedChain && wallet.chains[0].id !== forcedChain.id) {
        await setChain({ chainId: forcedChain.id })
        const result = await reconnect(wallet)
        return result[0]
      }
      return wallet
    },
    [networkFromUrl, chains, setChain, reconnect],
  )

  const bridgeConnector = useCallback(
    (wallet: WalletState) => {
      return new BridgeConnector(wallet, chains)
    },
    [chains],
  )

  return useCallback(async () => {
    const wallet = await connect()
    const walletWithCorrectNetwork = await changeNetwork(wallet[0])
    return bridgeConnector(walletWithCorrectNetwork)
  }, [connect, changeNetwork, bridgeConnector])
}
