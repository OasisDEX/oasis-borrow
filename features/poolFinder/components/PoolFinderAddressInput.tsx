import React, { FC } from 'react'
import { Box, Input, Label } from 'theme-ui'

interface PoolFinderAddressInputProps {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
}

export const PoolFinderAddressInput: FC<PoolFinderAddressInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
}) => {
  return (
    <Box
      sx={{
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: '-24px',
          bottom: 0,
          width: '1px',
          backgroundColor: 'neutral20',
        },
        ':last-of-type': {
          '&::after': {
            content: 'none',
          },
        },
      }}
    >
      <Label htmlFor={label} variant="text.paragraph4">
        {label}
      </Label>
      <Input
        id={label}
        placeholder={placeholder}
        value={value}
        sx={{
          mt: 1,
          p: 0,
          fontSize: 3,
          lineHeight: 'body',
          color: 'primary100',
          border: 'none',
          borderRadius: 0,
          '::placeholder': {
            color: 'primary30',
          },
        }}
        onChange={(e) => onChange(e.target.value.toLowerCase())}
      />
    </Box>
  )
}
