import Link from 'next/link'
import React from 'react'
import { Link as ThemeLink } from 'theme-ui'

import type { AppLinkProps } from './Links.types'

export function InternalLink({
  href,
  sx,
  children,
  internalInNewTab,
  as,
  variant,
  onClick,
  hash,
  ...rest
}: AppLinkProps) {
  const readOnlyHref = href
  const readOnlyAs = as

  const actualHref = { pathname: readOnlyHref as string, hash }

  const actualAs = readOnlyAs ? { pathname: readOnlyAs as string } : readOnlyAs

  return (
    <Link href={actualHref} as={actualAs} passHref {...rest} legacyBehavior>
      <ThemeLink target={internalInNewTab ? '_blank' : '_self'} {...{ sx, variant, onClick }}>
        {children}
      </ThemeLink>
    </Link>
  )
}
