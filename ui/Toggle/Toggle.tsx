import { checkedToggleDataIcon, notCheckedToggleDataIcon } from 'helpers/icons'
import React, { useCallback, useState } from 'react'
import { Box, Input, SxStyleProp } from 'theme-ui'

interface ToggleProps {
  isChecked: boolean
  onChange: (checked: boolean) => void
  sx?: SxStyleProp
}

export function Toggle({ isChecked, onChange, sx }: ToggleProps) {
  const [checked, setChecked] = useState(isChecked)

  const handleToggle = useCallback(() => {
    onChange(!checked)
    setChecked((prev) => !prev)
  }, [checked])

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
