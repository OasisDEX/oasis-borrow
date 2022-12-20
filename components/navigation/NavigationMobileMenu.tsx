import { Icon } from '@makerdao/dai-ui-icons'
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
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: ['100%', 'auto'],
        minWidth: '50%',
        p: 3,
        bg: 'neutral10',
        boxShadow: 'buttonMenu',
        overflow: 'hidden',
        zIndex: 4,
        transform: `translateX(${isOpen ? '0' : '-100%'})`,
        transition: 'transform 200ms',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          boxShadow: 'inset 0 -20px 10px -10px white, inset 0 20px 10px -10px white',
          pointerEvents: 'none',
        },
      }}
    >
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
      <Box
        sx={{
          position: 'absolute',
          right: 0,
          bottom: 3,
          left: 0,
          width: '58px',
          margin: 'auto',
          color: 'neutral80',
          overflow: 'hidden',
          cursor: 'pointer',
          '&:hover': {
            color: 'primary100',
          },
        }}
        onClick={close}
      >
        <Icon
          name="mobile_menu_close"
          size={58}
          sx={{
            p: 1,
            borderRadius: 'circle',
            bg: 'neutral10',
            transition: 'color 200ms',
          }}
        />
      </Box>
    </Box>
  )
}
