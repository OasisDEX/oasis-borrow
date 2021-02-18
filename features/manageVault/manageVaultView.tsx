import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { VaultActionInput } from 'components/VaultActionInput'
import { formatAmount, formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { zero } from 'helpers/zero'
import React from 'react'
import { Box, Button, Card, Grid, Heading, Text } from 'theme-ui'
import { ManageVaultState, ManualChange } from './manageVault'

function ManageVaultDetails({
  afterCollateralizationRatio,
  afterLiquidationPrice,
  token,
}: ManageVaultState) {
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

function ManageVaultFormEditing(props: ManageVaultState) {
  const {
    token,
    depositAmount,
    depositAmountUSD,
    maxDepositAmount,
    maxDepositAmountUSD,
    withdrawAmount,
    withdrawAmountUSD,
    maxWithdrawAmount,
    maxWithdrawAmountUSD,
    generateAmount,
    paybackAmount,
    collateralBalance,
    collateralPrice,
    maxGenerateAmount,
    maxPaybackAmount,
    errorMessages,
    warningMessages,
    ilkDebtAvailable,
    liquidationRatio,
    afterCollateralizationRatio,
    progress,
    change,
  } = props

  function handleProgress(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    progress!()
  }

  function clearDeposit(change: (ch: ManualChange) => void) {
    change({
      kind: 'depositAmount',
      depositAmount: undefined,
    })
    change({
      kind: 'depositAmountUSD',
      depositAmountUSD: undefined,
    })
  }

  function clearWithdraw(change: (ch: ManualChange) => void) {
    change({
      kind: 'withdrawAmount',
      withdrawAmount: undefined,
    })
    change({
      kind: 'withdrawAmountUSD',
      withdrawAmountUSD: undefined,
    })
  }

  function handleDepositChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')
      const depositAmount = value !== '' ? new BigNumber(value) : undefined
      const depositAmountUSD = depositAmount ? collateralPrice.times(depositAmount) : undefined

      clearWithdraw(change)
      change({
        kind: 'depositAmount',
        depositAmount,
      })
      change({
        kind: 'depositAmountUSD',
        depositAmountUSD,
      })
    }
  }

  function handleDepositUSDChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')
      const depositAmountUSD = value !== '' ? new BigNumber(value) : undefined
      const depositAmount =
        depositAmountUSD && depositAmountUSD.gt(zero)
          ? depositAmountUSD.div(collateralPrice)
          : undefined

      clearWithdraw(change)
      change({
        kind: 'depositAmountUSD',
        depositAmountUSD,
      })
      change({
        kind: 'depositAmount',
        depositAmount,
      })
    }
  }

  function handleDepositMax(change: (ch: ManualChange) => void) {
    return () => {
      clearWithdraw(change)
      change({ kind: 'depositAmount', depositAmount: maxDepositAmount })
      change({ kind: 'depositAmountUSD', depositAmountUSD: maxDepositAmountUSD })
    }
  }

  function handleWithdrawChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')
      const withdrawAmount = value !== '' ? new BigNumber(value) : undefined
      const withdrawAmountUSD = withdrawAmount ? collateralPrice.times(withdrawAmount) : undefined

      clearDeposit(change)
      change({
        kind: 'withdrawAmount',
        withdrawAmount,
      })
      change({
        kind: 'withdrawAmountUSD',
        withdrawAmountUSD,
      })
    }
  }

  function handleWithdrawUSDChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')
      const withdrawAmountUSD = value !== '' ? new BigNumber(value) : undefined
      const withdrawAmount =
        withdrawAmountUSD && withdrawAmountUSD.gt(zero)
          ? withdrawAmountUSD.div(collateralPrice)
          : undefined

      clearDeposit(change)
      change({
        kind: 'withdrawAmountUSD',
        withdrawAmountUSD,
      })
      change({
        kind: 'withdrawAmount',
        withdrawAmount,
      })
    }
  }

  function handleWithdrawMax(change: (ch: ManualChange) => void) {
    return () => {
      clearDeposit(change)
      change({ kind: 'withdrawAmount', withdrawAmount: maxWithdrawAmount })
      change({ kind: 'withdrawAmountUSD', withdrawAmountUSD: maxWithdrawAmountUSD })
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

  function handlePaybackChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')
      const paybackAmount = value !== '' ? new BigNumber(value) : undefined
      change({
        kind: 'paybackAmount',
        paybackAmount,
      })
    }
  }

  function handleGenerateMax(change: (ch: ManualChange) => void) {
    return () => {
      change({ kind: 'generateAmount', generateAmount: maxGenerateAmount })
    }
  }

  function handlePaybackMax(change: (ch: ManualChange) => void) {
    return () => {
      change({ kind: 'paybackAmount', paybackAmount: maxPaybackAmount })
    }
  }

  const errorString = errorMessages.join(',\n')
  const warningString = warningMessages.join(',\n')

  const hasError = !!errorString
  const hasWarnings = !!warningString

  const daiAvailable = ilkDebtAvailable ? `${formatCryptoBalance(ilkDebtAvailable)} DAI` : '--'
  const minCollRatio = liquidationRatio
    ? `${formatPercent(liquidationRatio.times(100), { precision: 2 })}`
    : '--'
  const afterCollRatio = afterCollateralizationRatio.eq(zero)
    ? '--'
    : formatPercent(afterCollateralizationRatio.times(100), { precision: 2 })

  console.log(maxWithdrawAmount.toString())
  console.log(maxWithdrawAmountUSD.toString())

  return (
    <Grid>
      <VaultActionInput
        action="Deposit"
        token={token}
        showMax={true}
        hasAuxiliary={true}
        onSetMax={handleDepositMax(change!)}
        maxAmountLabel={'Balance'}
        amount={depositAmount}
        auxiliaryAmount={depositAmountUSD}
        maxAmount={maxDepositAmount}
        maxAuxiliaryAmount={maxDepositAmountUSD}
        onChange={handleDepositChange(change!)}
        onAuxiliaryChange={handleDepositUSDChange(change!)}
        hasError={false}
      />
      <VaultActionInput
        action="Withdraw"
        showMax={true}
        hasAuxiliary={true}
        onSetMax={handleWithdrawMax(change!)}
        amount={withdrawAmount}
        auxiliaryAmount={withdrawAmountUSD}
        maxAmount={maxWithdrawAmount}
        maxAmountLabel={'Locked'}
        maxAuxiliaryAmount={maxWithdrawAmountUSD}
        token={token}
        hasError={false}
        onChange={handleWithdrawChange(change!)}
        onAuxiliaryChange={handleWithdrawUSDChange(change!)}
      />
      {/* <VaultActionInput
          action="Generate"
          amount={generateAmount}
          token={'DAI'}
          showMax={!!maxGenerateAmount?.gt(zero)}
          onSetMax={handleGenerateMax(change!)}
          hasError={false}
          onChange={handleGenerateChange(change!)}
          />
          <VaultActionInput
          action="Payback"
          amount={paybackAmount}
          token={'DAI'}
          showMax={!!maxGenerateAmount?.gt(zero)}
          onSetMax={handlePaybackMax(change!)}
          hasError={false}
          onChange={handlePaybackChange(change!)}
          /> */}
      {hasError && (
        <>
          <Text sx={{ flexWrap: 'wrap', fontSize: 2, color: 'onError' }}>{errorString}</Text>
        </>
      )}
      {hasWarnings && (
        <>
          <Text sx={{ flexWrap: 'wrap', fontSize: 2, color: 'onWarning' }}>{warningString}</Text>
        </>
      )}

      <Card>
        <Grid columns="5fr 3fr">
          <Text sx={{ fontSize: 2 }}>Dai Available</Text>
          <Text sx={{ fontSize: 2, textAlign: 'right' }}>{daiAvailable}</Text>

          <Text sx={{ fontSize: 2 }}>Min. collateral ratio</Text>
          <Text sx={{ fontSize: 2, textAlign: 'right' }}>{minCollRatio}</Text>

          <Text sx={{ fontSize: 2 }}>Collateralization Ratio</Text>
          <Text sx={{ fontSize: 2, textAlign: 'right' }}>{afterCollRatio}</Text>
        </Grid>
      </Card>
      <Button onClick={handleProgress} disabled={hasError}>
        Confirm
      </Button>
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
        {isEditingStage && <ManageVaultFormEditing {...props} />}
        {/*
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
