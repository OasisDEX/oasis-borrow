import { useWeb3OnBoardConnection } from 'features/web3OnBoard'
import { WithChildren } from 'helpers/types'
import { useEffect } from 'react'

export function Connection({ children, walletConnect }: WithChildren & { walletConnect: boolean }) {
  const { executeConnection, connected, connecting } = useWeb3OnBoardConnection({
    walletConnect,
  })

  useEffect(() => {
    if (!connected && !connecting) void executeConnection()
  }, [connected, executeConnection, connecting])

  return children
}
