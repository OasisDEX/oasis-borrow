import { SidebarAllowanceData } from 'helpers/extractSidebarHelpers'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Text } from 'theme-ui'

import { VaultAllowance } from '../VaultAllowance'

export function SidebarOpenVaultAllowanceStage(props: SidebarAllowanceData) {
  const { t } = useTranslation()
  const { stage } = props

  return (
    <Grid gap={3}>
      <Text as="p" variant="paragraph3" sx={{ color: 'text.subtitle' }}>
        {t('vault-form.subtext.allowance')}
      </Text>
      {stage === 'allowanceWaitingForConfirmation' && <VaultAllowance {...props} />}
    </Grid>
  )
}
