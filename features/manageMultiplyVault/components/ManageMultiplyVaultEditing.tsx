import BigNumber from 'bignumber.js'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { getCollRatioColor } from 'components/vault/VaultDetails'
import { formatFiatBalance, formatPercent } from 'helpers/formatters/format'
import { handleNumericInput } from 'helpers/input'
import { zero } from 'helpers/zero'
import React from 'react'
import { Box, Button, Divider, Flex, Grid, Select, Slider, Text, useThemeUI } from 'theme-ui'

import { ManageMultiplyVaultState, OtherAction } from '../manageMultiplyVault'
import { MAX_COLL_RATIO } from '../manageMultiplyVaultCalculations'
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
  updateSell,
  updateSellUSD,
  updateSellMax,
  sellAmount,
  sellAmountUSD,
  vault: { token, freeCollateral, freeCollateralUSD },
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
      maxAmount={freeCollateral}
      maxAmountLabel={'Max'}
      onSetMax={updateSellMax}
      onChange={handleNumericInput(updateSell!)}
      auxiliaryAmount={sellAmountUSD}
      maxAuxiliaryAmount={freeCollateralUSD}
      onAuxiliaryChange={handleNumericInput(updateSellUSD!)}
      hasError={false}
    />
  )
}

function AdjustPositionForm(props: ManageMultiplyVaultState) {
  const {
    theme: { colors },
  } = useThemeUI()

  const {
    vault: { token, collateralizationRatio },
    afterCollateralizationRatio,
    afterLiquidationPrice,
    showSliderController,
    toggleSliderController,
    mainAction,
    setMainAction,
    ilkData: { liquidationRatio },
    requiredCollRatio,
    updateRequiredCollRatio,
    maxCollRatio,
  } = props

  const collRatioColor = getCollRatioColor(props, afterCollateralizationRatio)
  const slider =
    (requiredCollRatio || collateralizationRatio)
      .minus(liquidationRatio)
      .div(maxCollRatio.minus(liquidationRatio))
      .times(100) || zero

  const sliderBackground = `linear-gradient(to right, ${colors?.sliderTrackFill} 0%, ${
    colors?.sliderTrackFill
  } ${slider?.toNumber()}%, ${colors?.primaryAlt} ${slider?.toNumber()}%, ${
    colors?.primaryAlt
  } 100%)`

  if (showSliderController) {
    return (
      <>
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
              step={5}
              min={liquidationRatio.times(100).toNumber()}
              max={MAX_COLL_RATIO.times(100).toNumber()}
              value={
                requiredCollRatio?.times(100).toNumber() ||
                collateralizationRatio.times(100).toNumber()
              }
              onChange={(e) => {
                updateRequiredCollRatio!(new BigNumber(e.target.value).div(100))
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
        <Button sx={{ py: 2 }} variant="actionOption" mt={3} onClick={toggleSliderController!}>
          <Text pr={1}>Or enter an amount of ETH</Text>
        </Button>
      </>
    )
  }

  return (
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
      <Button sx={{ py: 2 }} variant="actionOption" mt={3} onClick={toggleSliderController!}>
        <Text pr={1}>Or use the risk slider</Text>
      </Button>
    </Box>
  )
}

function OtherActionsForm(props: ManageMultiplyVaultState) {
  return (
    <Grid>
      <Select
        value={props.otherAction}
        onChange={(e) => props.setOtherAction!(e.target.value as OtherAction)}
      >
        <option value="depositCollateral">Deposit Collateral</option>
        <option value="depositDai">Deposit Dai</option>
        <option value="withdrawCollateral">Withdraw Collateral</option>
        <option value="withdrawDai">Withdraw Dai</option>
        <option value="closeVault">Close Vault</option>
      </Select>
      {props.otherAction}
    </Grid>
  )
}

export function ManageMultiplyVaultEditing(props: ManageMultiplyVaultState) {
  const { stage } = props

  return (
    <Grid gap={4}>
      {stage === 'adjustPosition' && <AdjustPositionForm {...props} />}
      {stage === 'otherActions' && <OtherActionsForm {...props} />}
      <Divider sx={{ width: '100%' }} />
      <ManageMultiplyVaultChangesInformation {...props} />
    </Grid>
  )
}
