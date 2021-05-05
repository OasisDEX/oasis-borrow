import React from 'react'
import { Label, Radio as ThemeRadio } from 'theme-ui'

interface Props {
  onClick?: () => void
  checked: boolean
  defaultChecked?: boolean
  name: string
}
export function Radio({
  children,
  checked,
  onClick,
  defaultChecked,
  name,
}: React.PropsWithChildren<Props>) {
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
          borderColor: 'primary',
          boxShadow: 'medium',
        },
      }}
      onClick={onClick}
    >
      <ThemeRadio name={name} defaultChecked={!!defaultChecked} checked={checked} />
      {children}
    </Label>
  )
}
