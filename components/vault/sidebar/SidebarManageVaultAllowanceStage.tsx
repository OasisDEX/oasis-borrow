import { ManageVaultCollateralAllowance } from 'components/vault/commonMultiply/ManageVaultCollateralAllowance'
import { ManageVaultDaiAllowance } from 'components/vault/commonMultiply/ManageVaultDaiAllowance'
import { ManageStandardBorrowVaultState } from 'features/borrow/manage/pipes/manageVault'
import { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Text } from 'theme-ui'

export function SidebarManageVaultAllowanceStage(
  props: ManageStandardBorrowVaultState | ManageMultiplyVaultState,
) {
  const { t } = useTranslation()
  const { stage } = props

  return (
    <Grid gap={3}>
      <Text as="p" variant="paragraph3" sx={{ color: 'text.subtitle' }}>
        {t('vault-form.subtext.allowance')}
      </Text>
      {stage === 'collateralAllowanceWaitingForConfirmation' && (
        <ManageVaultCollateralAllowance {...props} />
      )}
      {stage === 'daiAllowanceWaitingForConfirmation' && <ManageVaultDaiAllowance {...props} />}
    </Grid>
  )
}
