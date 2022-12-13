import { AppLink } from 'components/Links'
import React from 'react'
import { Box, Flex } from 'theme-ui'

export interface NavigationMenuLink {
  label: string
  link: string
}

interface NavigationMenuProps {
  links: NavigationMenuLink[]
}

export function NavigationMenu({ links }: NavigationMenuProps) {
  return (
    <Flex as="ul" sx={{ p: 0, listStyle: 'none', columnGap: '48px' }}>
      {links?.map(({ label, link }) => (
        <Box key={link} as="li">
          <AppLink
            href={link}
            sx={{
              color: 'neutral80',
              transition: 'color 200ms',
              '&:hover': { color: 'primary100' },
            }}
          >
            {label}
          </AppLink>
        </Box>
      ))}
    </Flex>
  )
}
