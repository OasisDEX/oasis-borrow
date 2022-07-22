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
            content: checked
              ? `url("data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 10 10' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M9.65295 0.966583C9.94751 1.21696 9.98333 1.65873 9.73295 1.95329L3.78297 8.95328C3.6511 9.10841 3.45823 9.19845 3.25463 9.19991C3.05103 9.20137 2.85688 9.11411 2.72281 8.96088L0.272815 6.16088C0.0182381 5.86994 0.0477202 5.42771 0.338665 5.17313C0.62961 4.91855 1.07184 4.94803 1.32642 5.23898L3.24193 7.42813L8.66624 1.04659C8.91662 0.752022 9.35838 0.716203 9.65295 0.966583Z' fill='white'/%3E%3C/svg%3E%0A")`
              : `url("data:image/svg+xml,%3Csvg width='8' height='8' viewBox='0 0 8 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0.535104 7.46487C0.261737 7.1915 0.261737 6.74829 0.535104 6.47492L6.4748 0.535225C6.74817 0.261859 7.19138 0.261858 7.46475 0.535225C7.73812 0.808592 7.73812 1.25181 7.46475 1.52517L1.52505 7.46487C1.25169 7.73824 0.808471 7.73824 0.535104 7.46487Z' fill='white'/%3E%3Cpath d='M7.46475 7.46487C7.19138 7.73824 6.74817 7.73824 6.4748 7.46487L0.535103 1.52518C0.261737 1.25181 0.261736 0.808593 0.535103 0.535226C0.80847 0.261859 1.25169 0.26186 1.52505 0.535226L7.46475 6.47492C7.73812 6.74829 7.73812 7.19151 7.46475 7.46487Z' fill='white'/%3E%3C/svg%3E%0A")`,
            height: '20px',
            display: 'block',
            width: '20px',
            marginTop: '2px',
            ...(!checked && { marginLeft: '2px' }),
            backgroundColor: checked ? '#575CFE' : '#80818A',
            borderRadius: '50%',
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
          backgroundColor: checked ? '#EDEDFF' : '#F1F3F4',
          transition: '.4s',
          borderRadius: '34px',
        }}
      />
    </Box>
  )
}
