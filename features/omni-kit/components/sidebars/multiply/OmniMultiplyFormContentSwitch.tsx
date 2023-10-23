import { ListWithIcon } from 'components/ListWithIcon'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from 'theme-ui'
import { checkmark } from 'theme/icons'

export function OmniMultiplyFormContentSwitch() {
  const { t } = useTranslation()

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('multiply-to-borrow.title1')}
      </Text>
      <ListWithIcon
        icon={checkmark}
        iconSize="14px"
        iconColor="primary100"
        items={[
          t('multiply-to-borrow.checkmark1'),
          t('multiply-to-borrow.checkmark2'),
          t('multiply-to-borrow.checkmark3'),
        ]}
        listStyle={{ mt: 2 }}
      />
    </>
  )
}
