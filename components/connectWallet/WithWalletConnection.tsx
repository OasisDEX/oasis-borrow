import { useWeb3OnBoardConnection } from 'features/web3OnBoard'
import { WithChildren } from 'helpers/types'
import { useEffect } from 'react'

export function WithWalletConnection({ children }: WithChildren) {
  const { executeConnection, connected, connecting } = useWeb3OnBoardConnection({
    walletConnect: true,
  })

  useEffect(() => {
    if (!connected && !connecting) void executeConnection()
  }, [connecting, connected, executeConnection])

  return children
}
