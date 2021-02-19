import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { getToken } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { VaultActionInput } from 'components/VaultActionInput'
import { BigNumberInput } from 'helpers/BigNumberInput'
import { formatAmount, formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { zero } from 'helpers/zero'
import React, { useState } from 'react'
import { createNumberMask } from 'text-mask-addons'
import { Box, Button, Card, Flex, Grid, Heading, Label, Link, Radio, Spinner, Text } from 'theme-ui'
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
    accountIsController,
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
      clearPayback(change)
      clearWithdraw(change)
      change({
        kind: 'generateAmount',
        generateAmount,
      })
    }
  }

  function handleGenerateMax(change: (ch: ManualChange) => void) {
    return () => {
      clearPayback(change)
      clearWithdraw(change)
      change({ kind: 'generateAmount', generateAmount: maxGenerateAmount })
    }
  }

  function handlePaybackChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')
      const paybackAmount = value !== '' ? new BigNumber(value) : undefined
      clearGenerate(change)
      clearDeposit(change)
      change({
        kind: 'paybackAmount',
        paybackAmount,
      })
    }
  }

  function handlePaybackMax(change: (ch: ManualChange) => void) {
    return () => {
      clearGenerate(change)
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
        disabled={!accountIsController}
        amount={withdrawAmount}
        auxiliaryAmount={withdrawAmountUSD}
        maxAmount={maxWithdrawAmount}
        maxAmountLabel={'Free'}
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
        disabled={!accountIsController}
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

function ManageVaultFormCollateralAllowance({
  stage,
  collateralAllowanceTxHash,
  etherscan,
  progress,
  token,
  collateralAllowanceAmount,
  change,
  errorMessages,
  depositAmount,
}: ManageVaultState) {
  const [isCustom, setIsCustom] = useState<Boolean>(false)

  const isLoading =
    stage === 'collateralAllowanceInProgress' || stage === 'collateralAllowanceWaitingForApproval'
  const canSelectRadio =
    stage === 'collateralAllowanceWaitingForConfirmation' || stage === 'collateralAllowanceFailure'
  const canProgress = !!progress
  function handleProgress(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    if (canProgress) progress!()
  }

  function handleCustomCollateralAllowanceChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')
      change({
        kind: 'collateralAllowanceAmount',
        collateralAllowanceAmount: value !== '' ? new BigNumber(value) : undefined,
      })
    }
  }

  function handleUnlimited() {
    if (canSelectRadio) {
      setIsCustom(false)
      change!({ kind: 'collateralAllowanceAmount', collateralAllowanceAmount: maxUint256 })
    }
  }

  function handleDeposit() {
    if (canSelectRadio) {
      setIsCustom(false)
      change!({ kind: 'collateralAllowanceAmount', collateralAllowanceAmount: depositAmount })
    }
  }

  function handleCustom() {
    if (canSelectRadio) {
      change!({ kind: 'collateralAllowanceAmount', collateralAllowanceAmount: undefined })
      setIsCustom(true)
    }
  }

  const errorString = errorMessages.join(',\n')

  const hasError = !!errorString
  const buttonText =
    stage === 'collateralAllowanceSuccess'
      ? 'Continue'
      : stage === 'collateralAllowanceFailure'
      ? 'Retry Allowance approval'
      : stage === 'collateralAllowanceWaitingForConfirmation'
      ? 'Approve Allowance'
      : 'Approving Allowance'

  return (
    <Grid>
      {canSelectRadio && (
        <>
          <Label sx={{ border: 'light', p: 2, borderRadius: 'small' }} onClick={handleUnlimited}>
            <Radio name="dark-mode" value="true" defaultChecked={true} />
            <Text sx={{ fontSize: 2 }}>Unlimited Allowance</Text>
          </Label>
          <Label sx={{ border: 'light', p: 2, borderRadius: 'small' }} onClick={handleDeposit}>
            <Radio name="dark-mode" value="true" />
            <Text sx={{ fontSize: 2 }}>
              {token} depositing ({formatCryptoBalance(depositAmount!)})
            </Text>
          </Label>
          <Label sx={{ border: 'light', p: 2, borderRadius: 'small' }} onClick={handleCustom}>
            <Radio name="dark-mode" value="true" />
            <Grid columns="2fr 2fr 1fr" sx={{ alignItems: 'center' }}>
              <Text sx={{ fontSize: 2 }}>Custom</Text>
              <BigNumberInput
                sx={{ p: 1, borderRadius: 'small', width: '100px', fontSize: 1 }}
                disabled={!isCustom}
                value={
                  collateralAllowanceAmount && isCustom
                    ? formatAmount(collateralAllowanceAmount, getToken(token).symbol)
                    : null
                }
                mask={createNumberMask({
                  allowDecimal: true,
                  decimalLimit: getToken(token).digits,
                  prefix: '',
                })}
                onChange={handleCustomCollateralAllowanceChange(change!)}
              />
              <Text sx={{ fontSize: 1 }}>{token}</Text>
            </Grid>
          </Label>
        </>
      )}
      {hasError && (
        <>
          <Text sx={{ flexWrap: 'wrap', fontSize: 2, color: 'onError' }}>{errorString}</Text>
        </>
      )}

      <Button disabled={!canProgress || hasError} onClick={handleProgress}>
        {isLoading ? (
          <Flex sx={{ justifyContent: 'center' }}>
            <Spinner size={25} color="surface" />
            <Text pl={2}>{buttonText}</Text>
          </Flex>
        ) : (
          <Text>{buttonText}</Text>
        )}
      </Button>
      {stage === 'collateralAllowanceInProgress' && (
        <Card sx={{ backgroundColor: 'warning', border: 'none' }}>
          <Flex sx={{ alignItems: 'center' }}>
            <Spinner size={25} color="onWarning" />
            <Grid pl={2} gap={1}>
              <Text color="onWarning" sx={{ fontSize: 1 }}>
                Setting Allowance for {token}
              </Text>
              <Link
                href={`${etherscan}/tx/${collateralAllowanceTxHash}`}
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
      {stage === 'collateralAllowanceSuccess' && (
        <Card sx={{ backgroundColor: 'success', border: 'none' }}>
          <Flex sx={{ alignItems: 'center' }}>
            <Icon name="checkmark" size={25} color="onSuccess" />
            <Grid pl={2} gap={1}>
              <Text color="onSuccess" sx={{ fontSize: 1 }}>
                Set Allowance for {token}
              </Text>
              <Link
                href={`${etherscan}/tx/${collateralAllowanceTxHash}`}
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

function ManageVaultFormDaiAllowance({
  stage,
  daiAllowanceTxHash,
  etherscan,
  progress,
  daiAllowanceAmount,
  change,
  errorMessages,
  paybackAmount,
}: ManageVaultState) {
  const [isCustom, setIsCustom] = useState<Boolean>(false)

  const isLoading = stage === 'daiAllowanceInProgress' || stage === 'daiAllowanceWaitingForApproval'
  const canSelectRadio =
    stage === 'daiAllowanceWaitingForConfirmation' || stage === 'daiAllowanceFailure'
  const canProgress = !!progress
  function handleProgress(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    if (canProgress) progress!()
  }

  function handleCustomDaiAllowanceChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')
      change({
        kind: 'daiAllowanceAmount',
        daiAllowanceAmount: value !== '' ? new BigNumber(value) : undefined,
      })
    }
  }

  function handleUnlimited() {
    if (canSelectRadio) {
      setIsCustom(false)
      change!({ kind: 'daiAllowanceAmount', daiAllowanceAmount: maxUint256 })
    }
  }

  function handlePayback() {
    if (canSelectRadio) {
      setIsCustom(false)
      change!({ kind: 'daiAllowanceAmount', daiAllowanceAmount: paybackAmount })
    }
  }

  function handleCustom() {
    if (canSelectRadio) {
      change!({ kind: 'daiAllowanceAmount', daiAllowanceAmount: undefined })
      setIsCustom(true)
    }
  }

  const errorString = errorMessages.join(',\n')

  const hasError = !!errorString
  const buttonText =
    stage === 'daiAllowanceSuccess'
      ? 'Continue'
      : stage === 'daiAllowanceFailure'
      ? 'Retry Allowance approval'
      : stage === 'daiAllowanceWaitingForConfirmation'
      ? 'Approve Allowance'
      : 'Approving daiAllowance'

  return (
    <Grid>
      {canSelectRadio && (
        <>
          <Label sx={{ border: 'light', p: 2, borderRadius: 'small' }} onClick={handleUnlimited}>
            <Radio name="dark-mode" value="true" defaultChecked={true} />
            <Text sx={{ fontSize: 2 }}>Unlimited Allowance</Text>
          </Label>
          <Label sx={{ border: 'light', p: 2, borderRadius: 'small' }} onClick={handlePayback}>
            <Radio name="dark-mode" value="true" />
            <Text sx={{ fontSize: 2 }}>
              DAI paying back ({formatCryptoBalance(paybackAmount!)})
            </Text>
          </Label>
          <Label sx={{ border: 'light', p: 2, borderRadius: 'small' }} onClick={handleCustom}>
            <Radio name="dark-mode" value="true" />
            <Grid columns="2fr 2fr 1fr" sx={{ alignItems: 'center' }}>
              <Text sx={{ fontSize: 2 }}>Custom</Text>
              <BigNumberInput
                sx={{ p: 1, borderRadius: 'small', width: '100px', fontSize: 1 }}
                disabled={!isCustom}
                value={
                  daiAllowanceAmount && isCustom
                    ? formatAmount(daiAllowanceAmount, getToken('DAI').symbol)
                    : null
                }
                mask={createNumberMask({
                  allowDecimal: true,
                  decimalLimit: getToken('DAI').digits,
                  prefix: '',
                })}
                onChange={handleCustomDaiAllowanceChange(change!)}
              />
              <Text sx={{ fontSize: 1 }}>DAI</Text>
            </Grid>
          </Label>
        </>
      )}
      {hasError && (
        <>
          <Text sx={{ flexWrap: 'wrap', fontSize: 2, color: 'onError' }}>{errorString}</Text>
        </>
      )}

      <Button disabled={!canProgress || hasError} onClick={handleProgress}>
        {isLoading ? (
          <Flex sx={{ justifyContent: 'center' }}>
            <Spinner size={25} color="surface" />
            <Text pl={2}>{buttonText}</Text>
          </Flex>
        ) : (
          <Text>{buttonText}</Text>
        )}
      </Button>
      {stage === 'daiAllowanceInProgress' && (
        <Card sx={{ backgroundColor: 'warning', border: 'none' }}>
          <Flex sx={{ alignItems: 'center' }}>
            <Spinner size={25} color="onWarning" />
            <Grid pl={2} gap={1}>
              <Text color="onWarning" sx={{ fontSize: 1 }}>
                Setting Allowance for DAI
              </Text>
              <Link
                href={`${etherscan}/tx/${daiAllowanceTxHash}`}
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
      {stage === 'daiAllowanceSuccess' && (
        <Card sx={{ backgroundColor: 'success', border: 'none' }}>
          <Flex sx={{ alignItems: 'center' }}>
            <Icon name="checkmark" size={25} color="onSuccess" />
            <Grid pl={2} gap={1}>
              <Text color="onSuccess" sx={{ fontSize: 1 }}>
                Set Allowance for DAI
              </Text>
              <Link
                href={`${etherscan}/tx/${daiAllowanceTxHash}`}
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
  console.log(props)
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
        {isCollateralAllowanceStage && <ManageVaultFormCollateralAllowance {...props} />}
        {isDaiAllowanceStage && <ManageVaultFormDaiAllowance {...props} />}

        {/*
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
