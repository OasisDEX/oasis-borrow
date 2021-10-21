import { Icon } from '@makerdao/dai-ui-icons'
import { WithChildren } from 'helpers/types'
import getConfig from 'next/config'
import { LinkProps } from 'next/dist/client/link'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import { Link as ThemeLink, SxStyleProp, Text } from 'theme-ui'

const {
  publicRuntimeConfig: { apiHost },
} = getConfig()

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

export function AppLinkWithArrow({ href, children }: AppLinkProps & WithChildren) {
  return (
    <AppLink href={href} sx={{ display: 'flex', alignItems: 'center', color: 'primary' }}>
      <Text mr={1}>{children}</Text>
      <Icon name="arrow_right" size="auto" width="14px" />
    </AppLink>
  )
}

export const ROUTES = {
  CONTACT: `${apiHost}/daiwallet/contact`,
  SUPPORT: '/support',
  TWITTER: 'https://twitter.com/oasisdotapp',
  DISCORD: 'https://discord.gg/Kc2bBB59GC',
}
