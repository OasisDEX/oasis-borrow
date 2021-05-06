import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Button, Flex, Grid, Text } from 'theme-ui'

import { ManageVaultState } from './manageVault'

function ManageVaultEditingToggle({ stage, toggle }: ManageVaultState) {
  const collateralVariant = stage === 'collateralEditing' ? 'outline' : 'filter'
  const daiVariant = stage === 'daiEditing' ? 'outline' : 'filter'
  const { t } = useTranslation()

  function handleToggle(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.preventDefault()
    toggle!()
  }

  return (
    <Grid sx={{ justifyContent: 'center' }}>
      <Flex onClick={handleToggle} sx={{ justifyContent: 'center' }}>
        <Button variant={collateralVariant} sx={{ py: 1 }}>
          {t('system.collateral')}
        </Button>
        <Button variant={daiVariant} sx={{ py: 1 }}>
          {t('system.dai')}
        </Button>
      </Flex>
      <Text variant="paragraph3" sx={{ color: 'text.subtitle', lineHeight: '22px' }}>
        {stage === 'collateralEditing'
          ? t('vault-form.subtext.collateral')
          : t('vault-form.subtext.dai')}
      </Text>
    </Grid>
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
      {isEditingStage && <ManageVaultEditingToggle {...props} />}
      <Text variant="paragraph2" sx={{ fontWeight: 'semiBold', mb: 1 }}>
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
