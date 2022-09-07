import { Box, Grid, Slider, Text } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import React from 'react'
import { SxStyleProp, useThemeUI } from 'theme-ui'

export interface SliderValuePickerProps {
  sliderPercentageFill: BigNumber
  leftBoundry: BigNumber
  leftBoundryFormatter: (input: BigNumber) => string
  rightBoundry: BigNumber
  rightBoundryFormatter: (input: BigNumber) => string
  onChange: (input: BigNumber) => void
  minBoundry: BigNumber
  maxBoundry: BigNumber
  lastValue: BigNumber
  disabled: boolean
  leftBoundryStyling: SxStyleProp
  rightBoundryStyling: SxStyleProp
  step: number
  leftLabel?: string
  rightLabel?: string
}

export function SliderValuePicker(props: SliderValuePickerProps) {
  const {
    theme: { colors },
  } = useThemeUI()

  const background = props.sliderPercentageFill
    ? `linear-gradient(to right, ${colors?.interactive50} 0%, ${colors?.interactive50} ${
        props.sliderPercentageFill.toNumber() || 0
      }%, ${colors?.neutral60} ${props.sliderPercentageFill.toNumber() || 0}%, ${
        colors?.neutral60
      } 100%)`
    : 'neutral60'

  return (
    <Grid gap={2}>
      <Box>
        <Grid
          columns={2}
          gap={2}
          sx={{
            variant: 'text.paragraph4',
            justifyContent: 'space-between',
            fontWeight: 'semiBold',
            color: 'neutral80',
          }}
        >
          <Text>{props.leftLabel}</Text>
          <Text>{props.rightLabel}</Text>
          <Text variant="paragraph1" sx={{ fontWeight: 'semiBold' }}>
            {props.leftBoundryFormatter(props.leftBoundry)}
          </Text>
          <Text variant="paragraph1" sx={props.leftBoundryStyling}>
            {props.rightBoundryFormatter(props.rightBoundry)}
          </Text>
        </Grid>
      </Box>
      <Box my={1}>
        <Slider
          sx={{ ...props.rightBoundryStyling, background }}
          disabled={props.disabled}
          step={props.step}
          min={props.minBoundry?.toNumber()}
          max={props.maxBoundry?.toNumber()}
          value={props.lastValue?.toNumber()}
          onChange={(e) => {
            props.onChange(new BigNumber(e.target.value))
          }}
        />
      </Box>
    </Grid>
  )
}
