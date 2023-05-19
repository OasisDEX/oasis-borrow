import { DrawerMenu } from 'components/DrawerMenu'
import { NavigationMenuPanelLinkType } from 'components/navigation/NavigationMenuLink'
import { NavigationMenuPanelType } from 'components/navigation/NavigationMenuPanel'
import { NavigationMobileMenuLink } from 'components/navigation/NavigationMobileMenuLink'
import { NavigationMobileMenuPanel } from 'components/navigation/NavigationMobileMenuPanel'
import React from 'react'
import { Box } from 'theme-ui'

interface NavigationMobileMenuProps {
  close: () => void
  isOpen: boolean
  links?: NavigationMenuPanelLinkType[]
  panels?: NavigationMenuPanelType[]
}

export function NavigationMobileMenu({ close, isOpen, links, panels }: NavigationMobileMenuProps) {
  return (
    <DrawerMenu isOpen={isOpen} onClose={close}>
      {((links && links.length > 0) || (panels && panels.length > 0)) && (
        <Box
          as="ul"
          sx={{
            listStyle: 'none',
            p: 0,
          }}
        >
          {panels?.map((panel) => (
            <NavigationMobileMenuPanel key={`panel-${panel.label}`} isOpen={isOpen} {...panel} />
          ))}
          {links?.map((link) => (
            <NavigationMobileMenuLink key={`link-${link.label}`} {...link} />
          ))}
        </Box>
      )}
    </DrawerMenu>
  )
}
