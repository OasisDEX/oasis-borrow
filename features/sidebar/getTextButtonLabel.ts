import { OtherAction } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { SidebarFlow, SidebarVaultStages } from 'features/types/vaults/sidebarLabels'
import { useTranslation } from 'next-i18next'

interface GetTextButtonLabelParams {
  flow: SidebarFlow
  stage: SidebarVaultStages
  otherAction?: OtherAction
  token: string
}

export function getTextButtonLabel({
  flow,
  stage,
  otherAction,
  token,
}: GetTextButtonLabelParams): string {
  const { t } = useTranslation()
  const allowanceToken = flow === 'openGuni' ? 'DAI' : token?.toUpperCase()

  switch (stage) {
    case 'editing':
      if (flow === 'openBorrow') return t('system.actions.borrow.switch-to-multiply')
      else if (flow === 'openMultiply') return t('system.actions.multiply.switch-to-borrow')
      else return t('edit-vault-details')
    case 'allowanceFailure':
    case 'collateralAllowanceFailure':
      return t('edit-token-allowance', { token: allowanceToken })
    case 'daiAllowanceFailure':
      return t('edit-token-allowance', { token: 'DAI' })
    default:
      if (otherAction === 'closeVault') return t('not-right-now')
      else return t('edit-vault-details')
  }
}
