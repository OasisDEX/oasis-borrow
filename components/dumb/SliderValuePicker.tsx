import { Box, Flex, Grid, Slider, Text } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { SxStyleProp, useThemeUI } from 'theme-ui'

export interface SliderValuePickerProps {
  sliderKey: string
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
}

export function SliderValuePicker(props: SliderValuePickerProps) {
  const { t } = useTranslation()
  const {
    theme: { colors },
  } = useThemeUI()

  const leftLabel = t(`slider.${props.sliderKey}.left-label`)
  const rightLabel = t(`slider.${props.sliderKey}.right-label`)

  const background = props.sliderPercentageFill
    ? `linear-gradient(to right, ${colors?.sliderTrackFill} 0%, ${colors?.sliderTrackFill} ${
        props.sliderPercentageFill.toNumber() || 0
      }%, ${colors?.neutral60} ${props.sliderPercentageFill.toNumber() || 0}%, ${
        colors?.neutral60
      } 100%)`
    : 'neutral60'

  return (
    <Grid gap={2}>
      <Box>
        <Flex
          sx={{
            variant: 'text.paragraph4',
            justifyContent: 'space-between',
            fontWeight: 'semiBold',
            color: 'neutral80',
          }}
        >
          <Grid gap={2}>
            {leftLabel && <Text>{leftLabel}</Text>}
            <Text variant="paragraph1" sx={{ fontWeight: 'semiBold' }}>
              {props.leftBoundryFormatter(props.leftBoundry)}
            </Text>
          </Grid>
          <Grid gap={2}>
            {rightLabel && <Text>{rightLabel}</Text>}
            <Text variant="paragraph1" sx={props.leftBoundryStyling}>
              {props.rightBoundryFormatter(props.rightBoundry)}
            </Text>
          </Grid>
        </Flex>
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
