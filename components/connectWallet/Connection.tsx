import type { NetworkConfigHexId } from 'blockchain/networks'
import { useConnection } from 'features/web3OnBoard/useConnection'
import React, { type PropsWithChildren, useEffect } from 'react'

export function Connection({
  children,
  walletConnect,
  chainId,
  pageChainId,
  includeTestNet,
}: PropsWithChildren<{
  walletConnect: boolean
  chainId?: NetworkConfigHexId
  pageChainId?: NetworkConfigHexId
  includeTestNet?: boolean
}>) {
  const { connect, setPageNetworks } = useConnection()

  useEffect(() => {}, [pageChainId, setPageNetworks])
  useEffect(() => {
    setPageNetworks(pageChainId ? [pageChainId] : undefined, includeTestNet)
    if (walletConnect) connect(chainId, includeTestNet)
  }, [walletConnect, chainId, connect, setPageNetworks, pageChainId, includeTestNet])

  return <>{children}</>
}
