import React from 'react'
import { Box, Input, Label } from 'theme-ui'

interface TextInputProps {
  disabled?: boolean
  hasError?: boolean
  label: string
  large?: boolean
  muted?: boolean
  placeholder?: string
  value: string
  onChange: (value: string) => void
}

export function TextInput({
  disabled,
  hasError,
  label,
  large,
  muted,
  placeholder,
  value,
  onChange,
}: TextInputProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        opacity: disabled ? '0.5' : '1',
        cursor: disabled ? 'not-allowed' : 'default',
        transition: 'opacity 200ms',
      }}
    >
      <Label
        variant={large ? 'text.paragraph3' : 'text.paragraph4'}
        sx={{
          pb: 2,
          color: muted ? 'neutral80' : 'primary100',
          fontWeight: muted ? 'regular' : 'semiBold',
        }}
      >
        {label}
      </Label>
      <Input
        type="text"
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        value={value}
        placeholder={placeholder}
        sx={{
          p: 3,
          border: '1px solid',
          borderRadius: 'medium',
          color: 'primary100',
          fontSize: muted ? 3 : 4,
          fontWeight: 'semiBold',
          borderColor: hasError ? 'critical100' : 'neutral20',
          transition: 'box-shadow 200ms, border-color 200ms',
          '&::placeholder': { color: 'neutral80' },
          ...(!disabled && {
            '&:hover, &:focus-within': {
              borderColor: hasError ? 'critical100' : 'neutral70',
            },
          }),
        }}
      />
    </Box>
  )
}
