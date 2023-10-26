import { Icon } from 'components/Icon'
import { TextWithCheckmark } from 'components/TextWithCheckmark'
import type { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/ManageMultiplyVaultState.types'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Grid } from 'theme-ui'
import { borrow_transition } from 'theme/icons'

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
      <Icon icon={borrow_transition} size="auto" sx={{ fill: 'none' }} />
    </Box>
  )
}
