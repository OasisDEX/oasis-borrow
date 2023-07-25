import { NetworkConfigHexId } from 'blockchain/networks'
import { useConnection } from 'features/web3OnBoard'
import { WithChildren } from 'helpers/types'
import { useEffect } from 'react'

export function Connection({
  children,
  walletConnect,
  chainId,
  pageChainId,
}: WithChildren & {
  walletConnect: boolean
  chainId?: NetworkConfigHexId
  pageChainId?: NetworkConfigHexId
}) {
  const { connect, setPageNetworks } = useConnection()

  useEffect(() => {
    setPageNetworks(pageChainId ? [pageChainId] : undefined)
  }, [pageChainId, setPageNetworks])
  useEffect(() => {
    if (walletConnect) connect(chainId)
  }, [walletConnect, chainId, connect])

  return children
}
