import { AppLink } from 'components/Links'
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
  hidden,
  url,
  ...rest
}: SidebarSectionFooterButtonProps) {
  return (
    <>
      {!hidden &&
        (url ? (
          <AppLink href={url} sx={{ display: 'block' }}>
            <SidebarSectionFooterButtonIner {...rest} />
          </AppLink>
        ) : (
          <SidebarSectionFooterButtonIner {...rest} />
        ))}
    </>
  )
}

export function SidebarSectionFooterButtonIner({
  variant = 'primary',
  label,
  steps,
  disabled,
  isLoading,
  action,
}: Omit<SidebarSectionFooterButtonProps, 'hidden' | 'url'>) {
  return (
    <Button
      disabled={disabled}
      variant={variant}
      onClick={() => {
        if (action) action()
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      {isLoading && <Spinner size={24} color="neutral10" sx={{ mr: 2, mb: '2px' }} />}
      {label} {steps && `(${steps[0]}/${steps[1]})`}
    </Button>
  )
}
