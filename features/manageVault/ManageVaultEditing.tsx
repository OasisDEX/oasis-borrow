import { MinusIcon, PlusIcon, VaultActionInput } from 'components/vault/VaultActionInput'
import { handleNumericInput } from 'helpers/input'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Button, Divider, Grid, Text } from 'theme-ui'

import { ManageVaultState } from './manageVault'
import { ManageVaultChangesInformation } from './ManageVaultChangesInformation'

function DepositInput({
  maxDepositAmount,
  maxDepositAmountUSD,
  vault: { token },
  depositAmount,
  depositAmountUSD,
  updateDeposit,
  updateDepositUSD,
  updateDepositMax,
  priceInfo: { currentCollateralPrice },
  collapsed,
}: ManageVaultState & { collapsed?: boolean }) {
  return (
    <VaultActionInput
      collapsed={collapsed}
      action="Deposit"
      token={token}
      tokenUsdPrice={currentCollateralPrice}
      showMax={true}
      hasAuxiliary={true}
      onSetMax={updateDepositMax!}
      maxAmountLabel={'Balance'}
      amount={depositAmount}
      auxiliaryAmount={depositAmountUSD}
      maxAmount={maxDepositAmount}
      maxAuxiliaryAmount={maxDepositAmountUSD}
      onChange={handleNumericInput(updateDeposit!)}
      onAuxiliaryChange={handleNumericInput(updateDepositUSD!)}
      hasError={false}
    />
  )
}

function GenerateInput({
  generateAmount,
  accountIsController,
  maxGenerateAmount,
  updateGenerate,
  updateGenerateMax,
  collapsed,
}: ManageVaultState & { collapsed?: boolean }) {
  return (
    <VaultActionInput
      collapsed={collapsed}
      action="Generate"
      amount={generateAmount}
      token={'DAI'}
      showMax={true}
      disabled={!accountIsController}
      maxAmount={maxGenerateAmount}
      maxAmountLabel={'Max'}
      onSetMax={updateGenerateMax}
      onChange={handleNumericInput(updateGenerate!)}
      hasError={false}
    />
  )
}

function WithdrawInput({
  accountIsController,
  withdrawAmount,
  withdrawAmountUSD,
  maxWithdrawAmount,
  maxWithdrawAmountUSD,
  vault: { token },
  updateWithdraw,
  updateWithdrawUSD,
  updateWithdrawMax,
  priceInfo: { currentCollateralPrice },
  collapsed,
}: ManageVaultState & { collapsed?: boolean }) {
  return (
    <VaultActionInput
      collapsed={collapsed}
      action="Withdraw"
      showMax={true}
      hasAuxiliary={true}
      tokenUsdPrice={currentCollateralPrice}
      onSetMax={updateWithdrawMax}
      disabled={!accountIsController}
      amount={withdrawAmount}
      auxiliaryAmount={withdrawAmountUSD}
      maxAmount={maxWithdrawAmount}
      maxAmountLabel={'Max'}
      maxAuxiliaryAmount={maxWithdrawAmountUSD}
      token={token}
      hasError={false}
      onChange={handleNumericInput(updateWithdraw!)}
      onAuxiliaryChange={handleNumericInput(updateWithdrawUSD!)}
    />
  )
}

function PaybackInput({
  paybackAmount,
  maxPaybackAmount,
  updatePayback,
  updatePaybackMax,
  collapsed,
}: ManageVaultState & { collapsed?: boolean }) {
  return (
    <VaultActionInput
      collapsed={collapsed}
      action="Payback"
      amount={paybackAmount}
      token={'DAI'}
      showMax={true}
      maxAmount={maxPaybackAmount}
      maxAmountLabel={'Max'}
      onSetMax={updatePaybackMax}
      onChange={handleNumericInput(updatePayback!)}
      hasError={false}
    />
  )
}

export function ManageVaultEditing(props: ManageVaultState) {
  const { t } = useTranslation()

  const {
    depositAmount,
    withdrawAmount,
    generateAmount,
    paybackAmount,
    stage,
    vault: { token },
    toggleDepositAndGenerateOption,
    togglePaybackAndWithdrawOption,
    showDepositAndGenerateOption,
    showPaybackAndWithdrawOption,
    accountIsController,
    inputAmountsEmpty,
    mainAction,
  } = props

  const disableDepositAndGenerate = paybackAmount || withdrawAmount || showPaybackAndWithdrawOption
  const disablePaybackAndWithdraw = depositAmount || generateAmount || showDepositAndGenerateOption

  const isDaiEditing = stage === 'daiEditing'

  const showDepositAndGenerateInput = mainAction === 'depositGenerate'
  const showWithdrawAndPaybackInput = mainAction === 'withdrawPayback'

  const showDepositAndGenerateOptionButton =
    (depositAmount || generateAmount) && accountIsController
  const showPaybackAndWithdrawOptionButton =
    (paybackAmount || withdrawAmount) && accountIsController

  return (
    <Grid gap={4}>
      {showDepositAndGenerateInput && (
        <Box
          sx={{
            opacity: disableDepositAndGenerate ? 0.5 : 1,
            pointerEvents: disableDepositAndGenerate ? 'none' : 'auto',
          }}
        >
          {isDaiEditing ? <GenerateInput {...props} /> : <DepositInput {...props} />}
          {showDepositAndGenerateOptionButton && (
            <Box>
              <Button
                variant={showDepositAndGenerateOption ? 'actionOptionOpened' : 'actionOption'}
                mt={3}
                onClick={toggleDepositAndGenerateOption!}
              >
                {showDepositAndGenerateOption ? <MinusIcon /> : <PlusIcon />}
                <Text pr={1}>
                  {t('manage-vault.action-option', {
                    action: isDaiEditing ? t('vault-actions.deposit') : t('vault-actions.generate'),
                    token: isDaiEditing ? token : 'DAI',
                  })}
                </Text>
              </Button>
              {showDepositAndGenerateOption &&
                (!!depositAmount || !!generateAmount) &&
                (isDaiEditing ? (
                  <DepositInput {...props} collapsed />
                ) : (
                  <GenerateInput {...props} collapsed />
                ))}
            </Box>
          )}
        </Box>
      )}

      {showWithdrawAndPaybackInput && (
        <Box
          sx={{
            opacity: disablePaybackAndWithdraw ? 0.5 : 1,
            pointerEvents: disablePaybackAndWithdraw ? 'none' : 'auto',
          }}
        >
          {isDaiEditing ? <PaybackInput {...props} /> : <WithdrawInput {...props} />}
          {showPaybackAndWithdrawOptionButton && (
            <Box>
              <Button
                variant={showPaybackAndWithdrawOption ? 'actionOptionOpened' : 'actionOption'}
                mt={3}
                onClick={togglePaybackAndWithdrawOption!}
              >
                {showPaybackAndWithdrawOption ? <MinusIcon /> : <PlusIcon />}
                <Text pr={1}>
                  {t('manage-vault.action-option', {
                    action: isDaiEditing ? t('vault-actions.withdraw') : t('vault-actions.payback'),
                    token: isDaiEditing ? token : 'DAI',
                  })}
                </Text>
              </Button>
              {showPaybackAndWithdrawOption &&
                (!!paybackAmount || !!withdrawAmount) &&
                (isDaiEditing ? (
                  <WithdrawInput {...props} collapsed />
                ) : (
                  <PaybackInput {...props} collapsed />
                ))}
            </Box>
          )}
        </Box>
      )}
      {!inputAmountsEmpty && <Divider />}
      <ManageVaultChangesInformation {...props} />
    </Grid>
  )
}
