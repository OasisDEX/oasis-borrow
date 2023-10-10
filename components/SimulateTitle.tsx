import { Icon } from '@makerdao/dai-ui-icons'
import type BigNumber from 'bignumber.js'
import { getTokenGuarded } from 'blockchain/tokensMetadata'
import { GenericTokenIcon } from 'components/GenericTokenIcon'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import React from 'react'
import { Box, Flex, Heading, Text } from 'theme-ui'

interface SimulateTitleProps {
  token: string
  tokenSymbol?: string
  depositAmount?: BigNumber
}

export function SimulateTitle({ token, tokenSymbol, depositAmount }: SimulateTitleProps) {
  const tokenConfig = getTokenGuarded(token)

  return (
    <Flex
      sx={{
        flexDirection: ['column', null, 'row'],
        px: [3, null, '24px'],
        py: '24px',
        borderBottom: 'lightMuted',
        alignItems: 'center',
      }}
    >
      {tokenConfig ? (
        <Icon
          name={tokenConfig.iconCircle}
          size="64px"
          sx={{
            verticalAlign: 'text-bottom',
            mr: 3,
          }}
        />
      ) : (
        <GenericTokenIcon size={64} symbol={token} sx={{ mr: 3 }} />
      )}
      <Box>
        <Heading
          as="h3"
          variant="heading3"
          sx={{
            fontWeight: 'normal',
            fontSize: '32px',
            color: 'primary100',
          }}
        >
          {`${formatCryptoBalance(depositAmount || zero)} ${tokenSymbol || token}`}
        </Heading>
        <Text
          variant="paragraph3"
          color="neutral80"
          sx={{
            fontWeight: 'semiBold',
          }}
        >
          {`In this position`}
        </Text>
      </Box>
    </Flex>
  )
}
