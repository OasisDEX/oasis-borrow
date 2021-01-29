import { useAppContext } from 'components/AppContextProvider'
import { useObservable } from 'helpers/observableHook'

export function CreateVaultView() {
  const { vaultCreation$ } = useAppContext()
  const vaultCreation = useObservable(vaultCreation$('ETH-A'))

  return null
}
