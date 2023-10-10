import { useTranslation } from 'next-i18next'

import type { GetTextButtonLabelParams } from './getAutomationTextButtonLabel.types'

export function getAutomationTextButtonLabel({
  isAddForm,
  isAwaitingConfirmation,
}: GetTextButtonLabelParams): string {
  const { t } = useTranslation()

  if (isAwaitingConfirmation) return t('protection.edit-order')

  return isAddForm ? t('system.remove-trigger') : t('system.add-trigger')
}
