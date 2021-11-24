import { Box, Flex, Grid, Text } from "@theme-ui/components"
import { formatAmount, formatPercent } from "helpers/formatters/format"
import React from "react"

export function SliderValuePicker(){
    return (
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
            value={requiredCollRatio?.toNumber() || maxCollRatio?.toNumber()}
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
      </Grid>
    )
}