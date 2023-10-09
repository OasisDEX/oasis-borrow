import { Icon } from 'components/Icon'
import { TokensGroup } from 'components/TokensGroup'
import React from 'react'
import { Flex, Image } from 'theme-ui'

import type { NavigationMenuPanelIcon } from './Navigation.types'

export type NavigationMenuDropdownContentIconProps = NavigationMenuPanelIcon

export function NavigationMenuDropdownContentIcon({
  icon,
  image,
  position,
  tokens,
}: NavigationMenuDropdownContentIconProps) {
  const isGlobal = position === 'global'

  return (
    <Flex
      sx={{
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        width: isGlobal ? '40px' : '32px',
        height: isGlobal ? '40px' : '32px',
      }}
    >
      {icon && (
        <Flex
          className="nav-icon"
          sx={{
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            width: '34px',
            height: '34px',
            borderRadius: 'ellipse',
            color: 'neutral80',
            backgroundColor: 'neutral30',
            transition: '200ms color, 200ms background-color',
          }}
        >
          <Icon icon={icon} size={20} />
        </Flex>
      )}
      {image && <Image src={image} width={26} />}
      {tokens && (
        <TokensGroup tokens={tokens} forceSize={isGlobal && tokens.length === 1 ? 40 : 30} />
      )}
    </Flex>
  )
}
