import { Icon } from '@makerdao/dai-ui-icons'
import { TextWithCheckmark } from 'components/TextWithCheckmark'
import { ManageMultiplyVaultState } from 'features/manageMultiplyVault/manageMultiplyVault'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Grid } from 'theme-ui'

export function DefaultManageMultiplyVaultBorrowTransition({ stage }: ManageMultiplyVaultState) {
  const { t } = useTranslation()
  return stage === 'borrowTransitionEditing' ? (
    <Grid mt={-3}>
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
