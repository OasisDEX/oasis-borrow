import { Icon } from '@makerdao/dai-ui-icons'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from 'theme-ui'

export function AjnaMultiplyFormContentTransition() {
  const { t } = useTranslation()

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('multiply-to-borrow.title2')}
      </Text>
      <Icon name="borrow_transition" size="auto" sx={{ fill: 'none' }} />
    </>
  )
}
