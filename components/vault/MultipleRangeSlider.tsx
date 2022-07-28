import { throttle } from 'lodash'
import React, {
  ChangeEvent,
  MouseEvent,
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { OasisTheme } from 'theme'
import { Box, Flex, Grid, Slider, Text } from 'theme-ui'
import { useBreakpointIndex } from 'theme/useBreakpointIndex'
import { useTheme } from 'theme/useThemeUI'

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
    value0InPercent: value0 === 0 ? 0 : ((value0 - min) / (max - min)) * 100,
    value1InPercent: ((value1 - min) / (max - min)) * 100,
  }
}

function getSliderBackgroundGradient({
  theme,
  value0InPercent,
  value1InPercent,
}: {
  theme: OasisTheme
  value0InPercent: number
  value1InPercent: number
}) {
  const { colors } = theme
  return `linear-gradient(to right, ${colors.neutral60}  0%, ${colors.neutral60} ${value0InPercent}%,
    ${colors.sliderTrackFill} ${value0InPercent}%,  ${colors.sliderTrackFill} ${value1InPercent}%,
    ${colors.neutral60} ${value1InPercent}%, ${colors.neutral60} 100%)`
}

interface SliderValues {
  value0: number
  value1: number
}

interface SliderValueColors {
  value0?: string
  value1?: string
}

interface MultipleRangeSliderProps {
  min: number
  max: number
  onChange: (value: SliderValues) => void
  value: SliderValues
  valueColors?: SliderValueColors
  leftDescription: ReactNode
  rightDescription: ReactNode
  middleMark?: { text: string; value: number }
  step?: number
  middleMarkOffset?: number
  leftThumbColor?: string
  rightThumbColor?: string
  minDescription?: ReactNode
  maxDescription?: ReactNode
}

export function MultipleRangeSlider({
  min,
  max,
  onChange,
  value,
  valueColors,
  middleMark,
  step = 5,
  middleMarkOffset = 5,
  leftThumbColor = 'warning100',
  rightThumbColor = 'success100',
  leftDescription,
  rightDescription,
  minDescription = '',
  maxDescription = '',
}: MultipleRangeSliderProps) {
  const [side, setSide] = useState('')
  const [sliderBoxBoundaries, setSliderBoxBoundaries] = useState(sliderDefaultBoundaries)
  const sliderBoxRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const breakpoint = useBreakpointIndex()

  const { value0, value1 } = value
  const mobile = breakpoint === 0

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
    if (middleMark) {
      const newValue = {
        value0: middleMark.value - middleMarkOffset,
        value1: middleMark.value + middleMarkOffset,
      }
      onChange(newValue)
    }
  }, [middleMark?.value])

  const dotsSpace = 5

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>, slider: number) => {
      const newValue = Number(e.target.value)

      if (
        slider === 0 &&
        (newValue > value1 - dotsSpace || (middleMark && newValue > middleMark.value - dotsSpace))
      ) {
        return
      }

      if (
        slider === 1 &&
        (newValue < value0 + dotsSpace || (middleMark && newValue < middleMark.value + dotsSpace))
      ) {
        return
      }

      onChange({ ...value, [`value${slider}`]: newValue })
    },
    [step, value0, value1, middleMark?.value],
  )

  const { value0InPercent, value1InPercent } = useMemo(
    () => convertValuesToPercents({ value0, value1, max, min }),
    [value0, value1, max, min],
  )

  const sliderBackground = useMemo(
    () => getSliderBackgroundGradient({ theme, value0InPercent, value1InPercent }),
    [value0InPercent, value1InPercent],
  )

  const middleMarkPercentagePosition = useMemo(
    () => (middleMark ? ((middleMark.value - min) / (max - min)) * 100 : 0),
    [middleMark?.value, min, max],
  )

  const handleMouseMove = useCallback(
    throttle((e: MouseEvent<HTMLDivElement>) => {
      const { sliderBoxLeftBoundary, sliderBoxRightBoundary } = sliderBoxBoundaries
      const mouseXPosition =
        ((e.clientX - sliderBoxLeftBoundary) / (sliderBoxRightBoundary - sliderBoxLeftBoundary)) *
        100
      const centralReference =
        middleMarkPercentagePosition || (value0InPercent + value1InPercent) / 2

      if (mouseXPosition > centralReference) {
        setSide('right')
      } else {
        setSide('left')
      }
    }, 100),
    [sliderBoxBoundaries, value0InPercent, value1InPercent, middleMarkPercentagePosition],
  )

  return (
    <Box>
      <Flex
        sx={{
          variant: 'text.paragraph4',
          justifyContent: 'space-between',
          fontWeight: 'semiBold',
          color: 'neutral80',
          mb: '24px',
          lineHeight: 'tight',
        }}
      >
        <Grid as="p" gap={2}>
          <Text as="span">{leftDescription}</Text>
          <Text
            as="span"
            variant="paragraph1"
            sx={{
              fontWeight: 'semiBold',
              ...(valueColors?.value0 && { color: valueColors.value0 }),
            }}
          >
            {value0}%
          </Text>
        </Grid>
        <Grid as="p" gap={2} sx={{ textAlign: 'right' }}>
          <Text as="span">{rightDescription}</Text>
          <Text
            as="span"
            variant="paragraph1"
            sx={{
              fontWeight: 'semiBold',
              ...(valueColors?.value1 && { color: valueColors.value1 }),
            }}
          >
            {value1}%
          </Text>
        </Grid>
      </Flex>
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
              backgroundColor: leftThumbColor,
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
            top: '-8px',
            pointerEvents: side === 'right' && !mobile ? 'all' : 'none',
            backgroundColor: 'unset',
            '&::-webkit-slider-thumb': {
              backgroundColor: rightThumbColor,
              pointerEvents: 'all',
            },
          }}
        />
        {middleMark && (
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
                  backgroundColor: 'interactive50',
                  left: `${middleMarkPercentagePosition}%`,
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  transform: 'translateX(-50%)',
                  left: `${middleMarkPercentagePosition}%`,
                  top: '-18px',
                  variant: 'text.paragraph4',
                  fontWeight: 'semiBold',
                }}
              >
                {middleMark.text}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
      <Box>
        <Flex
          as="p"
          sx={{
            variant: 'text.paragraph4',
            justifyContent: 'space-between',
            color: 'neutral80',
            fontWeight: 'medium',
          }}
        >
          <Text as="span">
            {min}% {minDescription}
          </Text>
          <Text as="span">
            {max}% {maxDescription}
          </Text>
        </Flex>
      </Box>
    </Box>
  )
}
