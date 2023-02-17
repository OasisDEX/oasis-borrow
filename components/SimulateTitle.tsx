import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import React from 'react'
import { Box, Flex, Heading, Text } from 'theme-ui'

interface SimulateTitleProps {
  token?: string
  depositAmount?: BigNumber
}

export function SimulateTitle({ token = 'ETH', depositAmount }: SimulateTitleProps) {
  const { iconCircle } = getToken(token)

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
      <Icon
        name={iconCircle}
        size="64px"
        sx={{
          verticalAlign: 'text-bottom',
          mr: 3,
        }}
      />
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
          {`${formatCryptoBalance(depositAmount || zero)} ${token}`}
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
