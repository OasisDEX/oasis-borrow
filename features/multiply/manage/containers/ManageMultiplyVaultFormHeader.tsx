import { WithVaultFormStepIndicator } from 'components/vault/VaultForm'
import { ManageMultiplyVaultEditingStage } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Button, Grid, Text } from 'theme-ui'

import { ManageVaultHeaderAllowance } from '../../../../components/vault/commonMultiply/ManageVaultHeaderAllowance'
import { ManageMultiplyVaultState } from '../pipes/manageMultiplyVault'

function DefaultManageMultiplyVaultEditingController({
  stage,
  toggle,
  currentStep,
  totalSteps,
  isBorrowTransitionStage,
}: // accountIsController,
ManageMultiplyVaultState) {
  const { t } = useTranslation()
  const adjustPosition = `vaultEditingController${stage !== 'adjustPosition' ? 'Inactive' : ''}`
  const otherActions = `vaultEditingController${stage !== 'otherActions' ? 'Inactive' : ''}`
  const borrow = `vaultEditingController${!isBorrowTransitionStage ? 'Inactive' : ''}`

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
      {!isBorrowTransitionStage && (
        <Box mt={3} mb={-3}>
          <WithVaultFormStepIndicator {...{ totalSteps, currentStep }} />
        </Box>
      )}
    </Box>
  )
}

export function ManageMultiplyVaultFormHeader(props: ManageMultiplyVaultState) {
  const { isEditingStage, isBorrowTransitionStage, stage, totalSteps, currentStep } = props
  const { t } = useTranslation()

  return (
    <Box>
      {(isEditingStage || isBorrowTransitionStage) && (
        <DefaultManageMultiplyVaultEditingController {...props} />
      )}
      {!isEditingStage && !isBorrowTransitionStage && <ManageVaultHeaderAllowance {...props} />}
      {!isEditingStage && isBorrowTransitionStage && (
        <Box mt={4}>
          <WithVaultFormStepIndicator {...{ totalSteps, currentStep }}>
            <Text variant="paragraph2" sx={{ fontWeight: 'semiBold', mb: 1 }}>
              {stage === 'borrowTransitionEditing'
                ? t('multiply-to-borrow.title1')
                : t('multiply-to-borrow.title2')}
            </Text>
          </WithVaultFormStepIndicator>
        </Box>
      )}
    </Box>
  )
}
