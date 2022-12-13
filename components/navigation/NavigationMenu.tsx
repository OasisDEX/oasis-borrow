import { AppLink } from 'components/Links'
import {
  NavigationMenuLink,
  NavigationMenuPanelLinkProps,
} from 'components/navigation/NavigationMenuLink'
import {
  NavigationMenuPanel,
  NavigationMenuPanelProps,
} from 'components/navigation/NavigationMenuPanel'
import React, { ReactNode } from 'react'
import { Box, Flex } from 'theme-ui'

interface NavigationMenuProps {
  links?: NavigationMenuPanelLinkProps[]
  panels?: NavigationMenuPanelProps[]
}

export function NavigationMenu({ links, panels }: NavigationMenuProps) {
  return (
    <>
      {(links || panels) && (
        <Flex as="ul" sx={{ p: 0, listStyle: 'none', columnGap: '48px' }}>
          {panels?.map((panel, i) => (
            <NavigationMenuPanel key={`panel-${panel.label}`} {...panel} />
          ))}
          {links?.map((link, i) => (
            <NavigationMenuLink key={`link-${link.label}`} {...link} />
          ))}
        </Flex>
      )}
    </>
  )
}
