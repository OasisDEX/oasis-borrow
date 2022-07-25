import { useRedirect } from 'helpers/useRedirect'
import React from 'react'
import { Button, Spinner } from 'theme-ui'

export interface SidebarSectionFooterButtonProps {
  variant?: string
  label: string
  steps?: [number, number]
  disabled?: boolean
  hidden?: boolean
  isLoading?: boolean
  action?: () => void
  url?: string
}

export function SidebarSectionFooterButton({
  variant = 'primary',
  label,
  steps,
  disabled,
  hidden,
  isLoading,
  action,
  url,
}: SidebarSectionFooterButtonProps) {
  const { replace } = useRedirect()

  return (
    <>
      {!hidden && (
        <Button
          disabled={disabled}
          variant={variant}
          onClick={() => {
            if (action) action()
            if (url) replace(url)
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isLoading && <Spinner size={24} color="neutral10" sx={{ mr: 2, mb: '2px' }} />}
          {label} {steps && `(${steps[0]}/${steps[1]})`}
        </Button>
      )}
    </>
  )
}
