import { ListWithIcon } from 'components/ListWithIcon'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { checkmark } from 'theme/icons'
import { Text } from 'theme-ui'

export function OmniBorrowFormContentSwitch() {
  const { t } = useTranslation()
  const {
    environment: { collateralToken },
  } = useOmniGeneralContext()

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('vault-form.header.multiply-transition', { token: collateralToken })}
      </Text>
      <ListWithIcon
        icon={checkmark}
        iconSize="14px"
        iconColor="primary100"
        items={[
          t('borrow-to-multiply.checkmark1', { token: collateralToken }),
          t('borrow-to-multiply.checkmark2'),
          t('borrow-to-multiply.checkmark3'),
          t('borrow-to-multiply.checkmark4'),
        ]}
        listStyle={{ mt: 2 }}
      />
      <Text as="p" variant="paragraph3" sx={{ color: 'primary100', fontWeight: 'semiBold' }}>
        {t('borrow-to-multiply.subheader2')}
      </Text>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('borrow-to-multiply.paragraph2')}
      </Text>
    </>
  )
}
