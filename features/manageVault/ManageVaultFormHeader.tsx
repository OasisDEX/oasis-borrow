import { trackingEvents } from 'analytics/analytics'
import React from 'react'
import { Box, Button, Flex, Grid, Text } from 'theme-ui'

import { ManageVaultState } from './manageVault'

function ManageVaultEditingToggle({ stage, toggle, accountIsController }: ManageVaultState) {
  const collateralVariant = stage === 'collateralEditing' ? 'outline' : 'filter'
  const daiVariant = stage === 'daiEditing' ? 'outline' : 'filter'

  function handleToggle(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.preventDefault()
    toggle!()
    if (stage === 'collateralEditing') {
      trackingEvents.switchToDai(accountIsController)
    } else {
      trackingEvents.switchToCollateral(accountIsController)
    }
  }

  return (
    <Grid sx={{ justifyContent: 'center' }}>
      <Flex onClick={handleToggle}>
        <Button variant={collateralVariant} sx={{ py: 1 }}>
          Collateral
        </Button>
        <Button variant={daiVariant} sx={{ py: 1 }}>
          Dai
        </Button>
      </Flex>
    </Grid>
  )
}

export function ManageVaultFormHeader(props: ManageVaultState) {
  const { isEditingStage, isProxyStage, isCollateralAllowanceStage, isDaiAllowanceStage } = props

  return (
    <Box pb={3}>
      {isEditingStage ? (
        <ManageVaultEditingToggle {...props} />
      ) : (
        <Text>
          {isProxyStage
            ? 'Create Proxy'
            : isCollateralAllowanceStage
            ? `Set ${props.vault.token} Allowance`
            : isDaiAllowanceStage
            ? `Set DAI Allowance`
            : null}
        </Text>
      )}
    </Box>
  )
}
