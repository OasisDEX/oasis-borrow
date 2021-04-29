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
      <Flex onClick={handleToggle}>
        <Button variant={collateralVariant} sx={{ py: 1 }}>
          {t('collateral')}
        </Button>
        <Button variant={daiVariant} sx={{ py: 1 }}>
          {t('dai')}
        </Button>
      </Flex>
    </Grid>
  )
}

export function ManageVaultFormHeader(props: ManageVaultState) {
  const { t } = useTranslation()
  const { isEditingStage, isProxyStage, isCollateralAllowanceStage, isDaiAllowanceStage } = props

  return (
    <Box pb={3}>
      {isEditingStage ? (
        <ManageVaultEditingToggle {...props} />
      ) : (
        <Text>
          {isProxyStage
            ? t('create-proxy')
            : isCollateralAllowanceStage
            ? t('set-token-allownace', { token: props.vault.token.toUpperCase() })
            : isDaiAllowanceStage
            ? t('set-token-allownace', 'DAI')
            : null}
        </Text>
      )}
    </Box>
  )
}
