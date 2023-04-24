import { AppSpinner } from 'helpers/AppSpinner'
import { checkedToggleDataIcon, notCheckedToggleDataIcon } from 'helpers/icons'
import React, { useCallback, useEffect, useState } from 'react'
import { Box, Input, SxStyleProp } from 'theme-ui'

interface ToggleProps {
  isChecked: boolean
  onChange: (checked: boolean) => void
  isLoading?: boolean
  sx?: SxStyleProp
}

export function Toggle({ isChecked, onChange, isLoading, sx }: ToggleProps) {
  const [clicked, setClicked] = useState(false)
  const [toggle, setToggle] = useState(isChecked)

  const handleToggle = useCallback(() => {
    setClicked(true)
    setToggle(!isChecked)
    onChange(!isChecked)
  }, [isChecked, onChange])

  useEffect(() => {
    if (clicked && toggle === isChecked) {
      setToggle(isChecked)
      setClicked(false)
    }
  }, [isChecked, toggle, clicked])

  const isToggleLoading = toggle !== isChecked || isLoading
  const iconsCommonSx: SxStyleProp = {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    margin: 'auto',
    backgroundSize: '100% 100%',
    transition: 'transform 200ms, opacity 200ms',
  }

  return (
    <Box
      as="label"
      sx={{
        position: 'relative',
        display: 'inline-block',
        width: '48px',
        height: '24px',
        backgroundColor: isChecked ? 'interactive10' : 'secondary60',
        borderRadius: 'round',
        transition: 'background-color 200ms',
        cursor: 'pointer',
        ...sx,
      }}
    >
      <Input
        sx={{
          opacity: 0,
          pointerEvents: 'none',
        }}
        type="checkbox"
        onChange={handleToggle}
      />
      <Box
        as="span"
        sx={{
          position: 'absolute',
          top: '2px',
          left: '2px',
          height: '20px',
          width: '20px',
          backgroundColor: isChecked ? 'interactive100' : 'primary30',
          borderRadius: 'circle',
          transition: 'transform 200ms, background-color 200ms',
          transform: isChecked ? 'translateX(24px)' : 'translateX(0px)',
        }}
      >
        <Box
          as="span"
          sx={{
            width: '40%',
            height: '40%',
            backgroundImage: notCheckedToggleDataIcon,
            transform: isChecked ? 'translateY(10px)' : 'translateY(0px)',
            opacity: isChecked ? 0 : 1,
            ...iconsCommonSx,
          }}
        />
        <Box
          as="span"
          sx={{
            width: '50%',
            height: '50%',
            backgroundImage: checkedToggleDataIcon,
            transform: isChecked ? 'translateY(0px)' : 'translateY(-10px)',
            opacity: isChecked ? 1 : 0,
            ...iconsCommonSx,
          }}
        />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: 1,
          left: '100%',
          ml: 1,
        }}
      >
        {isToggleLoading && <AppSpinner />}
      </Box>
    </Box>
  )
}
