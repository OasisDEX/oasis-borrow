import type { WalletState } from '@web3-onboard/core'
import { useConnectWallet, useSetChain } from '@web3-onboard/react'
import type { NetworkConfigHexId } from 'blockchain/networks'
import { isNetworkHexIdSupported } from 'blockchain/networks'
import { useCallback, useMemo } from 'react'

import { BridgeConnector } from './bridge-connector'

export interface BridgeConnectorState {
  createConnector: () => Promise<boolean>
  connecting: boolean
  connector: BridgeConnector | undefined
  wallet: WalletState | null
  disconnect: () => Promise<void>
}

export function useBridgeConnector(): BridgeConnectorState {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()
  const [{ chains, connectedChain }] = useSetChain()

  const connector = useMemo(() => {
    if (
      wallet &&
      connectedChain &&
      isNetworkHexIdSupported(connectedChain.id as NetworkConfigHexId)
    ) {
      return new BridgeConnector(wallet, chains, disconnect)
    }
    return undefined
  }, [wallet, chains, disconnect, connectedChain])

  const createConnector = useCallback(async () => {
    if (connector || connecting || wallet) {
      return true
    }
    const currentWallet = await connect()
    const isWalletConnected = currentWallet && currentWallet.length > 0
    return isWalletConnected
  }, [wallet, connect, connecting, connector])

  const disconnectProxy = useCallback(async () => {
    if (wallet) {
      await disconnect({ label: wallet.label })
    }
  }, [wallet, disconnect])

  return {
    createConnector,
    connecting,
    connector,
    wallet,
    disconnect: disconnectProxy,
  }
}
