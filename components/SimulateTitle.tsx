import type BigNumber from 'bignumber.js'
import { getTokenGuarded } from 'blockchain/tokensMetadata'
import { GenericTokenIcon } from 'components/GenericTokenIcon'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Heading, Text } from 'theme-ui'

import { Icon } from './Icon'

interface SimulateTitleProps {
  token: string
  tokenSymbol?: string
  depositAmount?: BigNumber
  description?: string
}

export function SimulateTitle({
  token,
  tokenSymbol,
  depositAmount,
  description,
}: SimulateTitleProps) {
  const tokenConfig = getTokenGuarded(token)
  const { t } = useTranslation()

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
          icon={tokenConfig.iconCircle}
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
          {description || t('in-this-position')}
        </Text>
      </Box>
    </Flex>
  )
}
