import { useAppContext } from 'components/AppContextProvider'
import { useObservable } from 'helpers/observableHook'
import { useEffect } from 'react'

interface AccountState {
  contextIsLoaded: boolean
  amountOfPositions?: number
  isConnected: boolean
  walletAddress?: string
  chainId?: number
}

export function useAccount(): AccountState {
  const { accountData$, context$ } = useAppContext()
  const [context] = useObservable(context$)
  const [accountData] = useObservable(accountData$)

  useEffect(() => {
    console.log(`Curernt status of Context: ${context?.status}`)
  }, [context])

  return {
    contextIsLoaded: context !== undefined,
    amountOfPositions: accountData?.numberOfVaults,
    isConnected: context?.status === 'connected',
    walletAddress: context?.account,
    chainId: context?.chainId,
  }
}
