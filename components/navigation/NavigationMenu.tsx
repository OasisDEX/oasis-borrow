import { AppLink } from 'components/Links'
import { NavigationMenuDropdown } from 'components/navigation/NavigationMenuDropdown'
import {
  NavigationMenuLink,
  NavigationMenuPanelLinkType,
} from 'components/navigation/NavigationMenuLink'
import {
  NavigationMenuPanel,
  NavigationMenuPanelType,
} from 'components/navigation/NavigationMenuPanel'
import React, { ReactNode, useState } from 'react'
import { Box, Flex } from 'theme-ui'

interface NavigationMenuProps {
  links?: NavigationMenuPanelLinkType[]
  panels?: NavigationMenuPanelType[]
}

export function NavigationMenu({ links, panels }: NavigationMenuProps) {
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false)
  const [isPanelSwitched, setIsPanelSwitched] = useState<boolean>(false)
  const [currentPanel, setCurrentPanel] = useState<string>()
  const [arrowPosition, setArrowPosition] = useState<number>(0)

  function closeDropdown() {
    setIsPanelSwitched(false)
    setIsPanelOpen(false)
    setCurrentPanel(undefined)
  }

  return (
    <Box sx={{ position: 'relative' }} onMouseLeave={() => closeDropdown()}>
      {((links && links.length > 0) || (panels && panels.length > 0)) && (
        <Flex as="ul" sx={{ p: 0, listStyle: 'none', columnGap: '48px' }}>
          {panels?.map((panel, i) => (
            <NavigationMenuPanel
              key={`panel-${panel.label}`}
              currentPanel={currentPanel}
              {...panel}
              onMouseEnter={(center) => {
                setIsPanelSwitched(isPanelOpen)
                setIsPanelOpen(true)
                setCurrentPanel(panel.label)
                setArrowPosition(center)
              }}
            />
          ))}
          {links?.map((link, i) => (
            <NavigationMenuLink
              key={`link-${link.label}`}
              {...link}
              onMouseEnter={() => closeDropdown()}
            />
          ))}
        </Flex>
      )}
      {panels && panels.length > 0 && (
        <NavigationMenuDropdown
          arrowPosition={arrowPosition}
          currentPanel={currentPanel}
          isPanelOpen={isPanelOpen}
          isPanelSwitched={isPanelSwitched}
        />
      )}
    </Box>
  )
}
