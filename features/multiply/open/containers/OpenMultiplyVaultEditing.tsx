import BigNumber from 'bignumber.js'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { getCollRatioColor } from 'components/vault/VaultDetails'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { handleNumericInput } from 'helpers/input'
import React from 'react'
import { Box, Divider, Flex, Grid, Slider, Text, useThemeUI } from 'theme-ui'

import { zero } from '../../../../helpers/zero'
import { OpenMultiplyVaultState } from '../pipes/openMultiplyVault'
import { OpenMultiplyVaultChangesInformation } from './OpenMultiplyVaultChangesInformation'
import { MultipleRangeSlider } from '../../../../components/vault/MultipleRangeSlider'

export function OpenMultiplyVaultEditing(props: OpenMultiplyVaultState) {
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
    updateRequiredCollRatio,
    multiply,
    priceInfo: { currentCollateralPrice },
    canAdjustRisk,
    afterLiquidationPrice,
    afterCollateralizationRatio,
    requiredCollRatio,

    ilkData: { liquidationRatio },
    maxCollRatio,
    inputAmountsEmpty,
  } = props

  const slider = requiredCollRatio
    ? maxCollRatio?.minus(requiredCollRatio)?.div(maxCollRatio.minus(liquidationRatio)).times(100)
    : zero

  const collRatioColor = getCollRatioColor(props, afterCollateralizationRatio)
  const sliderBackground =
    multiply && !multiply.isNaN() && slider
      ? `linear-gradient(to right, ${colors?.sliderTrackFill} 0%, ${
          colors?.sliderTrackFill
        } ${slider.toNumber()}%, ${colors?.primaryAlt} ${slider.toNumber()}%, ${
          colors?.primaryAlt
        } 100%)`
      : 'primaryAlt'

  return (
    <Grid gap={4}>
      <Grid gap={2}>
        <Text variant="strong">Deposit your {token}</Text>
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
          Adjust your multiply
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
              direction: 'rtl',
            }}
            disabled={!canAdjustRisk}
            step={0.05}
            min={liquidationRatio.toNumber()}
            max={maxCollRatio?.toNumber()}
            value={canAdjustRisk && requiredCollRatio ? requiredCollRatio.toNumber() : 100}
            onChange={(e) => {
              updateRequiredCollRatio && updateRequiredCollRatio(new BigNumber(e.target.value))
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
        <Box>
          <MultipleRangeSlider
            min={170}
            max={300}
            onChange={({ min, max }) => console.log(`min = ${min}, max = ${max}`)}
            // multiply={250}
          />
        </Box>
      </Grid>
      {!inputAmountsEmpty && <Divider />}
      <OpenMultiplyVaultChangesInformation {...props} />
    </Grid>
  )
}
