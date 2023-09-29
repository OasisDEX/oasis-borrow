import { NavigationMenuDropdown } from 'components/navigation/NavigationMenuDropdown'
import { NavigationMenuLink } from 'components/navigation/NavigationMenuLink'
import { NavigationMenuPanel } from 'components/navigation/NavigationMenuPanel'
import React, { useState } from 'react'
import { Flex } from 'theme-ui'

import type { NavigationMenuPanelLinkType, NavigationMenuPanelType } from './Navigation.types'

interface NavigationMenuProps {
  links?: NavigationMenuPanelLinkType[]
  panels?: NavigationMenuPanelType[]
}

export function NavigationMenu({ links, panels }: NavigationMenuProps) {
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false)
  const [isPanelSwitched, setIsPanelSwitched] = useState<boolean>(false)
  const [currentPanel, setCurrentPanel] = useState<string>(panels?.[0].label ?? '')
  const [arrowPosition, setArrowPosition] = useState<number>(0)

  function closeDropdown() {
    setIsPanelSwitched(false)
    setIsPanelOpen(false)
  }

  return (
    <Flex
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        zIndex: 2,
      }}
      onMouseLeave={() => closeDropdown()}
    >
      {((links && links.length > 0) || (panels && panels.length > 0)) && (
        <Flex
          as="ul"
          sx={{
            listStyle: 'none',
            columnGap: [4, null, null, '40px', '48px'],
            justifyContent: 'center',
            p: 0,
          }}
        >
          {panels?.map((panel) => (
            <NavigationMenuPanel
              key={`panel-${panel.label}`}
              currentPanel={currentPanel}
              isPanelOpen={isPanelOpen}
              {...panel}
              onMouseEnter={(center) => {
                setIsPanelSwitched(isPanelOpen)
                setIsPanelOpen(true)
                setCurrentPanel(panel.label)
                setArrowPosition(center)
              }}
            />
          ))}
          {links?.map((link) => (
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
          panels={panels}
        />
      )}
    </Flex>
  )
}
