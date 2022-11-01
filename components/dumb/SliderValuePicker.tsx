import { Box, Grid, Slider, Text } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import React from 'react'
import { Flex, SxStyleProp, useThemeUI } from 'theme-ui'

export interface SliderValuePickerProps {
  sliderPercentageFill: BigNumber
  leftBoundry: BigNumber
  leftBoundryFormatter: (input: BigNumber) => string | JSX.Element
  rightBoundry: BigNumber
  rightBoundryFormatter: (input: BigNumber) => string | JSX.Element
  onChange: (input: BigNumber) => void
  minBoundry: BigNumber
  maxBoundry: BigNumber
  lastValue: BigNumber
  disabled: boolean
  leftBoundryStyling?: SxStyleProp
  rightBoundryStyling?: SxStyleProp
  step: number
  leftLabel?: string | JSX.Element
  rightLabel?: string | JSX.Element
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
      <Flex
        sx={{
          variant: 'text.paragraph4',
          justifyContent: 'space-between',
          fontWeight: 'semiBold',
          color: 'neutral80',
          alignItems: 'flex-end',
        }}
      >
        <Grid gap={2}>
          {props.leftLabel && <Text as="span">{props.leftLabel}</Text>}
          <Text as="span" variant="boldParagraph1" sx={props.leftBoundryStyling}>
            {props.leftBoundryFormatter(props.leftBoundry)}
          </Text>
        </Grid>
        <Grid gap={2} sx={{ textAlign: 'right' }}>
          {props.rightLabel && <Text as="span">{props.rightLabel}</Text>}
          <Text as="span" variant="boldParagraph1" sx={props.rightBoundryStyling}>
            {props.rightBoundryFormatter(props.rightBoundry)}
          </Text>
        </Grid>
      </Flex>
      <Box my={1}>
        <Slider
          sx={{ background }}
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
