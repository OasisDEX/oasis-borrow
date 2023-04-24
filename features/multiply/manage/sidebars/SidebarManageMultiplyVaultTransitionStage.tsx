import { Icon } from '@makerdao/dai-ui-icons'
import { ListWithIcon } from 'components/ListWithIcon'
import { ManageMultiplyVaultStage } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Text } from 'theme-ui'

export function SidebarManageMultiplyVaultTransitionStage({
  stage,
}: {
  stage: ManageMultiplyVaultStage
}) {
  const { t } = useTranslation()

  return (
    <Grid gap={3}>
      {stage === 'borrowTransitionEditing' ? (
        <>
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            {t('multiply-to-borrow.title1')}
          </Text>
          <ListWithIcon
            icon="checkmark"
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
          <Icon name="borrow_transition" size="auto" sx={{ fill: 'none' }} />
        </>
      )}
    </Grid>
  )
}
