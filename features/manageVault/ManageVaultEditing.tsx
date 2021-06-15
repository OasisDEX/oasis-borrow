import { VaultActionInput } from 'components/VaultActionInput'
import { MinusIcon, PlusIcon } from 'features/openVault/components/OpenVaultEditing'
import { handleNumericInput } from 'helpers/input'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Button, Flex, Grid, Text } from 'theme-ui'

import { ManageVaultState } from './manageVault'

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
}: ManageVaultState) {
  return (
    <VaultActionInput
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
}: ManageVaultState) {
  return (
    <VaultActionInput
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
}: ManageVaultState) {
  return (
    <VaultActionInput
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
}: ManageVaultState) {
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
  } = props

  const disableDepositAndGenerate = paybackAmount || withdrawAmount || showPaybackAndWithdrawOption
  const disablePaybackAndWithdraw = depositAmount || generateAmount || showDepositAndGenerateOption

  const inverted = stage === 'daiEditing'

  const showDepositAndGenerateOptionButton =
    (depositAmount || generateAmount) && accountIsController
  const showPaybackAndWithdrawOptionButton =
    (paybackAmount || withdrawAmount) && accountIsController

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
          <Button variant="actionOption" mt={3} onClick={toggleDepositAndGenerateOption!}>
            {showDepositAndGenerateOption ? <MinusIcon /> : <PlusIcon />}
            <Text pr={1}>
              {t('manage-vault.action-option', {
                action: inverted ? t('vault-actions.deposit') : t('vault-actions.generate'),
                token: inverted ? token : 'DAI',
              })}
            </Text>
          </Button>
        )}
        {showDepositAndGenerateOption &&
          (!!depositAmount || !!generateAmount) &&
          (inverted ? <DepositInput {...props} /> : <GenerateInput {...props} />)}
      </Box>

      <Flex sx={{ alignItems: 'center', justifyContent: 'space-evenly' }}>
        <Box sx={{ borderBottom: 'light', height: '0px', width: '100%' }} />
        <Text
          mx={3}
          sx={{ color: 'muted', minWidth: 'fit-content', fontWeight: 'semiBold', fontSize: '1' }}
        >
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
          <Button variant="actionOption" mt={3} onClick={togglePaybackAndWithdrawOption!}>
            {showPaybackAndWithdrawOption ? <MinusIcon /> : <PlusIcon />}
            <Text pr={1}>
              {t('manage-vault.action-option', {
                action: inverted ? t('vault-actions.withdraw') : t('vault-actions.payback'),
                token: inverted ? token : 'DAI',
              })}
            </Text>
          </Button>
        )}
        {showPaybackAndWithdrawOption &&
          (!!paybackAmount || !!withdrawAmount) &&
          (inverted ? <WithdrawInput {...props} /> : <PaybackInput {...props} />)}
      </Box>
    </Grid>
  )
}
