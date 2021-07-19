import BigNumber from 'bignumber.js'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { getCollRatioColor } from 'components/vault/VaultDetails'
import { formatFiatBalance, formatPercent } from 'helpers/formatters/format'
import { handleNumericInput } from 'helpers/input'
import React from 'react'
import { Box, Button, Divider, Flex, Grid, Slider, Text, useThemeUI } from 'theme-ui'

import { ManageMultiplyVaultState } from '../manageMultiplyVault'
import { ManageMultiplyVaultChangesInformation } from './ManageMultiplyVaultChangesInformation'

function BuyTokenInput({
  maxDepositAmount,
  maxDepositAmountUSD,
  vault: { token },
  updateBuy,
  updateBuyUSD,
  updateBuyMax,
  buyAmountUSD,
  buyAmount,
  priceInfo: { currentCollateralPrice },
}: ManageMultiplyVaultState) {
  return (
    <VaultActionInput
      action="Buy"
      token={token}
      tokenUsdPrice={currentCollateralPrice}
      showMax={true}
      hasAuxiliary={true}
      onSetMax={updateBuyMax!}
      maxAmountLabel={'Buying power'}
      amount={buyAmount}
      auxiliaryAmount={buyAmountUSD}
      maxAmount={maxDepositAmount}
      maxAuxiliaryAmount={maxDepositAmountUSD}
      onChange={handleNumericInput(updateBuy!)}
      onAuxiliaryChange={handleNumericInput(updateBuyUSD!)}
      hasError={false}
    />
  )
}

function SellTokenInput({
  accountIsController,
  maxGenerateAmount,
  updateSell,
  updateSellUSD,
  updateSellMax,
  sellAmount,
  sellAmountUSD,
  vault: { token },
  priceInfo: { currentCollateralPrice },
}: ManageMultiplyVaultState) {
  return (
    <VaultActionInput
      action="Sell"
      amount={sellAmount}
      tokenUsdPrice={currentCollateralPrice}
      token={token}
      showMax={true}
      hasAuxiliary={true}
      disabled={!accountIsController}
      maxAmount={maxGenerateAmount}
      maxAmountLabel={'Max'}
      onSetMax={updateSellMax}
      onChange={handleNumericInput(updateSell!)}
      auxiliaryAmount={sellAmountUSD}
      maxAuxiliaryAmount={new BigNumber(10)}
      onAuxiliaryChange={handleNumericInput(updateSellUSD!)}
      hasError={false}
    />
  )
}

export function ManageMultiplyVaultEditing(props: ManageMultiplyVaultState) {
  const {
    theme: { colors },
  } = useThemeUI()

  const {
    vault: { token },
    afterCollateralizationRatio,
    afterLiquidationPrice,
    showSliderController,
    toggleSliderController,
    adjustSlider,
    slider,
    mainAction,
    setMainAction,
  } = props

  const collRatioColor = getCollRatioColor(props, afterCollateralizationRatio)
  const sliderBackground = `linear-gradient(to right, ${colors?.sliderTrackFill} 0%, ${
    colors?.sliderTrackFill
  } ${slider?.toNumber()}%, ${colors?.primaryAlt} ${slider?.toNumber()}%, ${
    colors?.primaryAlt
  } 100%)`

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
          <Flex>
            <Button
              onClick={() => setMainAction!('buy')}
              variant={mainAction === 'buy' ? 'beanActive' : 'bean'}
              sx={{ mr: 2 }}
            >
              Buy {token}
            </Button>
            <Button
              onClick={() => setMainAction!('sell')}
              variant={mainAction === 'sell' ? 'beanActive' : 'bean'}
            >
              Sell {token}
            </Button>
          </Flex>
          {mainAction === 'buy' ? <BuyTokenInput {...props} /> : <SellTokenInput {...props} />}
        </Box>
      )}

      <Button sx={{ py: 2 }} variant="actionOption" mt={3} onClick={toggleSliderController!}>
        <Text pr={1}>
          {showSliderController ? 'Or enter an amount of ETH' : 'Or use the risk slider'}
        </Text>
      </Button>

      <Divider sx={{ width: '100%' }} />
      <ManageMultiplyVaultChangesInformation {...props} />
    </Grid>
  )
}
