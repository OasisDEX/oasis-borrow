import { NetworkConfigHexId } from 'blockchain/networks'
import { useConnection } from 'features/web3OnBoard'
import { WithChildren } from 'helpers/types'

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
  useConnection({
    initialConnect: walletConnect,
    chainId,
    pageChainId,
  })

  return children
}
