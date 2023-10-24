import { NetworkHexIds } from 'blockchain/networks'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { usePrevious } from 'react-use'

import { useLegacyDefaultChain } from './use-legacy-default-chain'
import type { WalletManagementState } from './wallet-state'

/*
 * I don't like this solution,
 * but it's the only way I found to make it work.
 * The problem is that some components strictly depend on Mainnet or Goerli,
 * so the only way to refresh them is to reload the page.
 */
export function useSafetyReload({ walletNetworkHexId }: WalletManagementState) {
  const previuosWalletNetworkHexId = usePrevious(walletNetworkHexId)
  const { reload } = useRouter()
  const [, setNetwork] = useLegacyDefaultChain()

  useEffect(() => {
    const shouldReload =
      (walletNetworkHexId === NetworkHexIds.MAINNET &&
        previuosWalletNetworkHexId === NetworkHexIds.GOERLI) ||
      (walletNetworkHexId === NetworkHexIds.GOERLI &&
        previuosWalletNetworkHexId === NetworkHexIds.MAINNET)

    if (shouldReload) {
      setNetwork(Number.parseInt(walletNetworkHexId, 16))
      reload()
    }
  }, [reload, previuosWalletNetworkHexId, walletNetworkHexId, setNetwork])
}
