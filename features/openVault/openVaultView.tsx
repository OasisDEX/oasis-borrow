import { BigNumber } from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { AmountInput, VaultActionInput } from 'components/VaultActionInput'
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

function OpenVaultFormTitle({ isEditingStage, isProxyStage, isAllowanceStage }: OpenVaultState) {
  return (
    <Text>
      {isEditingStage
        ? 'Confirm'
        : isProxyStage
        ? 'Create Proxy'
        : isAllowanceStage
        ? 'Set Allowance'
        : 'Create your Vault'}
    </Text>
  )
}

function OpenVaultGasSelection() {
  return null
}

function OpenVaultFormButton({ isEditingStage, isProxyStage, isAllowanceStage }: OpenVaultState) {
  return (
    <Button>
      {isEditingStage
        ? 'Confirm'
        : isProxyStage
        ? 'Create Proxy'
        : isAllowanceStage
        ? 'Set Allowance'
        : 'Create your Vault'}
    </Button>
  )
}

function OpenVaultForm(props: OpenVaultState) {
  return (
    <Card>
      <Grid>
        <OpenVaultFormTitle {...props} />
        <VaultActionInput
          action="Deposit"
          disabled={false}
          balance={new BigNumber('1')}
          token={'ETH'}
          hasError={true}
          onChange={(e) => console.log(e.target.value)}
        />
        <VaultActionInput
          action="Generate"
          disabled={false}
          balance={new BigNumber('1')}
          token={'DAI'}
          hasError={false}
          onChange={(e) => console.log(e.target.value)}
        />
        <OpenVaultFormButton {...props} />
      </Grid>
    </Card>
  )
}

function OpenVaultDisplay(props: OpenVaultState) {
  return (
    <Grid columns="2fr 1fr" gap={4}>
      <OpenVaultDetails />
      <OpenVaultForm {...props} />
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
      <OpenVaultDisplay {...openVault} />
    </Grid>
  )
}
