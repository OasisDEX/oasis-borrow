import { type NetworkNames, networksByName } from 'blockchain/networks'
import { getToken } from 'blockchain/tokensMetadata'
import { tokensBySymbol } from 'blockchain/tokensMetadata.constants'
import { GenericTokenIcon } from 'components/GenericTokenIcon'
import { Icon } from 'components/Icon'
import React from 'react'
import type { ThemeUIStyleObject } from 'theme-ui'
import { Flex, Image } from 'theme-ui'

interface TokensGroupProps {
  forceSize?: number
  network?: NetworkNames
  sx?: ThemeUIStyleObject
  tokens: string[]
}

export function TokensGroup({ forceSize, network, sx, tokens }: TokensGroupProps) {
  const defaultSingleSize = 44
  const defaultMultipleSize = 30
  const networkSize = forceSize ?? (tokens.length > 1 ? defaultSingleSize : defaultMultipleSize)

  return (
    <Flex sx={{ alignItems: 'center', position: 'relative', zIndex: 0, ...sx }}>
      <Flex
        as="ul"
        sx={{
          m: 0,
          p: 0,
          listStyle: 'none',
          ...(network && {
            pr: `${networkSize * 0.1}px`,
          }),
        }}
      >
        {tokens.map((token, i) => (
          <Flex
            key={i}
            as="li"
            sx={{
              position: 'relative',
              mr: `-${Math.ceil(forceSize || defaultMultipleSize) * 0.55}px`,
              zIndex: tokens.length - i,
              '&:last-child': { mr: 0 },
            }}
          >
            {Object.keys(tokensBySymbol).includes(token) ? (
              <Icon
                size={forceSize || (tokens.length > 1 ? defaultMultipleSize : defaultSingleSize)}
                key={getToken(token).name}
                icon={getToken(token).iconCircle}
                sx={{
                  verticalAlign: 'bottom',
                  my: tokens.length === 1 ? (forceSize ? 0 : '-4px') : 0,
                }}
              />
            ) : (
              <GenericTokenIcon
                key={token}
                size={forceSize || (tokens.length > 1 ? defaultMultipleSize : defaultSingleSize)}
                symbol={token}
              />
            )}
          </Flex>
        ))}
      </Flex>
      {network && (
        <Image
          src={networksByName[network].icon}
          alt={networksByName[network].label}
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: `${networkSize * 0.45}px`,
            height: `${networkSize * 0.45}px`,
            zIndex: 2,
          }}
        />
      )}
    </Flex>
  )
}
