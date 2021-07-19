import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Button, Grid, Text } from 'theme-ui'

import { ManageMultiplyVaultState } from '../manageMultiplyVault'

function ManageMultiplyVaultEditingController({
  stage,
  toggle,
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
    </Box>
  )
}

function Header({ header, subtext }: { header: string; subtext: string }) {
  return (
    <>
      <Text variant="paragraph2" sx={{ fontWeight: 'semiBold', mb: 1 }}>
        {header}
      </Text>
      <Text variant="paragraph3" sx={{ color: 'text.subtitle', lineHeight: '22px' }}>
        {subtext}
      </Text>
    </>
  )
}

export function ManageMultiplyVaultFormHeader(props: ManageMultiplyVaultState) {
  const { t } = useTranslation()
  const {
    isEditingStage,
    isProxyStage,
    isCollateralAllowanceStage,
    isDaiAllowanceStage,
    isManageStage,
  } = props

  return (
    <Box>
      {isEditingStage && <ManageMultiplyVaultEditingController {...props} />}
      <Text variant="paragraph2" sx={{ fontWeight: 'semiBold' }}>
        {isProxyStage && (
          <Header header={t('vault-form.header.proxy')} subtext={t('vault-form.subtext.proxy')} />
        )}
        {isCollateralAllowanceStage && (
          <Header
            header={t('vault-form.header.allowance', { token: props.vault.token.toUpperCase() })}
            subtext={t('vault-form.subtext.allowance')}
          />
        )}
        {isDaiAllowanceStage && (
          <Header
            header={t('vault-form.header.daiAllowance')}
            subtext={t('vault-form.subtext.daiAllowance')}
          />
        )}
        {isManageStage && (
          <Header
            header={t('vault-form.header.confirm-manage')}
            subtext={t('vault-form.subtext.confirm')}
          />
        )}
      </Text>
    </Box>
  )
}
