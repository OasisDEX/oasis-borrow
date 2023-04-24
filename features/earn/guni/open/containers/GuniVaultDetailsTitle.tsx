import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { formatCryptoBalance } from 'helpers/formatters/format'
import React from 'react'
import { Box, Flex, Heading, Text } from 'theme-ui'

interface GuniVaultDetailsTitleProps {
  token: string
  depositAmount: BigNumber
}

export function GuniVaultDetailsTitle({ token, depositAmount }: GuniVaultDetailsTitleProps) {
  const { iconCircle } = getToken(token)

  return (
    <Flex
      sx={{
        flexDirection: ['column', null, 'row'],
        px: [3, null, '24px'],
        py: '24px',
        borderBottom: 'lightMuted',
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
            fontWeight: 'semiBold',
            fontSize: '28px',
            color: 'primary100',
          }}
        >
          {`${formatCryptoBalance(depositAmount)} DAI`}
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
