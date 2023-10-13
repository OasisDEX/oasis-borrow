import { Icon } from 'components/Icon'
import { ListWithIcon } from 'components/ListWithIcon'
import { VaultType } from 'features/generalManageVault/vaultType.types'
import type { ManageMultiplyVaultStage } from 'features/multiply/manage/pipes/ManageMultiplyVaultStage.types'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Text } from 'theme-ui'
import { borrow_transition, checkmark } from 'theme/icons'

export function SidebarManageMultiplyVaultTransitionStage({
  stage,
  vaultType,
  token,
}: {
  stage: ManageMultiplyVaultStage
  vaultType: VaultType
  token: string
}) {
  const { t } = useTranslation()

  if (vaultType === VaultType.Earn) {
    throw new Error('SidebarManageMultiplyVaultTransitionStage supports only Borrow and Multiply')
  }

  if (vaultType === VaultType.Borrow) {
    return (
      <Grid gap={3}>
        {stage === 'borrowTransitionEditing' ? (
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

  return (
    <Grid gap={3}>
      {stage === 'borrowTransitionEditing' ? (
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
      ) : (
        <>
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            {t('multiply-to-borrow.title2')}
          </Text>
          <Icon icon={borrow_transition} size="auto" sx={{ fill: 'none' }} />
        </>
      )}
    </Grid>
  )
}
