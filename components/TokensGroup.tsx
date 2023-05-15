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
