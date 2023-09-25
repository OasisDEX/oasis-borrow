import { Icon } from '@makerdao/dai-ui-icons'
import type { NavigationMenuPanelIcon } from 'components/navigation/NavigationMenuPanel'
import React from 'react'
import { Flex, Image } from 'theme-ui'

export type NavigationMenuDropdownContentIconProps = NavigationMenuPanelIcon

export function NavigationMenuDropdownContentIcon({
  source,
  // position,
  type,
}: NavigationMenuDropdownContentIconProps) {
  return (
    <Flex
      sx={{
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
      }}
    >
      {/* <Box sx={{ flexShrink: 0, my: '-4px', mr: '12px', ...(image && { p: '3px' }) }}> */}
      {type === 'icon' && <Icon size={30} name={source} />}
      {type === 'image' && <Image src={source} width={26} />}
    </Flex>
  )
}
