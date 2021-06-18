import { BigNumber } from 'bignumber.js'
import { useModal } from 'helpers/modalHook'
import { useRedirect } from 'helpers/useRedirect'

import { SelectVaultTypeModal } from './SelectVaultTypeModal'

export const ALLOWED_MULTIPLY_TOKENS = ['ETH']

export function useRedirectToOpenVault() {
  const openModal = useModal()
  const { push } = useRedirect()

  return (ilk: string, token: string) => {
    if (ALLOWED_MULTIPLY_TOKENS.includes(token)) {
      return openModal(SelectVaultTypeModal, {
        ilk: ilk,
        token: token,
        balance: new BigNumber(1),
      })
    }

    push(`/vaults/open/${ilk}`)
  }
}
