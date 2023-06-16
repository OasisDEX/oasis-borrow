import { NetworkConfigHexId } from 'blockchain/networks'
import { useConnection } from 'features/web3OnBoard'
import { WithChildren } from 'helpers/types'

export function Connection({
  children,
  walletConnect,
  chainId,
}: WithChildren & { walletConnect: boolean; chainId?: NetworkConfigHexId }) {
  useConnection({
    initialConnect: walletConnect,
    chainId,
  })

  return children
}
