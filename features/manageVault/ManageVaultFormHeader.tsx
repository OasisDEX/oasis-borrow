import React from 'react'
import { Box, Button, Flex, Grid, Text } from 'theme-ui'

import { ManageVaultState } from './manageVault'

function ManageVaultEditingToggle({ stage, toggle }: ManageVaultState) {
  const collateralVariant = stage === 'collateralEditing' ? 'outline' : 'filter'
  const daiVariant = stage === 'daiEditing' ? 'outline' : 'filter'

  function handleToggle(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.preventDefault()
    toggle!()
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
  const {
    isEditingStage,
    isProxyStage,
    isCollateralAllowanceStage,
    isDaiAllowanceStage,
    token,
  } = props
  return (
    <Box pb={3}>
      {isEditingStage ? (
        <ManageVaultEditingToggle {...props} />
      ) : (
        <Text>
          {isProxyStage
            ? 'Create Proxy'
            : isCollateralAllowanceStage
            ? `Set ${token} Allowance`
            : isDaiAllowanceStage
            ? `Set DAI Allowance`
            : null}
        </Text>
      )}
    </Box>
  )
}
