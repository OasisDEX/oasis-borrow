import { useAppContext } from 'components/AppContextProvider'
import { useObservable } from 'helpers/observableHook'

interface AccountState {
  amountOfPositions?: number
  isConnected: boolean
  walletAddress?: string
}

export function useAccount(): AccountState {
  const { accountData$, context$ } = useAppContext()
  const [context] = useObservable(context$)
  const [accountData] = useObservable(accountData$)

  return {
    amountOfPositions: accountData?.numberOfVaults,
    isConnected: context?.status === 'connected',
    walletAddress: context?.account,
  }
}
