import { useAppContext } from 'components/AppContextProvider'
import { getCustomNetworkParameter } from 'helpers/getCustomNetworkParameter'
import { useObservable } from 'helpers/observableHook'
import { useRedirect } from 'helpers/useRedirect'

export function useAaveRedirect() {
  const { hasActiveAavePosition$ } = useAppContext()
  const router = useRedirect()
  const [aaveActivePosition = false] = useObservable(hasActiveAavePosition$)
  if (aaveActivePosition) {
    void router.replace(`/aave/${aaveActivePosition}`, getCustomNetworkParameter())
  }
}
