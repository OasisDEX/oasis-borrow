import { ActionPills } from 'components/ActionPills'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { ManageVaultChangesInformation } from 'features/borrow/manage/containers/ManageVaultChangesInformation'
import { ManageStandardBorrowVaultState } from 'features/borrow/manage/pipes/manageVault'
import { handleNumericInput } from 'helpers/input'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'
import { Grid } from 'theme-ui'

import { SidebarResetButton } from './SidebarResetButton'

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
  const { t } = useTranslation()

  return (
    <VaultActionInput
      action="Deposit"
      token={token}
      tokenUsdPrice={currentCollateralPrice}
      showMax={true}
      hasAuxiliary={true}
      onSetMax={updateDepositMax}
      amount={depositAmount}
      auxiliaryAmount={depositAmountUSD}
      onChange={handleNumericInput(updateDeposit!)}
      onAuxiliaryChange={handleNumericInput(updateDepositUSD!)}
      maxAmount={maxDepositAmount}
      maxAuxiliaryAmount={maxDepositAmountUSD}
      maxAmountLabel={t('Balance')}
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
  const { t } = useTranslation()

  return (
    <VaultActionInput
      action="Generate"
      amount={generateAmount}
      token="DAI"
      showMin={true}
      minAmount={debtFloor}
      minAmountLabel={t('from')}
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
  const { t } = useTranslation()

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
      maxAmountLabel={t('max')}
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
  const { t } = useTranslation()

  return (
    <VaultActionInput
      action="Payback"
      amount={paybackAmount}
      token="DAI"
      showMax={true}
      maxAmount={maxPaybackAmount}
      maxAmountLabel={t('max')}
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
    updateDeposit,
    withdrawAmount,
    updateWithdraw,
    generateAmount,
    updateGenerate,
    paybackAmount,
    updatePayback,
    showDepositAndGenerateOption,
    showPaybackAndWithdrawOption,
    toggleDepositAndGenerateOption,
    togglePaybackAndWithdrawOption,
    accountIsController,
    accountIsConnected,
    inputAmountsEmpty,
  } = props

  const [isSecondaryFieldDisabled, setIsSecondaryFieldDisabled] = useState<boolean>(true)

  const isOwner = accountIsConnected && accountIsController
  const isCollateralEditing = stage === 'collateralEditing'
  const isDaiEditing = stage === 'daiEditing'
  const isDepositOrGenerate = mainAction === 'depositGenerate'
  const isWithdrawOrPayback = mainAction === 'withdrawPayback'

  useEffect(() => {
    if (inputAmountsEmpty) setIsSecondaryFieldDisabled(true)
    else {
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
              <FieldGenerate disabled={isSecondaryFieldDisabled || !isOwner} {...props} />
            </>
          )}
          {isWithdrawOrPayback && (
            <>
              <FieldWithdraw {...props} disabled={!isOwner} />
              <FieldPayback disabled={isSecondaryFieldDisabled} {...props} />
            </>
          )}
        </>
      )}
      {isDaiEditing && (
        <>
          {isDepositOrGenerate && (
            <>
              <FieldGenerate {...props} disabled={!isOwner} />
              <FieldDeposit disabled={isSecondaryFieldDisabled} {...props} />
            </>
          )}
          {isWithdrawOrPayback && (
            <>
              <FieldPayback {...props} />
              <FieldWithdraw disabled={isSecondaryFieldDisabled || !isOwner} {...props} />
            </>
          )}
        </>
      )}
      {!inputAmountsEmpty && (
        <SidebarResetButton
          clear={() => {
            updateDeposit!()
            updateWithdraw!()
            updateGenerate!()
            updatePayback!()
          }}
        />
      )}
      <ManageVaultChangesInformation {...props} />
    </Grid>
  )
}
