import { WithVaultFormStepIndicator } from 'components/vault/VaultForm'
import React from 'react'
import { Box, Button, Grid } from 'theme-ui'

import { ManageMultiplyVaultState } from '../../../../manageMultiplyVault/manageMultiplyVault'
import { ManageVaultHeaderAllowance } from '../../../common/ManageVaultHeaderAllowance'
import { ManageMultiplyVaultEditingStage } from 'features/manageMultiplyVault/manageMultiplyVault'
import { useTranslation } from 'next-i18next'

function DefaultManageMultiplyVaultEditingController({
  stage,
  toggle,
  currentStep,
  totalSteps,
}: // accountIsController,
ManageMultiplyVaultState) {
  const { t } = useTranslation()
  const adjustPosition = `vaultEditingController${stage !== 'adjustPosition' ? 'Inactive' : ''}`
  const otherActions = `vaultEditingController${stage !== 'otherActions' ? 'Inactive' : ''}`
  const borrow = `vaultEditingController${stage !== 'borrowTransitionEditing' ? 'Inactive' : ''}`

  function handleToggle(stage: ManageMultiplyVaultEditingStage) {
    toggle!(stage)
    // TODO add analytics
    // if (stage === 'collateralEditing') {
    //   trackingEvents.switchToDai(accountIsController)
    // } else {
    //   trackingEvents.switchToCollateral(accountIsController)
    // }
  }

  return (
    <Box sx={{ justifyContent: 'center' }}>
      <Grid columns={3} variant="vaultEditingControllerContainer">
        <Button onClick={() => handleToggle('adjustPosition')} variant={adjustPosition}>
          {t('manage-multiply-vault.action-tabs.adjust')}
        </Button>
        <Button onClick={() => handleToggle('otherActions')} variant={otherActions}>
          {t('manage-multiply-vault.action-tabs.other')}
        </Button>
        <Button onClick={() => handleToggle('borrowTransitionEditing')} variant={borrow}>
          {t('manage-multiply-vault.action-tabs.borrow')}
        </Button>
      </Grid>
      <Box mt={3} mb={-3}>
        <WithVaultFormStepIndicator {...{ totalSteps, currentStep }} />
      </Box>
    </Box>
  )
}

export function DefaultManageMultiplyVaultFormHeader(props: ManageMultiplyVaultState) {
  const { isEditingStage, isBorrowTransitionStage } = props

  return (
    <Box>
      {(isEditingStage || isBorrowTransitionStage) && <DefaultManageMultiplyVaultEditingController {...props} />}
      {!isEditingStage && !isBorrowTransitionStage && <ManageVaultHeaderAllowance {...props} />}
    </Box>
  )
}
