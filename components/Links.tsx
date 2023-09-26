import React from 'react'
import { Link as ThemeLink } from 'theme-ui'

import { InternalLink } from './InternalLink'
import type { AppLinkProps } from './Links.types'

export function getIsInternalLink(href: string) {
  return href.startsWith('/') || href.startsWith('#')
}

export function AppLink({
  href,
  children,
  disabled,
  sx,
  variant = 'styles.a',
  onClick,
  target,
  ...rest
}: AppLinkProps) {
  const isInternalLink = href && getIsInternalLink(href)

  if (disabled) return children

  if (isInternalLink) {
    return <InternalLink {...{ href, sx, variant, onClick, ...rest }}>{children}</InternalLink>
  }

  return (
    <ThemeLink
      {...{ sx, href, variant, target: target || '_blank', onClick }}
      rel="noopener noreferrer"
    >
      {children}
    </ThemeLink>
  )
}
