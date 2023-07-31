import { Icon } from '@makerdao/dai-ui-icons'
import { getToken, tokensBySymbol } from 'blockchain/tokensMetadata'
import { GenericTokenIcon } from 'components/GenericTokenIcon'
import React from 'react'
import { Flex, SxStyleProp } from 'theme-ui'

interface TokensGroupProps {
  forceSize?: number
  sx?: SxStyleProp
  tokens: string[]
}

export function TokensGroup({ forceSize, sx, tokens }: TokensGroupProps) {
  const defaultSingleSize = 44
  const defaultMultipleSize = 30

  return (
    <Flex sx={{ alignItems: 'center', position: 'relative', zIndex: 0, ...sx }}>
      <Flex as="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
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
                name={getToken(token).iconCircle}
                sx={{
                  verticalAlign: 'bottom',
                  my: tokens.length === 1 ? (forceSize ? 0 : '-4px') : 0,
                }}
              />
            ) : (
              <GenericTokenIcon
                size={forceSize || (tokens.length > 1 ? defaultMultipleSize : defaultSingleSize)}
                symbol={token}
              />
            )}
          </Flex>
        ))}
      </Flex>
    </Flex>
  )
}
