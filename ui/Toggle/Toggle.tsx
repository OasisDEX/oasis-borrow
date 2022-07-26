import { checkedToggleDataIcon, notCheckedToggleDataIcon } from 'helpers/icons'
import React, { useState } from 'react'
import { Box, Input } from 'theme-ui'

interface ToggleProps {
  isChecked: boolean
  onChangeHandler?: () => void
  sx?: any
}

export function Toggle({ isChecked, onChangeHandler, sx }: ToggleProps) {
  // TODO: Update this
  const checked = isChecked
  const [, setChecked] = useState(isChecked)

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
        // TODO: Update this to use only parsed handler
        onChange={onChangeHandler ? () => onChangeHandler() : () => setChecked(!checked)}
      />
      <Box
        as="span"
        sx={{
          '&:before': {
            position: 'absolute',
            // TODO: Possibly create a function to do this so that is more readable
            content: checked ? checkedToggleDataIcon : notCheckedToggleDataIcon,
            height: '20px',
            display: 'block',
            width: '20px',
            marginTop: '2px',
            ...(!checked && { marginLeft: '2px' }),
            backgroundColor: checked ? 'interactive100' : 'primary30',
            borderRadius: 'circle',
            textAlign: 'center',
            lineHeight: checked ? '1.2' : '1',
            transition: '.4s',
            ...(checked && { transform: 'translateX(26px)' }),
          },
          position: 'absolute',
          cursor: 'pointer',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: checked ? 'interactive10' : 'secondary60',
          transition: '.4s',
          borderRadius: 'round',
        }}
      />
    </Box>
  )
}
