import { BigNumber } from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { AmountInput } from 'helpers/input'
import { useObservable } from 'helpers/observableHook'
import React from 'react'
import { Box, Button, Card, Grid, Heading, Spinner, Text } from 'theme-ui'
import { EditingState, OpenVaultStage, OpenVaultState } from './openVault'

function OpenVaultDetails() {
  return (
    <Grid columns="1fr 1fr" gap={6} sx={{ justifyContent: 'space-between' }}>
      <Grid>
        <Text>Liquidation Price</Text>
        <Heading>$1425.20</Heading>
        <Text>After: $2500.20</Text>
      </Grid>

      <Grid sx={{ textAlign: 'right' }}>
        <Text>Collateralization Ratio</Text>
        <Heading>200.00%</Heading>
        <Text>After: 300.00%</Text>
      </Grid>

      <Grid>
        <Text>Current ETH/USD Price in 9 mins</Text>
        <Heading>$1375.0000</Heading>
        <Text>Next price: $1325.0000 (-2.30%)</Text>
      </Grid>

      <Grid sx={{ textAlign: 'right' }}>
        <Text>Collateral Locked</Text>
        <Heading>200.00 ETH</Heading>
        <Text>$182,000.20 USD</Text>
      </Grid>
    </Grid>
  )
}

function OpenVaultTitle({ stage }: { stage: OpenVaultStage }) {
  let title = ''

  const isProxyStage =
    stage === 'proxyWaitingForConfirmation' ||
    stage === 'proxyWaitingForApproval' ||
    stage === 'proxyInProgress' ||
    stage === 'proxyFailure'

  const isAllowanceStage =
    stage === 'allowanceWaitingForConfirmation' ||
    stage === 'allowanceWaitingForApproval' ||
    stage === 'allowanceInProgress' ||
    stage === 'allowanceFailure'

  if (stage === 'editing') {
    title = 'Configure Your Vault'
  } else if (isProxyStage) {
    title = 'Create Proxy'
  } else if (isAllowanceStage) {
    title = 'Set allowance'
  } else {
    title = 'Create Your Vault'
  }

  return <Text>{title}</Text>
}

function OpenVaultDeposit() {
  return (
    <AmountInput
      action={'Deposit ETH'}
      disabled={false}
      balance={new BigNumber('1')}
      token={getToken('ETH')}
      hasError={false}
      onChange={(e) => console.log(e.target.value)}
    />
  )
}

function OpenVaultGenerate() {
  return (
    <AmountInput
      action={'Generate DAI'}
      disabled={false}
      balance={new BigNumber('1')}
      token={getToken('DAI')}
      hasError={false}
      onChange={(e) => console.log(e.target.value)}
    />
  )
}

function OpenVaultGasSelection() {
  return null
}

function OpenVaultButton({ stage }: { stage: OpenVaultStage }) {
  let title = ''

  const isProxyStage =
    stage === 'proxyWaitingForConfirmation' ||
    stage === 'proxyWaitingForApproval' ||
    stage === 'proxyInProgress' ||
    stage === 'proxyFailure'

  const isAllowanceStage =
    stage === 'allowanceWaitingForConfirmation' ||
    stage === 'allowanceWaitingForApproval' ||
    stage === 'allowanceInProgress' ||
    stage === 'allowanceFailure'

  if (stage === 'editing') {
    title = 'Confirm'
  } else if (isProxyStage) {
    title = 'Create Proxy'
  } else if (isAllowanceStage) {
    title = 'Approve allowance'
  } else {
    title = 'Create Your Vault'
  }

  return <Button>{title}</Button>
}

function OpenVaultForm() {
  return <Card></Card>
}

function OpenVaultDisplay(props: EditingState) {
  return (
    <Grid>
      <OpenVaultDetails />
      <OpenVaultForm />
    </Grid>
  )
}

export function OpenVaultView({ ilk }: { ilk: string }) {
  const { openVault$ } = useAppContext()
  const openVault = useObservable(openVault$(ilk))

  if (!openVault) {
    return null
  }

  console.log(openVault)
  if (openVault.isIlkValidationStage) {
    return (
      <Grid sx={{ width: '100%', height: '50vh', justifyItems: 'center', alignItems: 'center' }}>
        {openVault.stage === 'ilkValidationLoading' && <Spinner size={50} />}
        {openVault.stage === 'ilkValidationFailure' && (
          <Box>
            Ilk {ilk} does not exist, please update the ilk registry if passed by governance
          </Box>
        )}
      </Grid>
    )
  }

  return (
    <Grid>
      <OpenVaultDisplay {...{ ...openVault }} />
    </Grid>
  )
}
