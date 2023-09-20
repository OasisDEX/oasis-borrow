import type { WithChildren } from 'helpers/types'
import type { LinkProps } from 'next/dist/client/link'
import Link from 'next/link'
import React from 'react'
import type { SxStyleProp } from 'theme-ui'
import { Link as ThemeLink } from 'theme-ui'

export interface AppLinkProps extends WithChildren, LinkProps {
  disabled?: boolean
  href: string
  sx?: SxStyleProp
  variant?: string
  internalInNewTab?: boolean
  withAccountPrefix?: boolean
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
  target?: string
  hash?: string
}

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

function InternalLink({
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

export function CustomMDXLink(props: AppLinkProps) {
  return <AppLink {...props} />
}
