import { Grid, Slider, Text } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import type { TranslateStringType } from 'helpers/translateStringType'
import type { ReactNode } from 'react'
import React from 'react'
import type { SxStyleProp } from 'theme-ui'
import { Flex, useThemeUI } from 'theme-ui'

export interface SliderValuePickerProps {
  sliderPercentageFill?: BigNumber
  largeBoundry?: boolean
  leftBoundry?: BigNumber
  leftBoundryFormatter?: (input: BigNumber) => TranslateStringType | JSX.Element
  rightBoundry?: BigNumber
  rightBoundryFormatter?: (input: BigNumber) => TranslateStringType | JSX.Element
  onChange: (input: BigNumber) => void
  minBoundry: BigNumber
  maxBoundry: BigNumber
  lastValue: BigNumber
  disabled: boolean
  leftBoundryStyling?: SxStyleProp
  rightBoundryStyling?: SxStyleProp
  step: number
  leftBottomLabel?: ReactNode
  rightBottomLabel?: ReactNode
  leftLabel?: TranslateStringType | JSX.Element
  rightLabel?: TranslateStringType | JSX.Element
  direction?: 'rtl' | 'ltr'
  colorfulRanges?: string
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

  const hasLeftLabel = (props.leftBoundry && props.leftBoundryFormatter) || props.leftLabel
  const hasRightLabel = (props.rightBoundry && props.rightBoundryFormatter) || props.rightLabel

  return (
    <Grid
      gap={2}
      sx={{
        opacity: props.disabled ? 0.5 : 1,
        transition: '200ms opacity',
      }}
    >
      {(hasLeftLabel || hasRightLabel) && (
        <Flex
          sx={{
            variant: props.largeBoundry ? 'text.paragraph3' : 'text.paragraph4',
            justifyContent: 'space-between',
            mb: 1,
            fontWeight: props.largeBoundry ? 'regular' : 'semiBold',
            color: 'neutral80',
            alignItems: 'flex-end',
          }}
        >
          {hasLeftLabel && (
            <Grid gap={2}>
              {props.leftLabel && <Text as="span">{props.leftLabel}</Text>}
              {props.leftBoundry && props.leftBoundryFormatter && (
                <Text as="span" variant="boldParagraph1" sx={props.leftBoundryStyling}>
                  {props.leftBoundryFormatter(props.leftBoundry)}
                </Text>
              )}
            </Grid>
          )}
          {hasRightLabel && (
            <Grid gap={2} sx={{ textAlign: 'right' }}>
              {props.rightLabel && <Text as="span">{props.rightLabel}</Text>}
              {props.rightBoundry && props.rightBoundryFormatter && (
                <Text as="span" variant="boldParagraph1" sx={props.rightBoundryStyling}>
                  {props.rightBoundryFormatter(props.rightBoundry)}
                </Text>
              )}
            </Grid>
          )}
        </Flex>
      )}
      <Slider
        sx={{
          background: props.colorfulRanges || background,
          direction: props.direction || 'ltr',
          '&:disabled': {
            opacity: 1,
          },
        }}
        disabled={props.disabled}
        step={props.step}
        min={props.minBoundry?.toNumber()}
        max={props.maxBoundry?.toNumber()}
        value={props.lastValue?.toNumber()}
        onChange={(e) => {
          props.onChange(new BigNumber(e.target.value))
        }}
      />
      {props.leftBottomLabel && props.rightBottomLabel && (
        <Flex
          sx={{
            variant: 'text.paragraph4',
            justifyContent: 'space-between',
            mt: 1,
            fontWeight: 'semiBold',
            color: 'neutral80',
            alignItems: 'flex-end',
          }}
        >
          <Text as="span">{props.leftBottomLabel}</Text>
          <Text as="span">{props.rightBottomLabel}</Text>
        </Flex>
      )}
    </Grid>
  )
}
