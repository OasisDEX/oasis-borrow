import React from 'react'
import { Label } from 'theme-ui'

export function AllowanceOption(props: React.PropsWithChildren<{ onClick?: () => void }>) {
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
      onClick={props.onClick}
    >
      {props.children}
    </Label>
  )
}
