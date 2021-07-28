import { trackingEvents } from 'analytics/analytics'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Button, Grid, Text } from 'theme-ui'

import { ManageVaultEditingStage, ManageVaultState } from './manageVault'

function ManageVaultEditingController({
  stage,
  toggle,
  accountIsController,
  isMultiplyTransitionStage,
}: ManageVaultState) {
  const { t } = useTranslation()
  const collateralVariant = `vaultEditingController${
    stage === 'collateralEditing' ? '' : 'Inactive'
  }`
  const daiVariant = `vaultEditingController${stage === 'daiEditing' ? '' : 'Inactive'}`
  const multiplyVariant = `vaultEditingController${isMultiplyTransitionStage ? '' : 'Inactive'}`

  function handleToggle(stage: ManageVaultEditingStage) {
    toggle!(stage)

    if (stage === 'collateralEditing') {
      trackingEvents.switchToDai(accountIsController)
    } else if (stage === 'daiEditing') {
      trackingEvents.switchToCollateral(accountIsController)
    }
  }

  return (
    <Box sx={{ justifyContent: 'center' }}>
      <Grid columns={3} variant="vaultEditingControllerContainer">
        <Button onClick={() => handleToggle('collateralEditing')} variant={collateralVariant}>
          {t('system.collateral')}
        </Button>
        <Button onClick={() => handleToggle('daiEditing')} variant={daiVariant}>
          {t('system.dai')}
        </Button>
        <Button onClick={() => handleToggle('multiplyTransitionEditing')} variant={multiplyVariant}>
          Multiply
        </Button>
      </Grid>
    </Box>
  )
}

function Header({ header, subtext }: { header: string; subtext?: string }) {
  return (
    <>
      <Text variant="paragraph2" sx={{ fontWeight: 'semiBold', mb: 1 }}>
        {header}
      </Text>
      {subtext && (
        <Text variant="paragraph3" sx={{ color: 'text.subtitle', lineHeight: '22px' }}>
          {subtext}
        </Text>
      )}
    </>
  )
}

export function ManageVaultFormHeader(props: ManageVaultState) {
  const { t } = useTranslation()
  const {
    isMultiplyTransitionStage,
    isEditingStage,
    isProxyStage,
    isCollateralAllowanceStage,
    isDaiAllowanceStage,
    isManageStage,
    stage,
  } = props

  return (
    <Box>
      {(isEditingStage || isMultiplyTransitionStage) && <ManageVaultEditingController {...props} />}
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
        {isMultiplyTransitionStage && (
          <Box mt={4}>
            <Header
              header={
                stage === 'multiplyTransitionEditing'
                  ? 'Get up to [x] ETH exposure from your Vault'
                  : 'Great, now you will go the new Mutiply interface'
              }
            />
          </Box>
        )}
      </Text>
    </Box>
  )
}
