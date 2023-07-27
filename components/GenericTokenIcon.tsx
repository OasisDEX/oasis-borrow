import Avatar from 'boring-avatars'
import React from 'react'
import { Flex, SxStyleProp, Text } from 'theme-ui'

interface GenericTokenIconProps {
  size: number
  sx?: SxStyleProp
  symbol: string
}

export function GenericTokenIcon({ size, sx, symbol }: GenericTokenIconProps) {
  const innerSize = size * 0.8125

  return (
    <Flex
      sx={{
        position: 'relative',
        alignContent: 'center',
        alignItems: 'center',
        width: size,
        height: size,
        ...sx,
      }}
    >
      <Avatar
        size={innerSize}
        name={symbol}
        variant="marble"
        colors={['#6FD9FF', '#F2FCFF', '#FFE7D8', '#FBB677']}
      />
      <Text
        as="span"
        sx={{
          width: `${innerSize}px`,
          position: 'absolute',
          fontSize: 2,
          color: 'primary100',
          textAlign: 'center',
          fontWeight: 'semiBold',
          lineHeight: `${innerSize}px`,
        }}
      >
        ?
      </Text>
    </Flex>
  )
}
