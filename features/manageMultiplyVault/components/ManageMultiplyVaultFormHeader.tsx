import { WithVaultFormStepIndicator } from 'components/vault/VaultForm'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Button, Grid, Text } from 'theme-ui'

import { ManageMultiplyVaultState } from '../manageMultiplyVault'

function ManageMultiplyVaultEditingController({
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

export function ManageMultiplyVaultFormHeader(props: ManageMultiplyVaultState) {
  const { t } = useTranslation()
  const {
    isEditingStage,
    isProxyStage,
    isCollateralAllowanceStage,
    isDaiAllowanceStage,
    stage,
    currentStep,
    totalSteps,
  } = props

  return (
    <Box>
      {isEditingStage && <ManageMultiplyVaultEditingController {...props} />}
      {!isEditingStage && (
        <Box>
          <WithVaultFormStepIndicator {...{ totalSteps, currentStep }}>
            <Text variant="paragraph2" sx={{ fontWeight: 'semiBold', mb: 1 }}>
              {isProxyStage
                ? t('vault-form.header.proxy')
                : isCollateralAllowanceStage
                ? t('vault-form.header.allowance', { token: props.vault.token.toUpperCase() })
                : isDaiAllowanceStage
                ? t('vault-form.header.daiAllowance')
                : stage === 'manageInProgress'
                ? t('vault-form.header.modified')
                : t('vault-form.header.review-manage')}
            </Text>
          </WithVaultFormStepIndicator>
          <Text variant="paragraph3" sx={{ color: 'text.subtitle', lineHeight: '22px' }}>
            {isProxyStage
              ? t('vault-form.subtext.proxy')
              : isCollateralAllowanceStage
              ? t('vault-form.subtext.allowance', { token: props.vault.token.toUpperCase() })
              : isDaiAllowanceStage
              ? t('vault-form.subtext.daiAllowance')
              : stage === 'manageInProgress'
              ? t('vault-form.subtext.modified')
              : t('vault-form.subtext.review-manage')}
          </Text>
        </Box>
      )}
    </Box>
  )
}
