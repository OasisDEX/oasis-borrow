import { useAppContext } from 'components/AppContextProvider'
import { useObservable } from 'helpers/observableHook'
import { ModalProps } from 'helpers/modalHook'
import { ModalBackIcon, ModalBottom, ModalButton, ModalErrorMessage } from 'components/Modal'

export function OpenVaultView({ ilk, close }: ModalProps) {
  const { openVault$ } = useAppContext()

  const openVault = useObservable(openVault$(ilk))

  console.log(openVault)
  return <ModalBottom {...{ close }}>swxw</ModalBottom>
}
