import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { VaultActionInput } from 'components/VaultActionInput'
import { formatAmount, formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { zero } from 'helpers/zero'
import React from 'react'
import { Box, Button, Card, Flex, Grid, Heading, Link, Spinner, Text } from 'theme-ui'
import { ManageVaultState, ManualChange } from './manageVault'

function ManageVaultDetails({
  afterCollateralizationRatio,
  afterLiquidationPrice,
  token,
  collateralizationRatio,
  liquidationPrice,
  lockedCollateral,
  lockedCollateralPrice,
  collateralPrice,
}: ManageVaultState) {
  const collRatio = collateralizationRatio.eq(zero)
    ? '--'
    : formatPercent(collateralizationRatio.times(100), { precision: 4 })

  const afterCollRatio = afterCollateralizationRatio.eq(zero)
    ? '--'
    : formatPercent(afterCollateralizationRatio.times(100), { precision: 4 })

  const collPrice = formatAmount(collateralPrice, 'USD')

  const liqPrice = formatAmount(liquidationPrice, 'USD')
  const afterLiqPrice = formatAmount(afterLiquidationPrice, 'USD')

  const locked = formatAmount(lockedCollateral, token)
  const lockedUSD = formatAmount(lockedCollateralPrice, token)

  return (
    <Grid columns="1fr 1fr" gap={6} sx={{ justifyContent: 'space-between' }}>
      <Grid>
        <Text>Liquidation Price</Text>
        <Heading>$ {liqPrice}</Heading>
        <Text>After: ${afterLiqPrice}</Text>
      </Grid>

      <Grid sx={{ textAlign: 'right' }}>
        <Text>Collateralization Ratio</Text>
        <Heading>{collRatio}</Heading>
        <Text>After: {afterCollRatio}</Text>
      </Grid>

      <Grid>
        <Text>Current ETH/USD Price in 9 mins</Text>
        <Heading>${collPrice}</Heading>
        <Text>Next price: $--:--</Text>
      </Grid>

      <Grid sx={{ textAlign: 'right' }}>
        <Text>Collateral Locked</Text>
        <Heading>
          {locked} {token}
        </Heading>
        <Text>$ {lockedUSD}</Text>
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
    maxGenerateAmount,
    paybackAmount,
    maxPaybackAmount,
    collateralPrice,
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

  function clearGenerate(change: (ch: ManualChange) => void) {
    change({
      kind: 'generateAmount',
      generateAmount: undefined,
    })
  }

  function clearPayback(change: (ch: ManualChange) => void) {
    change({
      kind: 'paybackAmount',
      paybackAmount: undefined,
    })
  }

  function handleDepositChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')
      const depositAmount = value !== '' ? new BigNumber(value) : undefined
      const depositAmountUSD = depositAmount ? collateralPrice.times(depositAmount) : undefined

      clearPayback(change)
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

      clearPayback(change)
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
      clearPayback(change)
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

      clearGenerate(change)
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

      clearGenerate(change)
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
      clearGenerate(change)
      clearDeposit(change)
      change({ kind: 'withdrawAmount', withdrawAmount: maxWithdrawAmount })
      change({ kind: 'withdrawAmountUSD', withdrawAmountUSD: maxWithdrawAmountUSD })
    }
  }

  function handleGenerateChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')
      const generateAmount = value !== '' ? new BigNumber(value) : undefined
      clearWithdraw(change)
      change({
        kind: 'generateAmount',
        generateAmount,
      })
    }
  }

  function handleGenerateMax(change: (ch: ManualChange) => void) {
    return () => {
      clearWithdraw(change)
      change({ kind: 'generateAmount', generateAmount: maxGenerateAmount })
    }
  }

  function handlePaybackChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')
      const paybackAmount = value !== '' ? new BigNumber(value) : undefined
      clearDeposit(change)
      change({
        kind: 'paybackAmount',
        paybackAmount,
      })
    }
  }

  function handlePaybackMax(change: (ch: ManualChange) => void) {
    return () => {
      clearDeposit(change)
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
      <VaultActionInput
        action="Generate"
        amount={generateAmount}
        token={'DAI'}
        showMax={true}
        maxAmount={maxGenerateAmount}
        maxAmountLabel={'Maximum'}
        onSetMax={handleGenerateMax(change!)}
        onChange={handleGenerateChange(change!)}
        hasError={false}
      />
      <VaultActionInput
        action="Payback"
        amount={paybackAmount}
        token={'DAI'}
        showMax={true}
        maxAmount={maxPaybackAmount}
        maxAmountLabel={'Maximum'}
        onSetMax={handlePaybackMax(change!)}
        onChange={handlePaybackChange(change!)}
        hasError={false}
      />
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

function ManageVaultFormProxy({
  stage,
  proxyConfirmations,
  safeConfirmations,
  proxyTxHash,
  etherscan,
  progress,
}: ManageVaultState) {
  const isLoading = stage === 'proxyInProgress' || stage === 'proxyWaitingForApproval'

  const canProgress = !!progress
  function handleProgress(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    if (canProgress) progress!()
  }

  const buttonText =
    stage === 'proxySuccess'
      ? 'Continue'
      : stage === 'proxyFailure'
      ? 'Retry Create Proxy'
      : stage === 'proxyWaitingForConfirmation'
      ? 'Create Proxy'
      : 'Creating Proxy'

  return (
    <Grid>
      <Button disabled={!canProgress} onClick={handleProgress}>
        {isLoading ? (
          <Flex sx={{ justifyContent: 'center' }}>
            <Spinner size={25} color="surface" />
            <Text pl={2}>{buttonText}</Text>
          </Flex>
        ) : (
          <Text>{buttonText}</Text>
        )}
      </Button>
      {stage === 'proxyInProgress' && (
        <Card sx={{ backgroundColor: 'warning', border: 'none' }}>
          <Flex sx={{ alignItems: 'center' }}>
            <Spinner size={25} color="onWarning" />
            <Grid pl={2} gap={1}>
              <Text color="onWarning" sx={{ fontSize: 1 }}>
                {proxyConfirmations || 0} of {safeConfirmations}: Proxy deployment confirming
              </Text>
              <Link
                href={`${etherscan}/tx/${proxyTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Text color="onWarning" sx={{ fontSize: 1 }}>
                  View on etherscan -{'>'}
                </Text>
              </Link>
            </Grid>
          </Flex>
        </Card>
      )}
      {stage === 'proxySuccess' && (
        <Card sx={{ backgroundColor: 'success', border: 'none' }}>
          <Flex sx={{ alignItems: 'center' }}>
            <Icon name="checkmark" size={25} color="onSuccess" />
            <Grid pl={2} gap={1}>
              <Text color="onSuccess" sx={{ fontSize: 1 }}>
                {safeConfirmations} of {safeConfirmations}: Proxy deployment confirmed
              </Text>
              <Link
                href={`${etherscan}/tx/${proxyTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Text color="onSuccess" sx={{ fontSize: 1 }}>
                  View on etherscan -{'>'}
                </Text>
              </Link>
            </Grid>
          </Flex>
        </Card>
      )}
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
        {isProxyStage && <ManageVaultFormProxy {...props} />}
        {/*
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

  return (
    <Grid>
      <ManageVaultContainer {...manageVault} />
    </Grid>
  )
}
