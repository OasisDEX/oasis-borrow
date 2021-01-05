import { isAppContextAvailable, useAppContext } from 'components/AppContextProvider'
import { useObservable } from 'helpers/observableHook'
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
    return (
      <InternalLink
        {...{ href, sx, variant, onClick, isAppContextAvailable: isAppContextAvailable(), ...rest }}
      >
        {children}
      </InternalLink>
    )
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
  isAppContextAvailable,
  withAccountPrefix = true,
  variant,
  onClick,
  ...rest
}: AppLinkProps & { isAppContextAvailable: boolean }) {
  const {
    query: { network },
  } = useRouter()
  let readOnlyHref = href
  let readOnlyAs = as

  if (isAppContextAvailable && withAccountPrefix) {
    const { readonlyAccount$ } = useAppContext()
    const readonlyAccount = useObservable(readonlyAccount$)

    if (readonlyAccount && href.startsWith('/')) {
      readOnlyHref = `/[address]${href}`
      readOnlyAs = `/${readonlyAccount}${as || href}`
    }
  }

  const actualHref =
    isAppContextAvailable && network
      ? { pathname: readOnlyHref as string, query: { network } }
      : readOnlyHref

  const actualAs =
    readOnlyAs && isAppContextAvailable && network
      ? { pathname: readOnlyAs as string, query: { network } }
      : readOnlyAs

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
