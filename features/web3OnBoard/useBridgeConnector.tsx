import { WalletState } from '@web3-onboard/core'
import { useConnectWallet, useSetChain } from '@web3-onboard/react'
import { networksListWithForksByHexId, useCustomNetworkParameter } from 'blockchain/networks'
import { useCallback, useEffect, useMemo } from 'react'

import { BridgeConnector } from './BridgeConnector'
import { addCustomForkToTheWallet } from './injected-wallet-interactions'

export function useBridgeConnector(): [
  BridgeConnector | undefined,
  () => Promise<BridgeConnector | undefined>,
] {
  const [{ wallet }, connect, disconnect] = useConnectWallet()
  const [{ chains }, setChain] = useSetChain()
  const [customNetwork] = useCustomNetworkParameter()

  const reconnect = useCallback(
    async (wallet: WalletState) => {
      await disconnect(wallet)
      return await connect({ autoSelect: { label: wallet.label, disableModals: true } })
    },
    [disconnect, connect],
  )

  useEffect(() => {
    if (wallet) {
      const connectedChain = wallet.chains[0]
      const network = networksListWithForksByHexId[connectedChain.id]
      if (network.isCustomFork) {
        // that means we are connected to a fork
        // we need to try to add a current fork to the metaMask
        void addCustomForkToTheWallet(network).then(() => {
          console.log('Fork added to the wallet')
        })
      }
    }
  }, [wallet])

  const changeNetwork = useCallback(
    async (wallet: WalletState) => {
      const forcedChain = chains.find((chain) => chain.id === customNetwork.hexId)
      console.log(`Forcing chain to be: ${JSON.stringify(forcedChain, null, 2)}`)
      if (forcedChain && wallet && wallet.chains[0].id !== forcedChain.id) {
        await setChain({ chainId: forcedChain.id })
        const result = await reconnect(wallet)
        return result[0]
      }
      return wallet
    },
    [customNetwork, chains, setChain, reconnect],
  )

  const bridgeConnector = useCallback(
    (wallet: WalletState) => {
      return new BridgeConnector(wallet, chains, disconnect)
    },
    [chains, disconnect],
  )

  const automaticConnector = useMemo(() => {
    if (wallet) {
      return new BridgeConnector(wallet, chains, disconnect)
    }
    return undefined
  }, [wallet, chains, disconnect])

  const connectCallback = useCallback(async () => {
    if (automaticConnector) {
      return automaticConnector
    }
    const _wallet = await connect()
    if (_wallet.length === 0) return
    const walletWithCorrectNetwork = await changeNetwork(_wallet[0])
    return bridgeConnector(walletWithCorrectNetwork)
  }, [automaticConnector, connect, changeNetwork, bridgeConnector])

  return [automaticConnector, connectCallback]
}
