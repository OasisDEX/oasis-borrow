import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { ManageVaultFormHeader } from 'features/manageVault/ManageVaultFormHeader'
import { useObservableWithError } from 'helpers/observableHook'
import React from 'react'
import { Box, Card, Grid, Text } from 'theme-ui'

import { categoriseManageVaultStage, ManageVaultState } from './manageVault'
import { ManageVaultButton } from './ManageVaultButton'
import { ManageVaultCollateralAllowance } from './ManageVaultCollateralAllowance'
import { ManageVaultConfirmation } from './ManageVaultConfirmation'
import { ManageVaultDaiAllowance } from './ManageVaultDaiAllowance'
import { ManageVaultDetails } from './ManageVaultDetails'
import { ManageVaultEditing } from './ManageVaultEditing'
import { ManageVaultIlkDetails } from './ManageVaultIlkDetails'
import { ManageVaultProxy } from './ManageVaultProxy'

function ManageVaultErrors({ errorMessages }: ManageVaultState) {
  const errorString = errorMessages.join(',\n')
  if (!!errorString) return null
  return (
    <Card variant="danger">
      <Text sx={{ flexWrap: 'wrap', fontSize: 2, color: 'onError' }}>{errorString}</Text>
    </Card>
  )
}

function ManageVaultWarnings({ warningMessages }: ManageVaultState) {
  const warningString = warningMessages.join(',\n')
  if (!!warningString) return null
  return (
    <Card variant="warning">
      <Text sx={{ flexWrap: 'wrap', fontSize: 2, color: 'onWarning' }}>{warningString}</Text>
    </Card>
  )
}

function ManageVaultForm(props: ManageVaultState) {
  const { toggleIlkDetails, showIlkDetails, stage } = props
  const {
    isEditingStage,
    isProxyStage,
    isCollateralAllowanceStage,
    isDaiAllowanceStage,
    isManageStage,
  } = categoriseManageVaultStage(stage)

  // maybe unneccessary logic in state
  function handleMouseEnter(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.preventDefault()
    if (isEditingStage && !showIlkDetails) {
      toggleIlkDetails!()
    }
  }

  function handleMouseLeave(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.preventDefault()
    if (isEditingStage && showIlkDetails) {
      toggleIlkDetails!()
    }
  }

  return (
    <Box onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Card>
        <ManageVaultFormHeader {...props} />
        <Grid>
          {isEditingStage && <ManageVaultEditing {...props} />}
          {isProxyStage && <ManageVaultProxy {...props} />}
          {isCollateralAllowanceStage && <ManageVaultCollateralAllowance {...props} />}
          {isDaiAllowanceStage && <ManageVaultDaiAllowance {...props} />}
          {isManageStage && <ManageVaultConfirmation {...props} />}
          <ManageVaultErrors {...props} />
          <ManageVaultWarnings {...props} />
          <ManageVaultButton {...props} />
          {isEditingStage && <ManageVaultIlkDetails {...props} />}
        </Grid>
      </Card>
    </Box>
  )
}

export function ManageVaultContainer(props: ManageVaultState) {
  return (
    <Grid columns="2fr 1fr" gap={4}>
      <ManageVaultDetails {...props} />
      <ManageVaultForm {...props} />
    </Grid>
  )
}

export function ManageVaultView({ id }: { id: BigNumber }) {
  const { manageVault$ } = useAppContext()
  const [manageVault, manageVaultError] = useObservableWithError(manageVault$(id))

  if (manageVaultError) return <>Error!</>
  if (!manageVault) return <>loading...</>

  return (
    <Grid gap={4}>
      <ManageVaultContainer {...manageVault} />
    </Grid>
  )
}
