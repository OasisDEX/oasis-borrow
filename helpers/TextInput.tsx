import React from 'react'
import { Box, Input, Label } from 'theme-ui'

interface TextInputProps {
  disabled?: boolean
  hasError?: boolean
  label: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
}

export function TextInput({
  disabled,
  hasError,
  label,
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
      <Label variant="text.paragraph4" sx={{ pb: 2, fontWeight: 'semiBold' }}>
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
