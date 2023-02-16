import { useAppContext } from 'components/AppContextProvider'
import { useObservable } from 'helpers/observableHook'

export function useChainId(): number | undefined {
  const { context$ } = useAppContext()
  const [context] = useObservable(context$)

  return context?.chainId
}
