import { useAccountContext } from 'components/context/AccountContextProvider'
import { useMainContext } from 'components/context/MainContextProvider'
import { useObservable } from 'helpers/observableHook'

interface AccountState {
  contextIsLoaded: boolean
  amountOfPositions?: number
  isConnected: boolean
  walletAddress?: string
  chainId?: number
}

export function useAccount(): AccountState {
  const { context$ } = useMainContext()
  const [context] = useObservable(context$)
  const { accountData$ } = useAccountContext()
  const [accountData] = useObservable(accountData$)

  return {
    contextIsLoaded: context !== undefined,
    amountOfPositions: accountData?.amountOfPositions,
    isConnected: context?.status === 'connected',
    walletAddress: context?.account,
    chainId: context?.chainId,
  }
}
