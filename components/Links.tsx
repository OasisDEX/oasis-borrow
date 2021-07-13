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
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
  target?: string
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

export function CustomMDXLink(props: AppLinkProps) {
  return <AppLink {...props} />
}
