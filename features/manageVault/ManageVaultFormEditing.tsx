import { BigNumber } from 'bignumber.js'
import { VaultActionInput } from 'components/VaultActionInput'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button, Card, Grid, Text } from 'theme-ui'
import { ManageVaultState, ManualChange } from './manageVault'

function DepositInput({
  currentCollateralPrice,
  change,
  clearPaybackAndWithdraw,
  maxDepositAmount,
  maxDepositAmountUSD,
  token,
  depositAmount,
  depositAmountUSD,
}: ManageVaultState) {
  function handleDepositChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')
      const depositAmount = value !== '' ? new BigNumber(value) : undefined
      const depositAmountUSD = depositAmount
        ? currentCollateralPrice.times(depositAmount)
        : undefined

      clearPaybackAndWithdraw!()
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
          ? depositAmountUSD.div(currentCollateralPrice)
          : undefined

      clearPaybackAndWithdraw!()
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
      clearPaybackAndWithdraw!()
      change({ kind: 'depositAmount', depositAmount: maxDepositAmount })
      change({ kind: 'depositAmountUSD', depositAmountUSD: maxDepositAmountUSD })
    }
  }

  return (
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
  )
}

function GenerateInput({
  generateAmount,
  accountIsController,
  maxGenerateAmount,
  clearPaybackAndWithdraw,
  change,
}: ManageVaultState) {
  function handleGenerateChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')
      const generateAmount = value !== '' ? new BigNumber(value) : undefined
      clearPaybackAndWithdraw!()
      change({
        kind: 'generateAmount',
        generateAmount,
      })
    }
  }

  function handleGenerateMax(change: (ch: ManualChange) => void) {
    return () => {
      clearPaybackAndWithdraw!()
      change({ kind: 'generateAmount', generateAmount: maxGenerateAmount })
    }
  }

  return (
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
  )
}

function WithdrawInput({
  currentCollateralPrice,
  change,
  accountIsController,
  withdrawAmount,
  withdrawAmountUSD,
  maxWithdrawAmount,
  maxWithdrawAmountUSD,
  token,
  clearDepositAndGenerate,
}: ManageVaultState) {
  function handleWithdrawChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')
      const withdrawAmount = value !== '' ? new BigNumber(value) : undefined
      const withdrawAmountUSD = withdrawAmount
        ? currentCollateralPrice.times(withdrawAmount)
        : undefined

      clearDepositAndGenerate!()
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
          ? withdrawAmountUSD.div(currentCollateralPrice)
          : undefined

      clearDepositAndGenerate!()
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
      clearDepositAndGenerate!()
      change({ kind: 'withdrawAmount', withdrawAmount: maxWithdrawAmount })
      change({ kind: 'withdrawAmountUSD', withdrawAmountUSD: maxWithdrawAmountUSD })
    }
  }

  return (
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
  )
}
function PaybackInput({
  paybackAmount,
  maxPaybackAmount,
  change,
  clearDepositAndGenerate,
}: ManageVaultState) {
  function handlePaybackChange(change: (ch: ManualChange) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/,/g, '')
      const paybackAmount = value !== '' ? new BigNumber(value) : undefined
      clearDepositAndGenerate!()
      change({
        kind: 'paybackAmount',
        paybackAmount,
      })
    }
  }

  function handlePaybackMax(change: (ch: ManualChange) => void) {
    return () => {
      clearDepositAndGenerate!()
      change({ kind: 'paybackAmount', paybackAmount: maxPaybackAmount })
    }
  }

  return (
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
  )
}

export function ManageVaultFormEditing(props: ManageVaultState) {
  const {
    depositAmount,
    withdrawAmount,
    generateAmount,
    paybackAmount,
    errorMessages,
    warningMessages,
    progress,
  } = props

  function handleProgress(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    progress!()
  }

  const { t } = useTranslation()

  const errorString = errorMessages.join(',\n')
  const warningString = warningMessages.join(',\n')

  const hasError = !!errorString
  const hasWarnings = !!warningString

  const showDepositAndGenerate = !paybackAmount && !withdrawAmount
  const showPaybackAndWithdraw = !depositAmount && !generateAmount

  return (
    <Grid>
      {showDepositAndGenerate && (
        <>
          <DepositInput {...props} />
          <GenerateInput {...props} />
        </>
      )}
      {showPaybackAndWithdraw && (
        <>
          <WithdrawInput {...props} />
          <PaybackInput {...props} />
        </>
      )}
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
      <Button onClick={handleProgress} disabled={hasError}>
        {t('confirm')}
      </Button>
    </Grid>
  )
}
