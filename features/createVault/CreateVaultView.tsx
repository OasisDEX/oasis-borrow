import { useAppContext } from 'components/AppContextProvider'
import { useObservable } from 'helpers/observableHook'
import { ModalProps } from 'helpers/modalHook'
import { ModalBackIcon, ModalBottom, ModalButton, ModalErrorMessage } from 'components/Modal'

export function CreateVaultView({ ilk }: ModalProps) {
  const { vaultCreation$ } = useAppContext()
  const vaultCreation = useObservable(vaultCreation$(ilk))

  return <ModalBottom {...{ close: () => null }}>swxw</ModalBottom>
}
