import { ManageVaultCollateralAllowance } from 'components/vault/commonMultiply/ManageVaultCollateralAllowance'
import { ManageVaultDaiAllowance } from 'components/vault/commonMultiply/ManageVaultDaiAllowance'
import { VaultAllowance } from 'components/vault/VaultAllowance'
import { CommonVaultState } from 'helpers/types'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Text } from 'theme-ui'

export function SidebarVaultAllowanceStage(props: CommonVaultState) {
  const { t } = useTranslation()
  const { stage } = props

  return (
    <Grid gap={3}>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('vault-form.subtext.allowance')}
      </Text>
      {stage === 'collateralAllowanceWaitingForConfirmation' && (
        <ManageVaultCollateralAllowance {...props} />
      )}
      {stage === 'daiAllowanceWaitingForConfirmation' && <ManageVaultDaiAllowance {...props} />}
      {stage === 'allowanceWaitingForConfirmation' && <VaultAllowance {...props} />}
    </Grid>
  )
}
