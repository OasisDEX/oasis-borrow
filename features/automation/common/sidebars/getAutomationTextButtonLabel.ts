import { useTranslation } from 'next-i18next'

interface GetTextButtonLabelParams {
  isAddForm: boolean
  isAwaitingConfirmation?: boolean
}

export function getAutomationTextButtonLabel({
  isAddForm,
  isAwaitingConfirmation,
}: GetTextButtonLabelParams): string {
  const { t } = useTranslation()

  if (isAwaitingConfirmation) return t('protection.edit-order')

  return isAddForm ? t('system.remove-trigger') : t('system.add-trigger')
}
