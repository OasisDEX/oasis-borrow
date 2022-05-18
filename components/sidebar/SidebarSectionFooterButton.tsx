import React from 'react'
import { Button, Spinner } from 'theme-ui'

export interface SidebarSectionFooterButtonProps {
  variant?: string
  label: string
  steps?: [number, number]
  disabled?: boolean
  isLoading?: boolean
  action: () => void
}

export function SidebarSectionFooterButton({
  variant = 'primary',
  label,
  steps,
  disabled,
  isLoading,
  action,
}: SidebarSectionFooterButtonProps) {
  return (
    <Button
      disabled={disabled}
      variant={variant}
      onClick={() => {
        action()
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {isLoading && <Spinner size={24} color="surface" sx={{ mr: 2, mb: '2px' }} />}
      {label} {steps && `(${steps[0]}/${steps[1]})`}
    </Button>
  )
}
