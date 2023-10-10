import { AppLink } from 'components/Links'
import { useRouter } from 'next/router'
import type { ReactNode } from 'react'
import React from 'react'
import { Box, Text } from 'theme-ui'

interface NavigationMenuPanelLinkWithUrl {
  link: string
  onClick?: never
}

interface NavigationMenuPanelLinkWithAction {
  link?: never
  onClick: () => void
}

export type NavigationMenuPanelLinkType = (
  | NavigationMenuPanelLinkWithUrl
  | NavigationMenuPanelLinkWithAction
) & {
  label: ReactNode
}
type NavigationMenuPanelLinkProps = NavigationMenuPanelLinkType & {
  onMouseEnter(): void
}

export function NavigationMenuLink({
  label,
  link,
  onClick,
  onMouseEnter,
}: NavigationMenuPanelLinkProps) {
  const { asPath } = useRouter()

  return (
    <Box
      as="li"
      sx={{
        flexShrink: 0,
      }}
      onMouseEnter={onMouseEnter}
    >
      {link && (
        <AppLink
          href={link}
          sx={{
            color: asPath.includes(link) ? 'primary100' : 'neutral80',
            whiteSpace: 'nowrap',
            transition: 'color 200ms',
            '&:hover': { color: 'primary100' },
          }}
        >
          {label}
        </AppLink>
      )}
      {onClick && (
        <Text
          as="span"
          variant="boldParagraph3"
          onClick={onClick}
          sx={{
            color: 'neutral80',
            whiteSpace: 'nowrap',
            transition: 'color 200ms',
            cursor: 'pointer',
            '&:hover': { color: 'primary100' },
          }}
        >
          {label}
        </Text>
      )}
    </Box>
  )
}
