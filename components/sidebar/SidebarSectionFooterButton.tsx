import { AppLink } from 'components/Links'
import React from 'react'
import { Button, Link, Spinner } from 'theme-ui'

export interface SidebarSectionFooterButtonProps {
  disabled?: boolean
  hidden?: boolean
  isLoading?: boolean
  label: string
  steps?: [number, number]
  url?: string
  variant?: string
  withoutNextLink?: boolean
  action?: () => void
}

export function SidebarSectionFooterButton({
  hidden,
  url,
  withoutNextLink,
  ...rest
}: SidebarSectionFooterButtonProps) {
  return (
    <>
      {!hidden &&
        (url ? (
          withoutNextLink ? (
            <Link href={url} sx={{ display: 'block', bg: 'red' }}>
              <SidebarSectionFooterButtonIner {...rest} />
            </Link>
          ) : (
            <AppLink href={url} sx={{ display: 'block' }}>
              <SidebarSectionFooterButtonIner {...rest} />
            </AppLink>
          )
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
