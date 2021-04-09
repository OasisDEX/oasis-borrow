// @ts-ignore
import { Icon } from '@makerdao/dai-ui-icons'
import { VaultActionInput } from 'components/VaultActionInput'
import { handleNumericInput } from 'helpers/input'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Grid, Text } from 'theme-ui'

import { ManageVaultState } from './manageVault'

const PlusIcon = () => (
  <Icon
    name="plus"
    color="onSuccess"
    size={20}
    sx={{ display: 'inline', verticalAlign: 'bottom', marginRight: 1 }}
  />
)
const MinusIcon = () => (
  <Icon
    name="minus"
    color="onSuccess"
    size={20}
    sx={{ display: 'inline', verticalAlign: 'bottom', marginRight: 1 }}
  />
)

function DepositInput({
  maxDepositAmount,
  maxDepositAmountUSD,
  token,
  depositAmount,
  depositAmountUSD,
  updateDeposit,
  updateDepositUSD,
  updateDepositMax,
}: ManageVaultState) {
  return (
    <VaultActionInput
      action="Deposit"
      token={token}
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
}: ManageVaultState) {
  return (
    <VaultActionInput
      action="Generate"
      amount={generateAmount}
      token={'DAI'}
      showMax={true}
      disabled={!accountIsController}
      maxAmount={maxGenerateAmount}
      maxAmountLabel={'Maximum'}
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
  token,
  updateWithdraw,
  updateWithdrawUSD,
  updateWithdrawMax,
}: ManageVaultState) {
  return (
    <VaultActionInput
      action="Withdraw"
      showMax={true}
      hasAuxiliary={true}
      onSetMax={updateWithdrawMax}
      disabled={!accountIsController}
      amount={withdrawAmount}
      auxiliaryAmount={withdrawAmountUSD}
      maxAmount={maxWithdrawAmount}
      maxAmountLabel={'Free'}
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
}: ManageVaultState) {
  return (
    <VaultActionInput
      action="Payback"
      amount={paybackAmount}
      token={'DAI'}
      showMax={true}
      maxAmount={maxPaybackAmount}
      maxAmountLabel={'Maximum'}
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
    token,
    toggleDepositAndGenerateOption,
    togglePaybackAndWithdrawOption,
    showDepositAndGenerateOption,
    showPaybackAndWithdrawOption,
  } = props

  const disableDepositAndGenerate = paybackAmount || withdrawAmount || showPaybackAndWithdrawOption
  const disablePaybackAndWithdraw = depositAmount || generateAmount || showDepositAndGenerateOption

  const inverted = stage === 'daiEditing'

  const showDepositAndGenerateOptionButton = depositAmount || generateAmount
  const showPaybackAndWithdrawOptionButton = paybackAmount || withdrawAmount

  return (
    <Grid>
      <Box
        sx={{
          opacity: disableDepositAndGenerate ? 0.5 : 1,
          pointerEvents: disableDepositAndGenerate ? 'none' : 'auto',
        }}
      >
        {inverted ? <GenerateInput {...props} /> : <DepositInput {...props} />}
        {showDepositAndGenerateOptionButton && (
          <Text
            mt={3}
            sx={{
              cursor: 'pointer',
              fontSize: 3,
              fontWeight: 'semiBold',
              color: 'onSuccess',
              userSelect: 'none',
              lineHeight: 1.25,
            }}
            onClick={toggleDepositAndGenerateOption!}
          >
            {showDepositAndGenerateOption ? <MinusIcon /> : <PlusIcon />}
            {t('manage-vault.action-option', {
              action: inverted ? t('vault-actions.deposit') : t('vault-actions.generate'),
              token: inverted ? token : 'DAI',
            })}
          </Text>
        )}
        {showDepositAndGenerateOption &&
          (!!depositAmount || !!generateAmount) &&
          (inverted ? <DepositInput {...props} /> : <GenerateInput {...props} />)}
      </Box>

      <Flex sx={{ alignItems: 'center', justifyContent: 'space-evenly' }}>
        <Box sx={{ borderBottom: 'light', height: '0px', width: '100%' }} />
        <Text mx={3} sx={{ minWidth: 'fit-content' }}>
          {t('manage-vault.or')}
        </Text>
        <Box sx={{ borderBottom: 'light', height: '0px', width: '100%' }} />
      </Flex>

      <Box
        sx={{
          opacity: disablePaybackAndWithdraw ? 0.5 : 1,
          pointerEvents: disablePaybackAndWithdraw ? 'none' : 'auto',
        }}
      >
        {inverted ? <PaybackInput {...props} /> : <WithdrawInput {...props} />}
        {showPaybackAndWithdrawOptionButton && (
          <Text
            mt={3}
            sx={{
              cursor: 'pointer',
              fontSize: 3,
              fontWeight: 'semiBold',
              color: 'onSuccess',
              userSelect: 'none',
              lineHeight: 1.25,
            }}
            onClick={togglePaybackAndWithdrawOption!}
          >
            {showPaybackAndWithdrawOption ? <MinusIcon /> : <PlusIcon />}
            {t('manage-vault.action-option', {
              action: inverted ? t('vault-actions.withdraw') : t('vault-actions.payback'),
              token: inverted ? token : 'DAI',
            })}
          </Text>
        )}
        {showPaybackAndWithdrawOption &&
          (!!paybackAmount || !!withdrawAmount) &&
          (inverted ? <WithdrawInput {...props} /> : <PaybackInput {...props} />)}
      </Box>
    </Grid>
  )
}
