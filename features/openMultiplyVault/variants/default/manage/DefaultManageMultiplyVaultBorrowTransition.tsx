import React from 'react'
import { Box, Divider, Grid, Text } from 'theme-ui'
import { useTranslation } from 'next-i18next'
import { Icon } from '@makerdao/dai-ui-icons'

import { ManageMultiplyVaultState } from 'features/manageMultiplyVault/manageMultiplyVault'
import { TextWithCheckmark } from 'components/TextWithCheckmark'

export function DefaultManageMultiplyVaultBorrowTransition({ stage, vault }: ManageMultiplyVaultState) {
  const { t } = useTranslation()
  return (stage === 'borrowTransitionEditing') || true ? (
    <Grid mt={-3}>
      <Grid variant="text.paragraph3" sx={{ color: 'text.subtitle' }}>
        <TextWithCheckmark>
          {t('vault-form.subtext.checkmark1', { token: vault.token.toUpperCase() })}
        </TextWithCheckmark>
        <TextWithCheckmark>{t('vault-form.subtext.checkmark2')}</TextWithCheckmark>
        <TextWithCheckmark>{t('vault-form.subtext.checkmark3')}</TextWithCheckmark>
        <TextWithCheckmark>{t('vault-form.subtext.checkmark4')}</TextWithCheckmark>
      </Grid>
      <Divider />
      <Grid gap={2}>
        <Text variant="paragraph2" sx={{ fontWeight: 'semiBold' }}>
          {t('vault-form.subtext.subheader2')}
        </Text>
        <Text variant="paragraph3" sx={{ color: 'text.subtitle' }}>
          {t('vault-form.subtext.paragraph2')}
        </Text>
      </Grid>
    </Grid>
  ) : (
    <Box>
      <Icon name="multiply_transition" size="auto" />
    </Box>
  )
}