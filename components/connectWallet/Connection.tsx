import { useWeb3OnBoardConnection } from 'features/web3OnBoard'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { WithChildren } from 'helpers/types'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'

export function Connection({ children, walletConnect }: WithChildren & { walletConnect: boolean }) {
  const { executeConnection, connected, connecting, autoConnect } = useWeb3OnBoardConnection({
    walletConnect,
  })
  const { replace, reload } = useRouter()
  const [connectionExecuted, setConnectionExecuted] = useState<boolean>(false)
  const handleConnected = useCallback(
    async (account?: string) => {
      if (!account && walletConnect) {
        // if the connection is required and the user closes the connection window
        // redirect him to the homepage and reload (cause there might be old wallet
        // connection stored in memory)
        await replace(INTERNAL_LINKS.homepage)
        reload()
      }
    },
    [replace, reload, walletConnect],
  )

  useEffect(() => {
    if (!connected && !connecting) {
      void executeConnection(handleConnected)
      if (walletConnect) {
        setConnectionExecuted(true)
      }
    }
  }, [connected, executeConnection, connecting, handleConnected, walletConnect])

  useEffect(() => {
    if (!connecting && !walletConnect && !connectionExecuted) {
      void autoConnect()
    }
  }, [connecting, walletConnect, autoConnect, connectionExecuted])

  return children
}
