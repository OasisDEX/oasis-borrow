import { SidebarFlow, SidebarVaultStages } from 'features/types/vaults/sidebarLabels'
import { useTranslation } from 'next-i18next'

interface GetTextButtonLabelParams {
  flow: SidebarFlow
  stage: SidebarVaultStages
  token: string
}

export function getTextButtonLabel({ flow, stage, token }: GetTextButtonLabelParams): string {
  const { t } = useTranslation()

  switch (stage) {
    case 'editing':
      if (flow === 'openBorrow') return t('system.actions.borrow.switch-to-multiply')
      else if (flow === 'openMultiply') return t('system.actions.multiply.switch-to-borrow')
      else return t('edit-vault-details')
    case 'allowanceFailure':
    case 'collateralAllowanceFailure':
      return t('edit-token-allowance', { token })
    case 'daiAllowanceFailure':
      return t('edit-token-allowance', { token: 'DAI' })
    default:
      return t('edit-vault-details')
  }
}
