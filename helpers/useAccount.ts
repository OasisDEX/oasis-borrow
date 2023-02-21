import { useAppContext } from 'components/AppContextProvider'
import { useObservable } from 'helpers/observableHook'

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

  return {
    contextIsLoaded: context !== undefined,
    amountOfPositions: accountData?.numberOfVaults,
    isConnected: context?.status === 'connected',
    walletAddress: context?.account,
    chainId: context?.chainId,
  }
}
