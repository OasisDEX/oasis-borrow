import { useAppContext } from 'components/AppContextProvider'
import { useObservableWithError } from 'helpers/observableHook'
import React from 'react'
import { Box, Button, Card, Grid, Spinner, Text } from 'theme-ui'

import { categoriseOpenVaultStage, OpenVaultState } from './openVault'
import { OpenVaultAllowance } from './OpenVaultAllowance'
import { OpenVaultButton } from './OpenVaultButton'
import { OpenVaultConfirmation } from './OpenVaultConfirmation'
import { OpenVaultDetails } from './OpenVaultDetails'
import { OpenVaultEditing } from './OpenVaultEditing'
import { OpenVaultIlkDetails } from './OpenVaultIlkDetails'
import { OpenVaultProxy } from './OpenVaultProxy'

function OpenVaultErrors({ errorMessages }: OpenVaultState) {
  const errorString = errorMessages.join(',\n')
  if (!errorString) return null
  return (
    <Card variant="danger">
      <Text sx={{ flexWrap: 'wrap', fontSize: 2, color: 'onError' }}>{errorString}</Text>
    </Card>
  )
}

function OpenVaultWarnings({ warningMessages }: OpenVaultState) {
  const warningString = warningMessages.join(',\n')
  if (!warningString) return null
  return (
    <Card variant="warning">
      <Text sx={{ flexWrap: 'wrap', fontSize: 2, color: 'onWarning' }}>{warningString}</Text>
    </Card>
  )
}

function OpenVaultTitle({ reset, stage }: OpenVaultState) {
  const canReset = !!reset
  const { isEditingStage, isProxyStage, isAllowanceStage } = categoriseOpenVaultStage(stage)

  function handleReset(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    if (canReset) reset!()
  }

  return (
    <Grid>
      <Grid columns="2fr 1fr">
        <Text>
          {isEditingStage
            ? 'Configure your Vault'
            : isProxyStage
            ? 'Create Proxy'
            : isAllowanceStage
            ? 'Set Allowance'
            : 'Create your Vault'}
        </Text>
        {canReset ? (
          <Button onClick={handleReset} disabled={!canReset} sx={{ fontSize: 1, p: 0 }}>
            {stage === 'editing' ? 'Reset' : 'Back'}
          </Button>
        ) : null}
      </Grid>
      <Text sx={{ fontSize: 2 }}>
        Some text here giving a little more context as to what the user is doing
      </Text>
    </Grid>
  )
}

function OpenVaultForm(props: OpenVaultState) {
  const { toggleIlkDetails, showIlkDetails, stage } = props
  const { isEditingStage, isProxyStage, isAllowanceStage, isOpenStage } = categoriseOpenVaultStage(
    stage,
  )
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
        <Grid>
          <OpenVaultTitle {...props} />
          {isEditingStage && <OpenVaultEditing {...props} />}
          {isProxyStage && <OpenVaultProxy {...props} />}
          {isAllowanceStage && <OpenVaultAllowance {...props} />}
          {isOpenStage && <OpenVaultConfirmation {...props} />}
          <OpenVaultErrors {...props} />
          <OpenVaultWarnings {...props} />
          <OpenVaultButton {...props} />
          <OpenVaultIlkDetails {...props} />
        </Grid>
      </Card>
    </Box>
  )
}

export function OpenVaultContainer(props: OpenVaultState) {
  return (
    <Grid columns="2fr 1fr" gap={4}>
      <OpenVaultDetails {...props} />
      <OpenVaultForm {...props} />
    </Grid>
  )
}

export function OpenVaultView({ ilk }: { ilk: string }) {
  const { openVault$ } = useAppContext()
  const [openVault, openVaultError] = useObservableWithError(openVault$(ilk))

  if (openVaultError) {
    return (
      <Grid sx={{ width: '100%', height: '50vh', justifyItems: 'center', alignItems: 'center' }}>
        <Box>{openVaultError.message}</Box>
      </Grid>
    )
  }

  if (!openVault) {
    return (
      <Grid sx={{ width: '100%', height: '50vh', justifyItems: 'center', alignItems: 'center' }}>
        <Spinner size={50} />
      </Grid>
    )
  }

  return (
    <Grid>
      <OpenVaultContainer {...(openVault as OpenVaultState)} />
    </Grid>
  )
}
