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

  return (
    <Box
      as="label"
      sx={{
        position: 'relative',
        display: 'inline-block',
        width: '48px',
        height: '24px',
        ...sx,
      }}
    >
      <Input
        sx={{
          opacity: 0,
          width: 0,
          height: 0,
        }}
        type="checkbox"
        onChange={handleToggle}
      />
      <Box
        as="span"
        sx={{
          '&:before': {
            position: 'absolute',
            content: isChecked ? checkedToggleDataIcon : notCheckedToggleDataIcon,
            height: '20px',
            display: 'block',
            width: '20px',
            marginTop: '2px',
            ...(!isChecked && { marginLeft: '2px' }),
            backgroundColor: isChecked ? 'interactive100' : 'primary30',
            borderRadius: 'circle',
            textAlign: 'center',
            lineHeight: isChecked ? '1.2' : '1',
            transition: '.4s',
            ...(isChecked && { transform: 'translateX(26px)' }),
          },
          position: 'absolute',
          cursor: 'pointer',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: isChecked ? 'interactive10' : 'secondary60',
          transition: '.4s',
          borderRadius: 'round',
        }}
      />
      {isToggleLoading && <AppSpinner />}
    </Box>
  )
}
