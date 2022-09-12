import { useTranslation } from 'next-i18next'

interface GetTextButtonLabelParams {
  isAddForm: boolean
}

export function getAutomationTextButtonLabel({ isAddForm }: GetTextButtonLabelParams): string {
  const { t } = useTranslation()

  return isAddForm ? t('system.remove-trigger') : t('system.add-trigger')
}
