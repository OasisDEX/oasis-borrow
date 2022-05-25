import { SidebarVaultStages } from 'features/types/vaults/sidebarLabels'
import { useTranslation } from 'next-i18next'

interface GetTextButtonLabelParams {
  stage: SidebarVaultStages
  token: string
}

export function getTextButtonLabel({ stage, token }: GetTextButtonLabelParams): string {
  const { t } = useTranslation()

  switch (stage) {
    case 'allowanceFailure':
    case 'collateralAllowanceFailure':
      return t('edit-token-allowance', { token })
    case 'daiAllowanceFailure':
      return t('edit-token-allowance', { token: 'DAI' })
    default:
      return t('edit-vault-details')
  }
}
