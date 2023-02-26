import { useConnectWallet, useSetChain } from '@web3-onboard/react'
import { useCustomNetworkParameter } from 'helpers/getCustomNetworkParameter'
import { useAsyncEffect } from 'helpers/hooks/useAsyncEffect'
import { useMemo } from 'react'

import { BridgeConnector } from './BridgeConnector'

export function useBridgeConnector() {
  const [{ wallet, connecting }] = useConnectWallet()
  const [{ chains, connectedChain }, setChain] = useSetChain()
  const networkFromUrl = useCustomNetworkParameter()

  useAsyncEffect(
    async () => {
      if (!networkFromUrl) return
      if (!wallet) return
      const forcedChain = chains.find((chain) => chain.id === networkFromUrl.hexId)
      if (forcedChain && connectedChain?.id !== forcedChain.id) {
        await setChain({ chainId: forcedChain.id })
      }
    },
    () => Promise.resolve(),
    [wallet, chains, connectedChain, networkFromUrl, setChain],
  )

  const bridgeConnector: BridgeConnector | undefined = useMemo(() => {
    if (!wallet || connecting) return undefined
    return new BridgeConnector(wallet, chains)
  }, [chains, wallet, connecting])

  return bridgeConnector
}
