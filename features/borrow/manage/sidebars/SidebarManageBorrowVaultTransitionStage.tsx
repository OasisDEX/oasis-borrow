import { Icon } from '@makerdao/dai-ui-icons'
import { ListWithIcon } from 'components/ListWithIcon'
import { ManageBorrowVaultStage } from 'features/borrow/manage/pipes/manageVault'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Text } from 'theme-ui'

export function SidebarManageBorrowVaultTransitionStage({
  stage,
  token,
}: {
  stage: ManageBorrowVaultStage
  token: string
}) {
  const { t } = useTranslation()

  return (
    <Grid gap={3}>
      {stage === 'multiplyTransitionEditing' ? (
        <>
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            {t('vault-form.header.multiply-transition', { token })}
          </Text>
          <ListWithIcon
            icon="checkmark"
            iconSize="14px"
            iconColor="primary100"
            items={[
              t('borrow-to-multiply.checkmark1', { token }),
              t('borrow-to-multiply.checkmark2'),
              t('borrow-to-multiply.checkmark3'),
              t('borrow-to-multiply.checkmark4'),
            ]}
            listStyle={{ my: 2 }}
          />
          <Text as="p" variant="paragraph3" sx={{ color: 'primary100', fontWeight: 'semiBold' }}>
            {t('borrow-to-multiply.subheader2')}
          </Text>
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            {t('borrow-to-multiply.paragraph2')}
          </Text>
        </>
      ) : (
        <>
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            {t('vault-form.header.go-to-multiply')}
          </Text>
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            {t('vault-form.subtext.confirm')}
          </Text>
          <Icon name="multiply_transition" size="auto" />
        </>
      )}
    </Grid>
  )
}
