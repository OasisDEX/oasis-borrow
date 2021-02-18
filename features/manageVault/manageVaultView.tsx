import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { zero } from 'helpers/zero'
import React from 'react'
import { Box, Button, Card, Grid, Heading, Text } from 'theme-ui'
import { ManageVaultState } from './manageVault'

function ManageVaultDetails({
  /* afterCollateralizationRatio,
   * afterLiquidationPrice, */
  token,
}: ManageVaultState) {
  let afterCollateralizationRatio = new BigNumber(5)
  let afterLiquidationPrice = new BigNumber(5)

  const afterCollRatio = afterCollateralizationRatio.eq(zero)
    ? '--'
    : formatPercent(afterCollateralizationRatio.times(100), { precision: 2 })

  const afterLiqPrice = formatAmount(afterLiquidationPrice, 'USD')

  return (
    <Grid columns="1fr 1fr" gap={6} sx={{ justifyContent: 'space-between' }}>
      <Grid>
        <Text>Liquidation Price</Text>
        <Heading>$0.00</Heading>
        <Text>After: ${afterLiqPrice}</Text>
      </Grid>

      <Grid sx={{ textAlign: 'right' }}>
        <Text>Collateralization Ratio</Text>
        <Heading>0 %</Heading>
        <Text>After: {afterCollRatio}</Text>
      </Grid>

      <Grid>
        <Text>Current ETH/USD Price in 9 mins</Text>
        <Heading>$1375.0000</Heading>
        <Text>Next price: $1325.0000 (-2.30%)</Text>
      </Grid>

      <Grid sx={{ textAlign: 'right' }}>
        <Text>Collateral Locked</Text>
        <Heading>--.-- {token}</Heading>
        <Text>$--.--</Text>
      </Grid>
    </Grid>
  )
}

function ManageVaultFormTitle({
  isEditingStage,
  isProxyStage,
  isCollateralAllowanceStage,
  isDaiAllowanceStage,
  reset,
  stage,
  token,
}: ManageVaultState) {
  const canReset = !!reset

  function handleReset(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    if (canReset) reset!()
  }

  return (
    <Grid pb={3}>
      <Grid columns="2fr 1fr">
        <Text>
          {isEditingStage
            ? 'Manage your Vault'
            : isProxyStage
            ? 'Create Proxy'
            : isCollateralAllowanceStage
            ? `Set ${token} Allowance`
            : isDaiAllowanceStage
            ? `Set DAI Allowance`
            : 'Action Vault'}
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

function ManageVaultForm(props: ManageVaultState) {
  const {
    isEditingStage,
    isProxyStage,
    isCollateralAllowanceStage,
    isDaiAllowanceStage,
    isTransactionStage,
  } = props

  return (
    <Box>
      <Card>
        <ManageVaultFormTitle {...props} />
        {/* {isEditingStage && <OpenVaultFormEditing {...props} />}
            {isProxyStage && <OpenVaultFormProxy {...props} />}
            {isAllowanceStage && <OpenVaultFormAllowance {...props} />}
            {isOpenStage && <OpenVaultFormConfirmation {...props} />} */}
      </Card>
    </Box>
  )
}

function ManageVaultContainer(props: ManageVaultState) {
  return (
    <Grid columns="2fr 1fr" gap={4}>
      <ManageVaultDetails {...props} />
      <ManageVaultForm {...props} />
    </Grid>
  )
}

export function ManageVaultView({ id }: { id: BigNumber }) {
  const { manageVault$ } = useAppContext()
  const manageVault = useObservable(manageVault$(id))

  if (!manageVault) return null

  console.log(manageVault)
  return (
    <Grid>
      <ManageVaultContainer {...manageVault} />
    </Grid>
  )
}
