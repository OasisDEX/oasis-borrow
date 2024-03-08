import 'rc-slider/assets/index.css'

import type { SliderProps } from 'rc-slider'
import Slider from 'rc-slider'
import type { FC } from 'react'
import React from 'react'
import { theme } from 'theme'
import { Flex } from 'theme-ui'

type RcSliderProps = {
  background: string
  disabled: boolean
  step: number
  min: number
  max: number
  value: number
  onChange: (e: number | number[]) => void
}

export const RcSlider: FC<RcSliderProps & SliderProps> = ({
  background,
  disabled,
  step,
  min,
  max,
  value,
  onChange,
  ...rest
}) => {
  return (
    <Flex
      sx={{
        justifyContent: 'center',
        '.rc-slider-handle-dragging': {
          borderColor: 'unset !important',
          boxShadow: 'unset !important',
        },
        '.rc-slider-disabled ': {
          background: 'unset',
        },
      }}
    >
      <Slider
        activeDotStyle={{
          background: 'unset',
        }}
        styles={{
          handle: {
            background: theme.colors.primary100,
            border: 'unset',
            opacity: 1,
            width: '19px',
            height: '19px',
            marginTop: '-7px',
          },
          track: {
            background: 'unset',
          },
          rail: {
            background,
          },
        }}
        disabled={disabled}
        step={step}
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        style={{
          width: '95%',
        }}
        {...rest}
      />
    </Flex>
  )
}
