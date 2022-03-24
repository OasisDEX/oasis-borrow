import BigNumber from 'bignumber.js'
import React, {
  ChangeEvent,
  MouseEvent,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Box, Flex, Grid, Slider, Text, useThemeUI } from 'theme-ui'

import { formatAmount, formatPercent } from '../../helpers/formatters/format'
import { useBreakpointIndex } from '../../theme/useBreakpointIndex'

function getSliderBoxBoundaries(boxRef: RefObject<HTMLDivElement>) {
  const box = boxRef.current?.getBoundingClientRect()

  return { sliderBoxLeftBoundary: box?.left || 0, sliderBoxRightBoundary: box?.right || 0 }
}

const sliderDefaultBoundaries = {
  sliderBoxLeftBoundary: 0,
  sliderBoxRightBoundary: 0,
}

function convertValuesToPercents({
  value0,
  value1,
  max,
  min,
}: {
  value0: number
  value1: number
  max: number
  min: number
}) {
  return {
    value0InPercent: ((value0 - min) / (max - min)) * 100,
    value1InPercent: ((value1 - min) / (max - min)) * 100,
  }
}

interface SliderValues {
  value0: number
  value1: number
}

interface MultipleRangeSliderProps {
  min: number
  max: number
  onChange: (value: SliderValues) => void
  defaultValues: SliderValues
  multiply?: number
  step?: number
}

export function MultipleRangeSlider({
  min,
  max,
  onChange,
  defaultValues,
  multiply,
  step = 5,
}: MultipleRangeSliderProps) {
  const [sliderValue, setSliderValue] = useState(defaultValues)
  const [side, setSide] = useState('')
  const [sliderBoxBoundaries, setSliderBoxBoundaries] = useState(sliderDefaultBoundaries)
  const sliderBoxRef = useRef<HTMLDivElement>(null)
  const {
    theme: { colors },
  } = useThemeUI()
  const breakpoint = useBreakpointIndex()

  const mobile = breakpoint === 0
  const { value0, value1 } = sliderValue

  useEffect(() => {
    const handleBoundariesUpdate = () => {
      const { sliderBoxLeftBoundary, sliderBoxRightBoundary } = getSliderBoxBoundaries(sliderBoxRef)
      setSliderBoxBoundaries({ sliderBoxLeftBoundary, sliderBoxRightBoundary })
    }
    handleBoundariesUpdate()

    window.addEventListener('resize', handleBoundariesUpdate)

    return () => {
      window.removeEventListener('resize', handleBoundariesUpdate)
    }
  }, [])

  useEffect(() => {
    if (multiply) {
      setSliderValue({ value0: multiply - step, value1: multiply + step })
    }
  }, [multiply])

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>, slider: number) => {
      const newValue = Number(e.target.value)

      if (slider === 0 && (newValue > value1 - step || (multiply && newValue > multiply - step))) {
        return
      }

      if (slider === 1 && (newValue < value0 + step || (multiply && newValue < multiply + step))) {
        return
      }

      setSliderValue((prev) => ({ ...prev, [`value${slider}`]: newValue }))
      onChange({ ...sliderValue, [`value${slider}`]: newValue })
    },
    [step, value1, multiply],
  )

  const { value0InPercent, value1InPercent } = useMemo(
    () => convertValuesToPercents({ value0, value1, max, min }),
    [value0, value1, max, min],
  )

  const sliderBackground = `
    linear-gradient(to right, ${colors?.primaryAlt}  0%, ${colors?.primaryAlt} ${value0InPercent}%,
    ${colors?.sliderActiveFill} ${value0InPercent}%,  ${colors?.sliderActiveFill} ${value1InPercent}%,
    ${colors?.primaryAlt} ${value1InPercent}%, ${colors?.primaryAlt} 100%)`

  const multiplyMarkPercentagePosition = useMemo(
    () => (multiply ? ((multiply - min) / (max - min)) * 100 : 0),
    [multiply, min, max],
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const { sliderBoxLeftBoundary, sliderBoxRightBoundary } = sliderBoxBoundaries
      const mouseXPosition =
        ((e.clientX - sliderBoxLeftBoundary) / (sliderBoxRightBoundary - sliderBoxLeftBoundary)) *
        100
      const centralReference =
        multiplyMarkPercentagePosition || (value0InPercent + value1InPercent) / 2

      if (mouseXPosition > centralReference) {
        setSide('right')
      } else {
        setSide('left')
      }
    },
    [sliderBoxBoundaries, value0InPercent, value1InPercent, multiplyMarkPercentagePosition],
  )

  return (
    <Box>
      <Box>
        <Flex
          sx={{
            variant: 'text.paragraph4',
            justifyContent: 'space-between',
            fontWeight: 'semiBold',
            color: 'text.subtitle',
            mb: 3,
          }}
        >
          <Grid gap={2}>
            <Text>Liquidation Price</Text>
            <Text variant="paragraph1" sx={{ fontWeight: 'semiBold' }}>
              ${formatAmount(new BigNumber(value0), 'USD')}
            </Text>
          </Grid>
          <Grid gap={2}>
            <Text>Collateral Ratio</Text>
            <Text
              variant="paragraph1"
              sx={{ fontWeight: 'semiBold', textAlign: 'right', color: 'onSuccess' }}
            >
              {formatPercent(new BigNumber(value1), {
                precision: 2,
                roundMode: BigNumber.ROUND_DOWN,
              })}
            </Text>
          </Grid>
        </Flex>
      </Box>
      <Box onMouseMove={handleMouseMove} ref={sliderBoxRef} sx={{ position: 'relative', mb: 3 }}>
        <Slider
          step={step}
          min={min}
          max={max}
          value={value0}
          onChange={(e) => handleChange(e, 0)}
          sx={{
            pointerEvents: side === 'left' && !mobile ? 'all' : 'none',
            background: sliderBackground,
            '&::-webkit-slider-thumb': {
              backgroundColor: 'onWarning',
              pointerEvents: 'all',
            },
          }}
        />
        <Slider
          step={step}
          min={min}
          max={max}
          value={value1}
          onChange={(e) => handleChange(e, 1)}
          sx={{
            position: 'absolute',
            top: '-7px',
            pointerEvents: side === 'right' && !mobile ? 'all' : 'none',
            backgroundColor: 'unset',
            '&::-webkit-slider-thumb': {
              backgroundColor: 'onSuccess',
              pointerEvents: 'all',
            },
          }}
        />
        {multiply && (
          <Box
            sx={{
              position: 'absolute',
              top: '-13px',
              left: `50%`,
              transform: 'translateX(-50%)',
              width: 'calc(100% - 20px)',
              height: '30px',
              pointerEvents: 'none',
            }}
          >
            <Box sx={{ position: 'relative', width: '100%' }}>
              <Box
                sx={{
                  position: 'absolute',
                  width: '3px',
                  height: '30px',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'sliderActiveFill',
                  left: `${multiplyMarkPercentagePosition}%`,
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  transform: 'translateX(-50%)',
                  left: `${multiplyMarkPercentagePosition}%`,
                  top: '-25px',
                }}
              >
                {multiply / 100}x
              </Box>
            </Box>
          </Box>
        )}
      </Box>
      <Box>
        <Flex
          sx={{
            variant: 'text.paragraph4',
            justifyContent: 'space-between',
            color: 'text.subtitle',
          }}
        >
          <Text>{min}</Text>
          <Text>{max}</Text>
        </Flex>
      </Box>
    </Box>
  )
}
