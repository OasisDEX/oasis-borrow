import { WithVaultFormStepIndicator } from 'components/vault/VaultForm'
import React from 'react'
import { Box, Button, Grid } from 'theme-ui'

import { ManageMultiplyVaultState } from '../../../../manageMultiplyVault/manageMultiplyVault'
import { ManageVaultHeaderAllowance } from '../../../common/ManageVaultHeaderAllowance'

function DefaultManageMultiplyVaultEditingController({
  stage,
  toggle,
  currentStep,
  totalSteps,
}: // accountIsController,
ManageMultiplyVaultState) {
  const adjustPosition = `vaultEditingController${stage !== 'adjustPosition' ? 'Inactive' : ''}`
  const otherActions = `vaultEditingController${stage !== 'otherActions' ? 'Inactive' : ''}`

  function handleToggle() {
    toggle!()
    // TODO add analytics
    // if (stage === 'collateralEditing') {
    //   trackingEvents.switchToDai(accountIsController)
    // } else {
    //   trackingEvents.switchToCollateral(accountIsController)
    // }
  }

  return (
    <Box sx={{ justifyContent: 'center' }}>
      <Grid columns={2} variant="vaultEditingControllerContainer">
        <Button onClick={handleToggle} variant={adjustPosition}>
          Adjust Position
        </Button>
        <Button onClick={handleToggle} variant={otherActions}>
          Other Actions
        </Button>
      </Grid>
      <Box mt={3} mb={-3}>
        <WithVaultFormStepIndicator {...{ totalSteps, currentStep }} />
      </Box>
    </Box>
  )
}

export function DefaultManageMultiplyVaultFormHeader(props: ManageMultiplyVaultState) {
  const { isEditingStage } = props

  return (
    <Box>
      {isEditingStage && <DefaultManageMultiplyVaultEditingController {...props} />}
      {!isEditingStage && <ManageVaultHeaderAllowance {...props} />}
    </Box>
  )
}
