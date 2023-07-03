import { useConnectWallet, useSetChain } from '@web3-onboard/react'
import { useCallback, useMemo } from 'react'

import { BridgeConnector } from './bridge-connector'

export interface BridgeConnectorState {
  createConnector: () => Promise<void>
  connecting: boolean
  connector: BridgeConnector | undefined
}

export function useBridgeConnector(): BridgeConnectorState {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()
  const [{ chains, connectedChain }] = useSetChain()

  const connector = useMemo(() => {
    if (wallet && connectedChain && connectedChain.id === wallet.chains[0].id) {
      return new BridgeConnector(wallet, chains, disconnect)
    }
    return undefined
  }, [wallet, chains, disconnect, connectedChain])

  const createConnector = useCallback(async () => {
    if (!connecting) {
      if (connector) {
        return
      }
      await connect()
    }
  }, [connect, connecting, connector])

  return {
    createConnector,
    connecting,
    connector,
  }
}
