import { Icon } from '@makerdao/dai-ui-icons'
import { TextWithCheckmark } from 'components/TextWithCheckmark'
import { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Grid } from 'theme-ui'

export function ManageMultiplyVaultBorrowTransition({ stage }: ManageMultiplyVaultState) {
  const { t } = useTranslation()
  return stage === 'borrowTransitionEditing' ? (
    <Grid mt={-3} mb={3}>
      <Grid variant="text.paragraph3" sx={{ color: 'neutral80' }}>
        <TextWithCheckmark>{t('multiply-to-borrow.checkmark1')}</TextWithCheckmark>
        <TextWithCheckmark>{t('multiply-to-borrow.checkmark2')}</TextWithCheckmark>
        <TextWithCheckmark>{t('multiply-to-borrow.checkmark3')}</TextWithCheckmark>
      </Grid>
    </Grid>
  ) : (
    <Box>
      <Icon name="borrow_transition" size="auto" sx={{ fill: 'none' }} />
    </Box>
  )
}
