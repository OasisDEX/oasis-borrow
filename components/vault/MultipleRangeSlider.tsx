// import React, { useCallback, useEffect, useState, useRef } from 'react'
//
// const sliderStyle = {
//   position: 'relative',
//   width: '200px',
// }
//
// const sliderRightLeftStyle = {
//   color: '#dee2e6',
//   fontSize: '12px',
//   marginTop: '20px',
//   position: 'absolute',
// }
//
// const sliderLeftStyle = {
//   left: '6px',
// }
//
// const sliderRightStyle = {
//   right: '-4px',
// }
//
// const sliderTrackStyle = {
//   backgroundColor: '#ced4da',
//   width: '100%',
//   zIndex: 1,
//   borderRadius: '3px',
//   height: '5px',
//   position: 'absolute',
// }
//
// const sliderRangeStyle = {
//   backgroundColor: '#9fe5e1',
//   zIndex: 2,
//   borderRadius: '3px',
//   height: '5px',
//   position: 'absolute',
// }
//
// // const thumbStyle = {
// //   pointerEvents: 'none',
// //   position: 'absolute',
// //   height: '0',
// //   width: '200px',
// //   outline: 'none',
// //   '&::WebkitAppearance': 'none',
// //   '&::WebkitTapHighlightColor': 'transparent',
// //   '&::WebkitSliderThumb': {
// //     backgroundColor: '#f1f5f7',
// //     border: 'none',
// //     borderRadius: '50%',
// //     boxShadow: '0 0 1px 1px #ced4da',
// //     cursor: 'pointer',
// //     height: '18px',
// //     width: '18px',
// //     marginTop: '4px',
// //     pointerEvents: 'all',
// //     position: ' relative',
// //   },
// // }
//
// const thumbStyle = {
//   pointerEvents: 'none',
//   position: 'absolute',
//   height: '0',
//   width: '200px',
//   outline: 'none',
//   WebkitAppearance: 'none',
//   WebkitTapHighlightColor: 'transparent',
//   '&::WebkitSliderThumb': {
//     backgroundColor: '#f1f5f7',
//     border: 'none',
//     borderRadius: '50%',
//     boxShadow: '0 0 1px 1px #ced4da',
//     cursor: 'pointer',
//     height: '18px',
//     width: '18px',
//     marginTop: '4px',
//     pointerEvents: 'all',
//     position: ' relative',
//   },
// }
//
// export function MultipleRangeSlider({ min, max, onChange }) {
//   const [minVal, setMinVal] = useState(min)
//   const [maxVal, setMaxVal] = useState(max)
//   const minValRef = useRef(null)
//   const maxValRef = useRef(null)
//   const range = useRef(null)
//
//   // Convert to percentage
//   const getPercent = useCallback((value) => Math.round(((value - min) / (max - min)) * 100), [
//     min,
//     max,
//   ])
//
//   // Set width of the range to decrease from the left side
//   useEffect(() => {
//     if (maxValRef.current) {
//       const minPercent = getPercent(minVal)
//       const maxPercent = getPercent(+maxValRef.current.value) // Preceding with '+' converts the value from type string to type number
//
//       if (range.current) {
//         range.current.style.left = `${minPercent}%`
//         range.current.style.width = `${maxPercent - minPercent}%`
//       }
//     }
//   }, [minVal, getPercent])
//
//   // Set width of the range to decrease from the right side
//   useEffect(() => {
//     if (minValRef.current) {
//       const minPercent = getPercent(+minValRef.current.value)
//       const maxPercent = getPercent(maxVal)
//
//       if (range.current) {
//         range.current.style.width = `${maxPercent - minPercent}%`
//       }
//     }
//   }, [maxVal, getPercent])
//
//   // Get min and max values when their state changes
//   useEffect(() => {
//     onChange({ min: minVal, max: maxVal })
//   }, [minVal, maxVal, onChange])
//
//   return (
//     <div className="container">
//       <input
//         type="range"
//         min={min}
//         max={max}
//         value={minVal}
//         ref={minValRef}
//         onChange={(event) => {
//           const value = Math.min(+event.target.value, maxVal - 1)
//           setMinVal(value)
//           event.target.value = value.toString()
//         }}
//         // className={classnames('thumb thumb--zindex-3', {
//         //   'thumb--zindex-5': minVal > max - 100,
//         // })}
//         style={{ ...thumbStyle, zIndex: minVal > max - 100 ? 5 : 3 }}
//       />
//       <input
//         type="range"
//         min={min}
//         max={max}
//         value={maxVal}
//         ref={maxValRef}
//         onChange={(event) => {
//           const value = Math.max(+event.target.value, minVal + 1)
//           setMaxVal(value)
//           event.target.value = value.toString()
//         }}
//         // className="thumb thumb--zindex-4"
//         style={{ ...thumbStyle, zIndex: 4 }}
//       />
//
//       <div style={sliderStyle}>
//         <div style={sliderTrackStyle} />
//         <div ref={range} style={sliderRangeStyle} />
//         <div style={{ ...sliderRightLeftStyle, ...sliderLeftStyle }}>{minVal}</div>
//         <div style={{ ...sliderRightLeftStyle, ...sliderRightStyle }}>{maxVal}</div>
//       </div>
//     </div>
//   )
// }

