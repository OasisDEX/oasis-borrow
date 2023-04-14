import { isAppContextAvailable } from 'components/AppContextProvider'
import { WithChildren } from 'helpers/types'
import React, { createContext, useContext } from 'react'

import { useBridgeConnection } from './useBridgeConnection'
import { useNetworkConnection } from './useNetworkConnection'

export type Web3OnBoardConnectorContext = {
  connect: (autoConnect?: boolean) => Promise<string | undefined>
  networkConnect: () => Promise<void>
}

const web3OnBoardConnectorContext = createContext<Web3OnBoardConnectorContext>({
  connect: () => Promise.resolve(undefined),
  networkConnect: () => Promise.resolve(),
})

export const useWeb3OnBoardConnectorContext = () => useContext(web3OnBoardConnectorContext)

function InternalProvider({ children }: WithChildren) {
  const { connect } = useBridgeConnection()
  const { networkConnect } = useNetworkConnection()

  return (
    <web3OnBoardConnectorContext.Provider
      value={{
        connect,
        networkConnect,
      }}
    >
      {children}
    </web3OnBoardConnectorContext.Provider>
  )
}

export function Web3OnBoardConnectorProvider({ children }: WithChildren) {
  if (!isAppContextAvailable()) {
    return children
  }

  return <InternalProvider>{children}</InternalProvider>
}
