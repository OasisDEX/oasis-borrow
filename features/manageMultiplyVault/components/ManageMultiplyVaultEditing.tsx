import BigNumber from 'bignumber.js'
import { MinusIcon, PlusIcon, VaultActionInput } from 'components/vault/VaultActionInput'
import { getCollRatioColor } from 'components/vault/VaultDetails'
import { formatCryptoBalance, formatFiatBalance, formatPercent } from 'helpers/formatters/format'
import { handleNumericInput } from 'helpers/input'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Button, Divider, Flex, Grid, Slider, Text, useThemeUI } from 'theme-ui'

import { ManageMultiplyVaultState } from '../manageMultiplyVault'
import { ManageMultiplyVaultChangesInformation } from './ManageMultiplyVaultChangesInformation'

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
}: ManageMultiplyVaultState) {
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
}: ManageMultiplyVaultState) {
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
}: ManageMultiplyVaultState) {
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
}: ManageMultiplyVaultState) {
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

export function ManageMultiplyVaultEditing(props: ManageMultiplyVaultState) {
  const { t } = useTranslation()
  const {
    theme: { colors },
  } = useThemeUI()

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
    afterCollateralizationRatio,
    afterLiquidationPrice,
    showSliderController,
    toggleSliderController,
  } = props

  const disableDepositAndGenerate = paybackAmount || withdrawAmount || showPaybackAndWithdrawOption
  const disablePaybackAndWithdraw = depositAmount || generateAmount || showDepositAndGenerateOption

  const showDepositAndGenerateOptionButton =
    (depositAmount || generateAmount) && accountIsController
  const showPaybackAndWithdrawOptionButton =
    (paybackAmount || withdrawAmount) && accountIsController

  const collRatioColor = getCollRatioColor(props, afterCollateralizationRatio)
  const multiply = new BigNumber(1)
  const sliderBackground = 1
    ? `linear-gradient(to right, ${colors?.sliderTrackFill} 0%, ${
        colors?.sliderTrackFill
      } ${multiply.toNumber()}%, ${colors?.primaryAlt} ${multiply.toNumber()}%, ${
        colors?.primaryAlt
      } 100%)`
    : 'primaryAlt'

  return (
    <Grid gap={4}>
      {/* <Box
        sx={{
          opacity: disableDepositAndGenerate ? 0.5 : 1,
          pointerEvents: disableDepositAndGenerate ? 'none' : 'auto',
        }}
      > */}
      {/* {inverted ? <GenerateInput {...props} /> : <DepositInput {...props} />}
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
      </Box> */}

      {showSliderController ? (
        <Grid gap={2}>
          <Box>
            <Flex
              sx={{
                variant: 'text.paragraph4',
                justifyContent: 'space-between',
                fontWeight: 'semiBold',
                color: 'text.subtitle',
              }}
            >
              <Grid gap={2}>
                <Text>Liquidation Price</Text>
                <Text variant="paragraph1" sx={{ fontWeight: 'semiBold' }}>
                  ${formatFiatBalance(afterLiquidationPrice)}
                </Text>
              </Grid>
              <Grid gap={2}>
                <Text>Collateral Ratio</Text>
                <Text
                  variant="paragraph1"
                  sx={{ fontWeight: 'semiBold', textAlign: 'right', color: collRatioColor }}
                >
                  {formatPercent(afterCollateralizationRatio.times(100))}
                </Text>
              </Grid>
            </Flex>
          </Box>
          <Box my={1}>
            <Slider
              sx={{
                background: sliderBackground,
              }}
              step={2}
              value={multiply?.toNumber() || 0}
              onChange={(e) => {
                console.log('update multiply')
              }}
            />
          </Box>
          <Box>
            <Flex
              sx={{
                variant: 'text.paragraph4',
                justifyContent: 'space-between',
                color: 'text.subtitle',
              }}
            >
              <Text>Decrease risk</Text>
              <Text>Increase risk</Text>
            </Flex>
          </Box>
        </Grid>
      ) : (
        <Box>input</Box>
      )}

      <Button sx={{ py: 2 }} variant="actionOption" mt={3} onClick={toggleSliderController!}>
        <Text pr={1}>Or enter an amount of ETH</Text>
      </Button>

      <Divider sx={{ width: '100%' }} />
      <ManageMultiplyVaultChangesInformation {...props} />
    </Grid>
  )
}
