import React from 'react'
import { Box, Button, Flex, Grid, Text } from 'theme-ui'
import { ManageVaultState } from './manageVault'

function ManageVaultEditingToggle({ stage, toggle }: ManageVaultState) {
  function handleToggle(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.preventDefault()
    toggle!()
  }

  return (
    <Grid sx={{ justifyContent: 'center' }}>
      <Flex onClick={handleToggle}>
        {stage === 'collateralEditing' && (
          <>
            <Button variant="outline" sx={{ py: 1 }}>
              Collateral
            </Button>
            <Button variant="filter" sx={{ py: 1 }}>
              Dai
            </Button>
          </>
        )}
        {stage === 'daiEditing' && (
          <>
            <Button variant="filter" sx={{ py: 1 }}>
              Collateral
            </Button>
            <Button variant="outline" sx={{ py: 1 }}>
              Dai
            </Button>
          </>
        )}
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
    <Box>
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
