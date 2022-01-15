import React from 'react'
import { Box, Grid, Text } from 'theme-ui'
import { useTranslation } from 'next-i18next'
import { Icon } from '@makerdao/dai-ui-icons'

import { ManageMultiplyVaultState } from 'features/manageMultiplyVault/manageMultiplyVault'
import { TextWithCheckmark } from 'components/TextWithCheckmark'

export function DefaultManageMultiplyVaultBorrowTransition({ stage }: ManageMultiplyVaultState) {
  const { t } = useTranslation()
  return stage === 'borrowTransitionEditing' ? (
    <Grid mt={-3}>
      <Text variant="paragraph2" sx={{ fontWeight: 'semiBold', mb: 1 }}>
        {t('multiply-to-borrow.title')}
      </Text>
      <Grid variant="text.paragraph3" sx={{ color: 'text.subtitle' }}>
        <TextWithCheckmark>{t('multiply-to-borrow.checkmark1')}</TextWithCheckmark>
        <TextWithCheckmark>{t('multiply-to-borrow.checkmark2')}</TextWithCheckmark>
        <TextWithCheckmark>{t('multiply-to-borrow.checkmark3')}</TextWithCheckmark>
      </Grid>
    </Grid>
  ) : (
    <Box>
      <Icon name="multiply_transition" size="auto" />
    </Box>
  )
}