import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { VaultActionInput } from 'components/VaultActionInput'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { handleNumericInput } from 'helpers/input'
import React from 'react'
import { Box, Flex, Grid, Slider, Text, useThemeUI } from 'theme-ui'

import { LeverageVaultState } from '../leverageVault'
import { getCollRatioColor } from './LeverageVaultDetails'
import { LeverageVaultOrderInformation } from './LeverageVaultOrderInformation'

export const PlusIcon = () => (
  <Icon
    name="plus"
    color="onSuccess"
    size={20}
    sx={{ display: 'inline', verticalAlign: 'bottom', marginRight: 1 }}
  />
)

export const MinusIcon = () => (
  <Icon
    name="minus"
    color="onSuccess"
    size={20}
    sx={{ display: 'inline', verticalAlign: 'bottom', marginRight: 1 }}
  />
)

export function LeverageVaultEditing(props: LeverageVaultState) {
  const {
    theme: { colors },
  } = useThemeUI()
  const {
    token,
    depositAmount,
    maxDepositAmount,
    updateDeposit,
    updateDepositMax,
    updateDepositUSD,
    depositAmountUSD,
    maxDepositAmountUSD,
    updateLeverage,
    leverage, // TODO improve leverage editing
    priceInfo: { currentCollateralPrice },
    canAdjustRisk,
    afterLiquidationPrice,
    afterCollateralizationRatio,
  } = props

  const collRatioColor = getCollRatioColor(props)
  const sliderBackground = leverage
    ? `linear-gradient(to right, ${colors?.sliderTrackFill} 0%, ${
        colors?.sliderTrackFill
      } ${leverage.toNumber()}%, ${colors?.primaryAlt} ${leverage.toNumber()}%, ${
        colors?.primaryAlt
      } 100%)`
    : 'primaryAlt'

  return (
    <Grid gap={4}>
      <Grid gap={2}>
        <Text variant="strong">Step 1 - Deposit your ETH</Text>
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
          maxAmountLabel={'Balance'} // TODO add translation
          hasError={false}
        />
      </Grid>
      <Grid gap={2}>
        <Text variant="strong" mb={2}>
          Step 2 - Adjust your leverage
        </Text>
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
                ${formatAmount(afterLiquidationPrice, 'USD')}
              </Text>
            </Grid>
            <Grid gap={2}>
              <Text>Collateral Ratio</Text>
              <Text
                variant="paragraph1"
                sx={{ fontWeight: 'semiBold', textAlign: 'right', color: collRatioColor }}
              >
                {formatPercent(afterCollateralizationRatio.times(100), {
                  precision: 2,
                  roundMode: BigNumber.ROUND_DOWN,
                })}
              </Text>
            </Grid>
          </Flex>
        </Box>
        <Box my={1}>
          <Slider
            sx={{
              background: sliderBackground,
            }}
            disabled={!canAdjustRisk}
            step={2}
            value={leverage?.toNumber() || 0}
            onChange={(e) => {
              updateLeverage && updateLeverage(new BigNumber(e.target.value))
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
      <Box sx={{ borderBottom: 'lightMuted' }} />
      <LeverageVaultOrderInformation {...props} />
    </Grid>
  )
}
