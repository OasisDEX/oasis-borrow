import { AppLink } from 'components/Links'
import React from 'react'
import type { ThemeUIStyleObject } from 'theme-ui'
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
  sx?: ThemeUIStyleObject
  target?: string
}

export function SidebarSectionFooterButton({
  hidden,
  url,
  withoutNextLink,
  target,
  ...rest
}: SidebarSectionFooterButtonProps) {
  return (
    <>
      {!hidden &&
        (url ? (
          withoutNextLink ? (
            <Link href={url} sx={{ display: 'block' }} target={target}>
              <SidebarSectionFooterButtonIner {...rest} />
            </Link>
          ) : (
            <AppLink href={url} sx={{ display: 'block' }} target={target}>
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
  sx,
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
        ...sx,
      }}
    >
      {isLoading && <Spinner size={24} color="neutral10" sx={{ mr: 2, mb: '2px' }} />}
      {label} {steps && `(${steps[0]}/${steps[1]})`}
    </Button>
  )
}
