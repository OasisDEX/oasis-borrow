import { WalletState } from '@web3-onboard/core'
import { useConnectWallet, useSetChain } from '@web3-onboard/react'
import { useAppContext } from 'components/AppContextProvider'
import { Web3ContextConnectedReadonly } from 'features/web3Context'
import { useCustomNetworkParameter } from 'helpers/getCustomNetworkParameter'
import { useObservable } from 'helpers/observableHook'
import { useCallback, useEffect, useMemo } from 'react'

import { BridgeConnector } from './BridgeConnector'

export function useBridgeConnector(): () => Promise<BridgeConnector | undefined> {
  const [{ wallet }, connect, disconnect] = useConnectWallet()
  const [{ chains }, setChain] = useSetChain()
  const [customNetwork] = useCustomNetworkParameter()
  const { web3Context$ } = useAppContext()
  const [web3Context] = useObservable(web3Context$)
  const web3NotConnected = useMemo(() => {
    return (
      web3Context?.status === 'error' ||
      web3Context?.status === 'notConnected' ||
      web3Context?.status === 'connectedReadonly'
    )
  }, [web3Context?.status])

  const reconnect = useCallback(
    async (wallet: WalletState) => {
      await disconnect(wallet)
      return await connect({ autoSelect: { label: wallet.label, disableModals: true } })
    },
    [disconnect, connect],
  )

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
      return new BridgeConnector(wallet, chains)
    },
    [chains],
  )

  useEffect(() => {
    async function autoConnect() {
      if (web3NotConnected && wallet?.accounts.length && chains.length) {
        const bridgeConnector = new BridgeConnector(wallet, chains)
        await (web3Context as Web3ContextConnectedReadonly).connect(
          bridgeConnector!,
          bridgeConnector!.connectionKind,
        )
      }
    }
    void autoConnect()
  }, [wallet, web3NotConnected, web3Context, chains])

  return useCallback(async () => {
    const wallet = await connect()
    if (wallet.length === 0) return
    const walletWithCorrectNetwork = await changeNetwork(wallet[0])
    return bridgeConnector(walletWithCorrectNetwork)
  }, [connect, changeNetwork, bridgeConnector])
}
