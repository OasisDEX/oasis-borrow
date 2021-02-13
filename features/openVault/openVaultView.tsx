import { BigNumber } from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { VaultActionInput } from 'components/VaultActionInput'
import { formatAmount, formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { zero } from 'helpers/zero'
import React from 'react'
import { Box, Button, Card, Grid, Heading, Spinner, Text } from 'theme-ui'
import { ManualChange, OpenVaultState } from './openVault'

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

function OpenVaultFormInputs({
  token,
  depositAmount,
  generateAmount,
  change,
  collateralBalance,
  maxDepositAmount,
  maxGenerateAmount,
  messages,
}: OpenVaultState) {
  function handleDepositChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')
      const depositAmount = value !== '' ? new BigNumber(value) : undefined

      change({
        kind: 'depositAmount',
        depositAmount,
      })
    }
  }

  function handleGenerateChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')
      const generateAmount = value !== '' ? new BigNumber(value) : undefined
      change({
        kind: 'generateAmount',
        generateAmount,
      })
    }
  }

  function handleDepositMax(change: (ch: ManualChange) => void) {
    return () => {
      change({ kind: 'depositAmount', depositAmount: maxDepositAmount })
    }
  }

  function handleGenerateMax(change: (ch: ManualChange) => void) {
    return () => {
      change({ kind: 'generateAmount', generateAmount: maxGenerateAmount })
    }
  }
  const errorString = messages
    ?.map((message) => message.kind)
    .filter((x) => x)
    .join(',\n')

  const hasError = !!errorString

  return (
    <>
      <VaultActionInput
        action="Deposit"
        amount={depositAmount}
        balance={collateralBalance}
        token={token}
        hasError={false}
        showMax={token !== 'ETH'}
        onSetMax={handleDepositMax(change!)}
        onChange={handleDepositChange(change!)}
      />
      <VaultActionInput
        action="Generate"
        amount={generateAmount}
        token={'DAI'}
        showMax={!!maxGenerateAmount?.gt(zero)}
        onSetMax={handleGenerateMax(change!)}
        hasError={false}
        onChange={handleGenerateChange(change!)}
      />
      {hasError && (
        <>
          <Text sx={{ flexWrap: 'wrap' }}>{errorString}</Text>
        </>
      )}
    </>
  )
}

function OpenVaultFormDetails({
  ilkDebtAvailable,
  liquidationRatio,
  collateralizationRatio,
}: OpenVaultState) {
  const daiAvailable = ilkDebtAvailable ? `${formatCryptoBalance(ilkDebtAvailable)} DAI` : '--'
  const minCollRatio = liquidationRatio
    ? `${formatPercent(liquidationRatio.times(100), { precision: 2 })}`
    : '--'
  const collRatio = collateralizationRatio
    ? `${formatPercent(collateralizationRatio.times(100), { precision: 2 })}`
    : '--'

  return (
    <Card>
      <Grid columns="5fr 3fr">
        <Text sx={{ fontSize: 2 }}>Dai Available</Text>
        <Text sx={{ fontSize: 2, textAlign: 'right' }}>{daiAvailable}</Text>

        <Text sx={{ fontSize: 2 }}>Min. collateral ratio</Text>
        <Text sx={{ fontSize: 2, textAlign: 'right' }}>{minCollRatio}</Text>

        <Text sx={{ fontSize: 2 }}>Collateralization Ratio</Text>
        <Text sx={{ fontSize: 2, textAlign: 'right' }}>{collRatio}</Text>
      </Grid>
    </Card>
  )
}

function OpenVaultForm(props: OpenVaultState) {
  return (
    <Card>
      <Grid>
        <OpenVaultFormTitle {...props} />
        <OpenVaultFormInputs {...props} />
        <OpenVaultFormButton {...props} />
        <OpenVaultFormDetails {...props} />
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

  console.log(openVault)
  if (!openVault) {
    return null
  }

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
