import { DrawerMenu } from 'components/DrawerMenu'
import { Icon } from 'components/Icon'
import { NavigationMobileMenuLink } from 'components/navigation/NavigationMobileMenuLink'
import { NavigationMobileMenuPanel } from 'components/navigation/NavigationMobileMenuPanel'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import { arrow_left, close as closeIcon } from 'theme/icons'
import { Flex, Image } from 'theme-ui'

import type { NavigationMenuPanelLinkType, NavigationMenuPanelType } from './Navigation.types'

interface NavigationMobileMenuProps {
  close: () => void
  isOpen: boolean
  links?: NavigationMenuPanelLinkType[]
  panels?: NavigationMenuPanelType[]
}

export function NavigationMobileMenu({ close, isOpen, links, panels }: NavigationMobileMenuProps) {
  const { t } = useTranslation()
  const [openNestedMenu, setOpenNestedMenu] = useState<[string, number, number]>()

  return (
    <DrawerMenu
      isOpen={isOpen}
      onClose={close}
      position="right"
      closeButton={false}
      sxOverride={{
        width: ['100%', '368px'],
        pb: 0,
      }}
    >
      <Flex sx={{ flexDirection: 'column', height: '100%' }}>
        <Flex
          sx={{
            justifyContent: 'space-between',
            pt: 1,
            pb: '20px',
            borderBottom: '1px solid',
            borderBottomColor: 'neutral20',
          }}
        >
          {openNestedMenu ? (
            <Flex
              as="span"
              variant="text.boldParagraph3"
              sx={{
                alignItems: 'center',
                lineHeight: '28px',
                color: 'primary100',
                cursor: 'pointer',
              }}
              onClick={() => setOpenNestedMenu(undefined)}
            >
              <Icon icon={arrow_left} size={16} sx={{ mr: 2 }} />
              {t('back')}
            </Flex>
          ) : (
            <Image
              sx={{ height: '28px' }}
              src={staticFilesRuntimeUrl('/static/img/logos/dot_color.svg')}
            />
          )}
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
            onClick={() => {
              setOpenNestedMenu(undefined)
              close()
            }}
          >
            <Icon icon={closeIcon} size={16} />
          </Flex>
        </Flex>
        {((links && links.length > 0) || (panels && panels.length > 0)) && (
          <Flex
            as="ul"
            sx={{
              flexDirection: 'column',
              rowGap: '24px',
              height: '100%',
              pt: 3,
              px: 0,
              listStyle: 'none',
              overflowY: 'auto',
            }}
          >
            {panels?.map((panel) => (
              <NavigationMobileMenuPanel
                key={`panel-${panel.label}`}
                isOpen={isOpen}
                onOpenNestedMenu={setOpenNestedMenu}
                openNestedMenu={openNestedMenu}
                {...panel}
              />
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
