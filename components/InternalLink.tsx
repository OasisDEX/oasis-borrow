import Link from 'next/link'
import type { PropsWithChildren } from 'react'
import React from 'react'
import { Link as ThemeLink } from 'theme-ui'

import type { AppLinkProps } from './Links.types'

export function InternalLink({
  as,
  children,
  hash,
  href,
  internalInNewTab,
  onClick,
  sx,
  query,
  variant,
  ...rest
}: PropsWithChildren<AppLinkProps>) {
  const readOnlyHref = href
  const readOnlyAs = as

  const actualHref = { pathname: readOnlyHref as string, hash, query }

  const actualAs = readOnlyAs ? { pathname: readOnlyAs as string } : readOnlyAs

  return (
    <Link href={actualHref} as={actualAs} passHref {...rest} legacyBehavior>
      <ThemeLink target={internalInNewTab ? '_blank' : '_self'} {...{ sx, variant, onClick }}>
        {children}
      </ThemeLink>
    </Link>
  )
}
