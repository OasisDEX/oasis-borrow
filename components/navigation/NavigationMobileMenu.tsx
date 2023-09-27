import { Icon } from '@makerdao/dai-ui-icons'
import { DrawerMenu } from 'components/DrawerMenu'
import type { NavigationMenuPanelLinkType } from 'components/navigation/NavigationMenuLink'
import type { NavigationMenuPanelType } from 'components/navigation/NavigationMenuPanel'
import { NavigationMobileMenuLink } from 'components/navigation/NavigationMobileMenuLink'
import { NavigationMobileMenuPanel } from 'components/navigation/NavigationMobileMenuPanel'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import React from 'react'
import { Flex, Image } from 'theme-ui'

interface NavigationMobileMenuProps {
  close: () => void
  isOpen: boolean
  links?: NavigationMenuPanelLinkType[]
  panels?: NavigationMenuPanelType[]
}

export function NavigationMobileMenu({ close, isOpen, links, panels }: NavigationMobileMenuProps) {
  return (
    <DrawerMenu
      isOpen={isOpen}
      onClose={close}
      position="right"
      closeButton={false}
      sxOverride={{
        width: ['100%', '368px'],
      }}
    >
      <Flex sx={{ flexDirection: 'column', height: '100%', }}>
        <Flex
          sx={{
            justifyContent: 'space-between',
            pt: 1,
            pb: '20px',
            borderBottom: '1px solid',
            borderBottomColor: 'neutral20',
          }}
        >
          <Image sx={{ width: 4 }} src={staticFilesRuntimeUrl('/static/img/logos/dot_color.svg')} />
          <Flex
            sx={{
              justifyContent: 'center',
              alignItems: 'center',
              width: 4,
              cursor: 'pointer',
              color: 'primary60',
              transition: 'color 200ms',
              '&:hover': {
                color: 'primary100',
              },
            }}
            onClick={close}
          >
            <Icon name="close" size={16} />
          </Flex>
        </Flex>
        {((links && links.length > 0) || (panels && panels.length > 0)) && (
          <Flex
            as="ul"
            sx={{
              flexDirection: 'column',
              rowGap: '24px',
              height: '100%',
              py: 3,
              px: 0,
              listStyle: 'none',
              overflowY: 'auto',
            }}
          >
            {panels?.map((panel) => (
              <NavigationMobileMenuPanel key={`panel-${panel.label}`} isOpen={isOpen} {...panel} />
            ))}
            {links?.map((link) => (
              <NavigationMobileMenuLink key={`link-${link.label}`} {...link} />
            ))}
          </Flex>
        )}
      </Flex>
    </DrawerMenu>
  )
}
