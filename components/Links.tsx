import { WithChildren } from 'helpers/types'
import { LinkProps } from 'next/dist/client/link'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import { Link as ThemeLink, SxStyleProp } from 'theme-ui'

export interface AppLinkProps extends WithChildren, LinkProps {
  disabled?: boolean
  href: string
  sx?: SxStyleProp
  variant?: string
  internalInNewTab?: boolean
  withAccountPrefix?: boolean
  onClick?: () => void
  target?: string
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
  const isInternalLink = href && (href.startsWith('/') || href.startsWith('#'))

  if (disabled) return children

  if (isInternalLink) {
    return <InternalLink {...{ href, sx, variant, onClick, ...rest }}>{children}</InternalLink>
  }

  return (
    <ThemeLink {...{ sx, href, variant, target: target || '_blank', onClick }}>
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
  ...rest
}: AppLinkProps) {
  // useRouter cannot be used with storybook. The router is undefined.
  const network = useRouter()?.query.network
  const readOnlyHref = href
  const readOnlyAs = as

  const actualHref = network ? { pathname: readOnlyHref, query: { network } } : readOnlyHref

  const actualAs =
    readOnlyAs && network ? { pathname: readOnlyAs as string, query: { network } } : readOnlyAs

  return (
    <Link href={actualHref} as={actualAs} passHref {...rest}>
      <ThemeLink target={internalInNewTab ? '_blank' : '_self'} {...{ sx, variant, onClick }}>
        {children}
      </ThemeLink>
    </Link>
  )
}

// repeatable links to external resources
export const EXTERNAL_LINKS = {
  borrow: 'https://oasis.app/borrow',
}

export function CustomMDXLink(props: AppLinkProps) {
  return <AppLink {...props} />
}
