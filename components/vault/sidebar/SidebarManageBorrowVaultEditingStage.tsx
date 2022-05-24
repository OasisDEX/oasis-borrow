import { ActionPills } from 'components/ActionPills'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { ManageVaultChangesInformation } from 'features/borrow/manage/containers/ManageVaultChangesInformation'
import { ManageStandardBorrowVaultState } from 'features/borrow/manage/pipes/manageVault'
import { handleNumericInput } from 'helpers/input'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'
import { Grid } from 'theme-ui'

interface FieldProps extends ManageStandardBorrowVaultState {
  disabled?: boolean
}

function FieldDeposit({
  maxDepositAmount,
  maxDepositAmountUSD,
  vault: { token },
  depositAmount,
  depositAmountUSD,
  updateDeposit,
  updateDepositUSD,
  updateDepositMax,
  priceInfo: { currentCollateralPrice },
  disabled = false,
}: FieldProps) {
  return (
    <VaultActionInput
      action="Deposit"
      token={token}
      tokenUsdPrice={currentCollateralPrice}
      showMax={true}
      hasAuxiliary={true}
      onSetMax={updateDepositMax!}
      amount={depositAmount}
      auxiliaryAmount={depositAmountUSD}
      onChange={handleNumericInput(updateDeposit!)}
      onAuxiliaryChange={handleNumericInput(updateDepositUSD!)}
      maxAmount={maxDepositAmount}
      maxAuxiliaryAmount={maxDepositAmountUSD}
      maxAmountLabel={'Balance'}
      hasError={false}
      disabled={disabled}
    />
  )
}

function FieldGenerate({
  generateAmount,
  maxGenerateAmount,
  updateGenerate,
  updateGenerateMax,
  ilkData: { debtFloor },
  disabled = false,
}: FieldProps) {
  return (
    <VaultActionInput
      action="Generate"
      amount={generateAmount}
      token={'DAI'}
      showMin={true}
      minAmount={debtFloor}
      minAmountLabel={'From'}
      onSetMin={() => {
        updateGenerate!(debtFloor)
      }}
      showMax={true}
      maxAmount={maxGenerateAmount}
      onSetMax={updateGenerateMax}
      onChange={handleNumericInput(updateGenerate!)}
      hasError={false}
      disabled={disabled}
    />
  )
}

function FieldWithdraw({
  withdrawAmount,
  withdrawAmountUSD,
  maxWithdrawAmount,
  maxWithdrawAmountUSD,
  vault: { token },
  updateWithdraw,
  updateWithdrawUSD,
  updateWithdrawMax,
  priceInfo: { currentCollateralPrice },
  disabled = false,
}: FieldProps) {
  return (
    <VaultActionInput
      action="Withdraw"
      showMax={true}
      hasAuxiliary={true}
      tokenUsdPrice={currentCollateralPrice}
      onSetMax={updateWithdrawMax}
      amount={withdrawAmount}
      auxiliaryAmount={withdrawAmountUSD}
      maxAmount={maxWithdrawAmount}
      maxAmountLabel={'Max'}
      maxAuxiliaryAmount={maxWithdrawAmountUSD}
      token={token}
      hasError={false}
      onChange={handleNumericInput(updateWithdraw!)}
      onAuxiliaryChange={handleNumericInput(updateWithdrawUSD!)}
      disabled={disabled}
    />
  )
}

function FieldPayback({
  paybackAmount,
  maxPaybackAmount,
  updatePayback,
  updatePaybackMax,
  disabled = false,
}: FieldProps) {
  return (
    <VaultActionInput
      action="Payback"
      amount={paybackAmount}
      token={'DAI'}
      showMax={true}
      maxAmount={maxPaybackAmount}
      maxAmountLabel={'Max'}
      onSetMax={updatePaybackMax}
      onChange={handleNumericInput(updatePayback!)}
      hasError={false}
      disabled={disabled}
    />
  )
}

export function SidebarManageBorrowVaultEditingStage(props: ManageStandardBorrowVaultState) {
  const { t } = useTranslation()

  const {
    stage,
    setMainAction,
    mainAction,
    depositAmount,
    withdrawAmount,
    generateAmount,
    paybackAmount,
    showDepositAndGenerateOption,
    showPaybackAndWithdrawOption,
    toggleDepositAndGenerateOption,
    togglePaybackAndWithdrawOption,
    accountIsConnected,
    accountIsController,
  } = props

  const [isSecondaryFieldDisabled, setIsSecondaryFieldDisabled] = useState<boolean>(true)

  const isOwner = accountIsConnected && accountIsController
  const isCollateralEditing = stage === 'collateralEditing'
  const isDaiEditing = stage === 'daiEditing'
  const isDepositOrGenerate = mainAction === 'depositGenerate'
  const isWithdrawOrPayback = mainAction === 'withdrawPayback'
  const hasDeposit = !depositAmount || depositAmount.isZero()
  const hasWithdraw = !withdrawAmount || withdrawAmount.isZero()
  const hasGenerate = !generateAmount || generateAmount.isZero()
  const hasPayback = !paybackAmount || paybackAmount.isZero()

  useEffect(() => {
    if (
      (isCollateralEditing &&
        ((isDepositOrGenerate && hasDeposit) || (isWithdrawOrPayback && hasWithdraw))) ||
      (isDaiEditing &&
        ((isDepositOrGenerate && hasGenerate) || (isWithdrawOrPayback && hasPayback)))
    ) {
      setIsSecondaryFieldDisabled(true)
    } else {
      if (!showDepositAndGenerateOption) toggleDepositAndGenerateOption!()
      if (!showPaybackAndWithdrawOption) togglePaybackAndWithdrawOption!()
      setIsSecondaryFieldDisabled(false)
    }
  }, [depositAmount, withdrawAmount, generateAmount, paybackAmount])

  return (
    <Grid gap={3}>
      <ActionPills
        active={mainAction}
        items={[
          {
            id: 'depositGenerate',
            label: isCollateralEditing ? t('vault-actions.deposit') : t('vault-actions.generate'),
            action: () => {
              setMainAction!('depositGenerate')
            },
          },
          {
            id: 'withdrawPayback',
            label: isCollateralEditing ? t('vault-actions.withdraw') : t('vault-actions.payback'),
            action: () => {
              setMainAction!('withdrawPayback')
            },
          },
        ]}
      />
      {isCollateralEditing && (
        <>
          {isDepositOrGenerate && (
            <>
              <FieldDeposit {...props} />
              {isOwner && <FieldGenerate disabled={isSecondaryFieldDisabled} {...props} />}
            </>
          )}
          {isWithdrawOrPayback && (
            <>
              <FieldWithdraw {...props} disabled={!isOwner} />
              {isOwner && <FieldPayback disabled={isSecondaryFieldDisabled} {...props} />}
            </>
          )}
        </>
      )}
      {isDaiEditing && (
        <>
          {isDepositOrGenerate && (
            <>
              <FieldGenerate {...props} disabled={!isOwner} />
              {isOwner && <FieldDeposit disabled={isSecondaryFieldDisabled} {...props} />}
            </>
          )}
          {isWithdrawOrPayback && (
            <>
              <FieldPayback {...props} />
              {isOwner && <FieldWithdraw disabled={isSecondaryFieldDisabled} {...props} />}
            </>
          )}
        </>
      )}
      <ManageVaultChangesInformation {...props} />
    </Grid>
  )
}
