import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Text } from 'theme-ui'

export function AjnaBorrowFormContentConfirm() {
  const { t } = useTranslation()

  return (
    <Grid gap={3}>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('ajna.borrow.open.form.confirm')}
      </Text>
    </Grid>
  )
}
