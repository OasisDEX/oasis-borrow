import { BigNumber } from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { VaultActionInput } from 'components/VaultActionInput'
import { useObservable } from 'helpers/observableHook'
import { zero } from 'helpers/zero'
import React from 'react'
import { Box, Button, Card, Grid, Heading, Spinner, Text } from 'theme-ui'
import { OpenVaultState } from './openVault'
import { ManualChange, OpenVaultConnectedState } from './openVaultConnected'

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

function OpenVaultFormButton({
  isEditingStage,
  isProxyStage,
  isAllowanceStage,
  isConnected,
}: OpenVaultState) {
  return (
    <Button>
      {isEditingStage
        ? isConnected
          ? 'Confirm'
          : 'Connect'
        : isProxyStage
        ? 'Create Proxy'
        : isAllowanceStage
        ? 'Set Allowance'
        : 'Create your Vault'}
    </Button>
  )
}

type OpenVaultInputsProps = OpenVaultConnectedState
function OpenVaultInputs({
  depositAmount,
  generateAmount,
  maxDebtPerUnitCollateral,
  change,
  collateralBalance,
  daiBalance,
}: OpenVaultInputsProps) {
  function handleDepositChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')
      const depositAmount = value !== '' ? new BigNumber(value) : zero
      const maxDrawAmount = collateralBalance.times(maxDebtPerUnitCollateral)

      change({
        kind: 'depositAmount',
        depositAmount,
      })
      /* change({
       *   kind: 'maxDrawAmount',
       *   maxDrawAmount,
       * }) */
      if (!depositAmount.eq(zero)) {
        change({ kind: 'generateAmount', generateAmount: zero })
      }
    }
  }

  function handleGenerateChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')
      const generateAmount = value !== '' ? new BigNumber(value) : zero
      change({
        kind: 'generateAmount',
        generateAmount,
      })
    }
  }

  return (
    <>
      <VaultActionInput
        action="Deposit"
        amount={depositAmount}
        balance={collateralBalance}
        token={'ETH'}
        hasError={true}
        onChange={handleDepositChange(change!)}
      />
      <VaultActionInput
        action="Generate"
        amount={generateAmount}
        balance={daiBalance}
        token={'DAI'}
        hasError={false}
        onChange={handleGenerateChange(change!)}
      />
    </>
  )
}

function OpenVaultForm(props: OpenVaultState) {
  return (
    <Card>
      <Grid>
        <OpenVaultFormTitle {...props} />
        <OpenVaultInputs {...(props as OpenVaultConnectedState)} />
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