import { Box, Flex, Slider, useThemeUI } from 'theme-ui'
import BigNumber from 'bignumber.js'
import React, { useEffect, useRef, useState } from 'react'
import { TRANSITIONS } from '../../theme'
import { fromEvent } from 'rxjs'
import { sampleTime } from 'rxjs/operators'

export const useMousePosition = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const mouseMove$ = fromEvent<MouseEvent>(document, 'mousemove').pipe(sampleTime(500))

  useEffect(() => {
    const setFromEvent = (e) => setPosition({ x: e.clientX, y: e.clientY })
    // window.addEventListener('mousemove', setFromEvent)
    const subs = mouseMove$.subscribe(setFromEvent)

    return () => {
      // window.removeEventListener('mousemove', setFromEvent)
      subs.unsubscribe()
    }
  }, [])

  return position
}

export function MultipleRangeSlider({ min, max, onChange, multiply }) {
  const [value0, setValue0] = useState(245)
  const [value1, setValue1] = useState(255)
  const sliderRef = useRef()
  const sss = useRef()
  // const position = useMousePosition()
  // console.log(sliderRef.current.getBoundingClientRect())
  const {
    theme: { colors },
  } = useThemeUI()
  const [side, setSide] = useState('')
  console.log(side)

  // console.log(sss.current)
  function handleChange0(e) {
    if (e.target.value > value1 - 5 || e.target.value > multiply - 5) {
      // if (e.target.value > value1 - 5) {
      return
    }

    setValue0(e.target.value)
    onChange(e.target.value)
  }

  function handleChange1(e) {
    if (e.target.value < Number(value0) + 5 || e.target.value < multiply + 5) {
      // if (e.target.value < Number(value0) + 5) {
      return
    }
    setValue1(e.target.value)
    onChange(e.target.value)
  }

  const value0Conv = ((value0 - min) / (max - min)) * 100
  const value1Conv = ((value1 - min) / (max - min)) * 100

  const sliderBackground = `linear-gradient(to right, ${colors?.primaryAlt}  0%, ${colors?.primaryAlt} ${value0Conv}%, ${colors?.sliderActiveFill} ${value0Conv}%,  ${colors?.sliderActiveFill} ${value1Conv}%, ${colors?.primaryAlt} ${value1Conv}%, ${colors?.primaryAlt} 100%)`

  const multiplyMarkPosition = ((multiply - min) / (max - min)) * 100

  function handleMouseMove(e) {
    const box = sliderRef.current?.getBoundingClientRect()
    const left = box.left
    const right = box.right
    // const center = (left + right) / 2
    const mouseXPosition = ((e.clientX - left) / (right - left)) * 100
    // const rightPerc = ((e.clientX - min) / (max - min)) * 100
    // console.log(center)
    const centralReference = multiplyMarkPosition || (value0Conv + value1Conv) / 2

    if (mouseXPosition > centralReference) {
      setSide('right')
    } else {
      setSide('left')
    }
  }

  // useEffect(() => {
  //   const box = sliderRef.current?.getBoundingClientRect()
  //   const left = box.left
  //   const right = box.right
  //   const center = (left + right) / 2
  //
  //   if (position.x > center) {
  //     setSide('right')
  //   } else {
  //     setSide('left')
  //   }
  // }, [position.x])

  return (
    <Box sx={{ position: 'relative' }}>
      <Flex sx={{ justifyContent: 'space-between', width: '100%' }}>
        <Box>{value0}</Box>
        <Box>{value1}</Box>
      </Flex>
      <Box onMouseMove={handleMouseMove} ref={sliderRef}>
        <Slider
          ref={sss}
          step={5}
          min={min}
          max={max}
          value={value0}
          onChange={handleChange0}
          sx={{
            // pointerEvents: 'none',
            pointerEvents: side === 'left' ? 'all' : 'none',
            background: sliderBackground,
            '&::-webkit-slider-thumb': {
              backgroundColor: 'onWarning',
              zIndex: 500,
              pointerEvents: 'all',
            },
          }}
        />
        <Slider
          step={5}
          min={min}
          max={max}
          value={value1}
          onChange={handleChange1}
          sx={{
            position: 'absolute',
            top: '24px',
            pointerEvents: side === 'right' ? 'all' : 'none',
            backgroundColor: 'unset',
            '&::-webkit-slider-thumb': {
              backgroundColor: 'onSuccess',
              zIndex: 500,
              pointerEvents: 'all',
            },
          }}
        />{' '}
      </Box>

      {multiply && (
        <Box
          sx={{
            position: 'absolute',
            top: '19px',
            // right: `calc((100% - 20px) - ${multiplyMarkPosition}%)`,
            left: `50%`,
            // left: `${50}%`,
            transform: 'translateX(-50%)',
            width: 'calc(100% - 20px)',
            height: '30px',
            pointerEvents: 'none',
            // backgroundColor: '#878BFC',
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
                left: `${multiplyMarkPosition}%`,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                transform: 'translateX(-50%)',
                left: `${multiplyMarkPosition}%`,
                top: '-25px',
              }}
            >
              {multiply / 100}x
            </Box>
          </Box>
        </Box>
      )}
      <Flex sx={{ justifyContent: 'space-between', width: '100%' }}>
        <Box>{min}</Box>
        <Box>{max}</Box>
      </Flex>
    </Box>
  )
}
