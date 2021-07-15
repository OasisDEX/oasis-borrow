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

function BuyTokenInput({
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
      action="Buy"
      token={token}
      tokenUsdPrice={currentCollateralPrice}
      showMax={true}
      hasAuxiliary={true}
      onSetMax={updateDepositMax!}
      maxAmountLabel={'Buying power'}
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

function SellTokenInput({
  generateAmount,
  accountIsController,
  maxGenerateAmount,
  updateGenerate,
  updateGenerateMax,
}: ManageMultiplyVaultState) {
  return (
    <VaultActionInput
      action="Sell"
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

export function ManageMultiplyVaultEditing(props: ManageMultiplyVaultState) {
  const { t } = useTranslation()
  const {
    theme: { colors },
  } = useThemeUI()

  const {
    afterCollateralizationRatio,
    afterLiquidationPrice,
    showSliderController,
    toggleSliderController,
    adjustSlider,
    slider,
  } = props

  const collRatioColor = getCollRatioColor(props, afterCollateralizationRatio)
  const sliderBackground = 1
    ? `linear-gradient(to right, ${colors?.sliderTrackFill} 0%, ${
        colors?.sliderTrackFill
      } ${slider?.toNumber()}%, ${colors?.primaryAlt} ${slider?.toNumber()}%, ${
        colors?.primaryAlt
      } 100%)`
    : 'primaryAlt'

  return (
    <Grid gap={4}>
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
              value={slider?.toNumber() || 0}
              max={100}
              onChange={(e) => {
                adjustSlider!(new BigNumber(e.target.value))
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
        <Box>
          <BuyTokenInput {...props} />
        </Box>
      )}

      <Button sx={{ py: 2 }} variant="actionOption" mt={3} onClick={toggleSliderController!}>
        <Text pr={1}>Or enter an amount of ETH</Text>
      </Button>

      <Divider sx={{ width: '100%' }} />
      <ManageMultiplyVaultChangesInformation {...props} />
    </Grid>
  )
}
