import { trackingEvents } from 'analytics/analytics'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Button, Grid, Text } from 'theme-ui'

import { ManageVaultState } from './manageVault'

function ManageVaultEditingController({ stage, toggle, accountIsController }: ManageVaultState) {
  const { t } = useTranslation()
  const collateralVariant = `vaultEditingController${
    stage !== 'collateralEditing' ? 'Inactive' : ''
  }`
  const daiVariant = `vaultEditingController${stage !== 'daiEditing' ? 'Inactive' : ''}`

  function handleToggle() {
    toggle!()
    if (stage === 'collateralEditing') {
      trackingEvents.switchToDai(accountIsController)
    } else {
      trackingEvents.switchToCollateral(accountIsController)
    }
  }

  return (
    <Box sx={{ justifyContent: 'center' }}>
      <Grid columns={3} variant="vaultEditingControllerContainer">
        <Button onClick={handleToggle} variant={collateralVariant}>
          {t('system.collateral')}
        </Button>
        <Button onClick={handleToggle} variant={daiVariant}>
          {t('system.dai')}
        </Button>
        <Button
          onClick={() => window.alert('Switch to multiply')}
          variant="vaultEditingControllerInactive"
        >
          Multiply
        </Button>
      </Grid>
      {/* <Text variant="paragraph3" sx={{ color: 'text.subtitle', lineHeight: '22px' }}>
        {stage === 'collateralEditing'
          ? t('vault-form.subtext.collateral')
          : t('vault-form.subtext.dai')}
      </Text> */}
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

export function ManageVaultFormHeader(props: ManageVaultState) {
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
      {isEditingStage && <ManageVaultEditingController {...props} />}
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
