import BigNumber from 'bignumber.js'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { ManageStandardBorrowVaultState } from 'features/borrow/manage/pipes/manageVault'
import { OpenVaultState } from 'features/borrow/open/pipes/openVault'
import { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { OpenMultiplyVaultState } from 'features/multiply/open/pipes/openMultiplyVault'
import { handleNumericInput } from 'helpers/input'
import { useTranslation } from 'next-i18next'
import { pick } from 'ramda'
import React from 'react'

type VaultState =
  | OpenVaultState
  | OpenMultiplyVaultState
  | ManageStandardBorrowVaultState
  | ManageMultiplyVaultState

interface FieldProps {
  disabled?: boolean
}

interface FieldDepositCollateralProps extends FieldProps {
  currentCollateralPrice: BigNumber
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
  maxDepositAmount: BigNumber
  maxDepositAmountUSD: BigNumber
  token: string
  updateDeposit?: () => void
  updateDepositAmount?: () => void
  updateDepositAmountMax?: () => void
  updateDepositAmountUSD?: () => void
  updateDepositMax?: () => void
  updateDepositUSD?: () => void
}

export function extractFieldDepositCollateralData(state: VaultState) {
  return {
    ...pick(
      [
        'depositAmount',
        'depositAmountUSD',
        'maxDepositAmount',
        'maxDepositAmountUSD',
        'token',
        'updateDeposit',
        'updateDepositAmount',
        'updateDepositAmountMax',
        'updateDepositAmountUSD',
        'updateDepositMax',
        'updateDepositUSD',
      ],
      state,
    ),
    currentCollateralPrice: state.priceInfo.currentCollateralPrice,
  }
}

export function FieldDepositCollateral({
  currentCollateralPrice,
  depositAmount,
  depositAmountUSD,
  maxDepositAmount,
  maxDepositAmountUSD,
  token,
  updateDeposit,
  updateDepositAmount,
  updateDepositAmountMax,
  updateDepositAmountUSD,
  updateDepositMax,
  updateDepositUSD,
  disabled = false,
}: FieldDepositCollateralProps) {
  const { t } = useTranslation()

  return (
    <VaultActionInput
      action="Deposit"
      amount={depositAmount}
      auxiliaryAmount={depositAmountUSD}
      hasAuxiliary={true}
      hasError={false}
      maxAmount={maxDepositAmount}
      maxAmountLabel={t('balance')}
      maxAuxiliaryAmount={maxDepositAmountUSD}
      onAuxiliaryChange={handleNumericInput(updateDepositUSD! || updateDepositAmountUSD!)}
      onChange={handleNumericInput(updateDeposit! || updateDepositAmount!)}
      onSetMax={updateDepositMax! || updateDepositAmountMax!}
      showMax={true}
      token={token}
      tokenUsdPrice={currentCollateralPrice}
      disabled={disabled}
    />
  )
}

interface FieldGenerateDaiProps extends FieldProps {
  debtFloor?: BigNumber
  generateAmount?: BigNumber
  maxGenerateAmount?: BigNumber
  updateGenerate?: (generateAmount?: BigNumber) => void
  updateGenerateAmount?: (generateAmount?: BigNumber) => void
  updateGenerateAmountMax?: () => void
  updateGenerateMax?: () => void
}

export function extractFieldGenerateDaiData(state: VaultState) {
  return {
    ...pick(
      [
        'disabled',
        'generateAmount',
        'maxGenerateAmount',
        'updateGenerate',
        'updateGenerateAmount',
        'updateGenerateAmountMax',
        'updateGenerateMax',
      ],
      state,
    ),
    debtFloor: state.ilkData.debtFloor,
  }
}

export function FieldGenerateDai({
  debtFloor,
  generateAmount,
  maxGenerateAmount,
  updateGenerate,
  updateGenerateMax,
  disabled = false,
}: FieldGenerateDaiProps) {
  const { t } = useTranslation()

  return (
    <VaultActionInput
      action="Generate"
      amount={generateAmount}
      disabled={disabled}
      hasError={false}
      maxAmount={maxGenerateAmount}
      minAmount={debtFloor}
      minAmountLabel={t('from')}
      onChange={handleNumericInput(updateGenerate!)}
      onSetMin={() => {
        updateGenerate!(debtFloor)
      }}
      onSetMax={updateGenerateMax!}
      showMax={true}
      showMin={true}
      token={'DAI'}
    />
  )
}

interface FieldWithdrawCollateralProps extends FieldProps {
  currentCollateralPrice: BigNumber
  maxWithdrawAmount?: BigNumber
  maxWithdrawAmountUSD?: BigNumber
  token: string
  updateWithdraw?: () => void
  updateWithdrawAmount?: () => void
  updateWithdrawAmountUSD?: () => void
  updateWithdrawAmountMax?: () => void
  updateWithdrawMax?: () => void
  updateWithdrawUSD?: () => void
  withdrawAmount?: BigNumber
  withdrawAmountUSD?: BigNumber
}

export function extractFieldWithdrawCollateralData(state: VaultState) {
  return {
    ...pick(
      [
        'maxWithdrawAmount',
        'maxWithdrawAmountUSD',
        'token',
        'updateWithdraw',
        'updateWithdrawAmount',
        'updateWithdrawAmountUSD',
        'updateWithdrawAmountMax',
        'updateWithdrawMax',
        'updateWithdrawUSD',
        'withdrawAmount',
        'withdrawAmountUSD',
      ],
      state,
    ),
    currentCollateralPrice: state.priceInfo.currentCollateralPrice,
  }
}

export function FieldWithdrawCollateral({
  currentCollateralPrice,
  maxWithdrawAmount,
  maxWithdrawAmountUSD,
  token,
  updateWithdraw,
  updateWithdrawAmount,
  updateWithdrawAmountUSD,
  updateWithdrawAmountMax,
  updateWithdrawMax,
  updateWithdrawUSD,
  withdrawAmount,
  withdrawAmountUSD,
  disabled = false,
}: FieldWithdrawCollateralProps) {
  const { t } = useTranslation()

  return (
    <VaultActionInput
      action="Withdraw"
      amount={withdrawAmount}
      auxiliaryAmount={withdrawAmountUSD}
      disabled={disabled}
      hasAuxiliary={true}
      hasError={false}
      maxAmount={maxWithdrawAmount}
      maxAmountLabel={t('max')}
      maxAuxiliaryAmount={maxWithdrawAmountUSD}
      onAuxiliaryChange={handleNumericInput(updateWithdrawUSD! || updateWithdrawAmountUSD!)}
      onChange={handleNumericInput(updateWithdraw! || updateWithdrawAmount!)}
      onSetMax={updateWithdrawMax! || updateWithdrawAmountMax!}
      showMax={true}
      token={token}
      tokenUsdPrice={currentCollateralPrice}
    />
  )
}

interface FieldPaybackDaiProps extends FieldProps {
  maxPaybackAmount?: BigNumber
  paybackAmount?: BigNumber
  updatePayback?: () => void
  updatePaybackMax?: () => void
}

export function extractFieldPaybackDaiData(state: VaultState) {
  return {
    ...pick(['maxPaybackAmount', 'paybackAmount', 'updatePayback', 'updatePaybackMax'], state),
  }
}

export function FieldPaybackDai({
  maxPaybackAmount,
  paybackAmount,
  updatePayback,
  updatePaybackMax,
  disabled = false,
}: FieldPaybackDaiProps) {
  const { t } = useTranslation()

  return (
    <VaultActionInput
      action="Payback"
      amount={paybackAmount}
      disabled={disabled}
      hasError={false}
      maxAmount={maxPaybackAmount}
      maxAmountLabel={t('max')}
      onChange={handleNumericInput(updatePayback!)}
      onSetMax={updatePaybackMax}
      showMax={true}
      token="DAI"
    />
  )
}
