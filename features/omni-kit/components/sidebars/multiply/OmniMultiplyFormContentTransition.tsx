import { Icon } from 'components/Icon'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from 'theme-ui'
import { borrow_transition } from 'theme/icons'

export function OmniMultiplyFormContentTransition() {
  const { t } = useTranslation()

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('multiply-to-borrow.title2')}
      </Text>
      <Icon icon={borrow_transition} size="auto" sx={{ fill: 'none' }} />
    </>
  )
}
