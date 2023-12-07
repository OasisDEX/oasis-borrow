import type { FC } from 'react'
import React from 'react'
import { Flex, Input, Label } from 'theme-ui'

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
    <Flex
      sx={{
        position: 'relative',
        flexDirection: 'column',
        alignItems: 'flex-start',
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
      <Label htmlFor={label} variant="text.paragraph4" sx={{ position: 'relative', width: 'auto' }}>
        {label}
      </Label>
      <Input
        id={label}
        type="text"
        autoComplete="off"
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
        onChange={(e) => onChange(e.target.value)}
      />
    </Flex>
  )
}
