import React from 'react'
import { Label, Radio as ThemeRadio } from 'theme-ui'

interface Props {
  onChange?: () => void
  checked: boolean
  name: string
}
export function Radio({ children, checked, onChange, name }: React.PropsWithChildren<Props>) {
  return (
    <Label
      sx={{
        border: 'light',
        borderRadius: 'mediumLarge',
        display: 'flex',
        alignItems: 'center',
        px: 3,
        boxSizing: 'border-box',
        cursor: 'pointer',
        transition: `
          border-color ease-in 0.2s,
          box-shadow ease-in 0.2s`,
        '&:hover': {
          borderColor: 'primary100',
          boxShadow: 'medium',
        },
      }}
    >
      <ThemeRadio onChange={onChange} name={name} checked={checked} />
      {children}
    </Label>
  )
}
