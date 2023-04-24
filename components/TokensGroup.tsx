import { Icon } from '@makerdao/dai-ui-icons'
import { getToken } from 'blockchain/tokensMetadata'
import React from 'react'
import { Box, Flex, SxStyleProp } from 'theme-ui'

interface TokensGroupProps {
  sx?: SxStyleProp
  tokens: string[]
}

export function TokensGroup({ sx, tokens }: TokensGroupProps) {
  return (
    <Box sx={{ position: 'relative', zIndex: 0, ...sx }}>
      {/* uncomment if background around tokens is needed */}
      {/* <Flex as="ul" sx={{ position: 'absolute', top: 0, left: 0, m: 0, p: 0, listStyle: 'none' }}>
        {tokens.map(() => (
          <Box
            as="li"
            sx={{
              position: 'relative',
              width: '30px',
              height: '30px',
              mr: '-18px',
              '&:last-child': { mr: 0 },
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '1px',
                right: '1px',
                bottom: '1px',
                left: '1px',
                background: 'red',
                borderRadius: 'ellipse',
              }}
            />
          </Box>
        ))}
      </Flex> */}
      <Flex as="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
        {tokens.map((token, i) => (
          <Box
            key={i}
            as="li"
            sx={{
              position: 'relative',
              mr: '-16px',
              zIndex: tokens.length - i,
              '&:last-child': { mr: 0 },
            }}
          >
            <Icon
              size={tokens.length > 1 ? 30 : 44}
              name={getToken(token).iconCircle}
              sx={{ verticalAlign: 'bottom' }}
            />
          </Box>
        ))}
      </Flex>
    </Box>
  )
}
