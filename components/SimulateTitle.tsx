import type BigNumber from 'bignumber.js'
import { getTokenGuarded } from 'blockchain/tokensMetadata'
import { GenericTokenIcon } from 'components/GenericTokenIcon'
import { Skeleton } from 'components/Skeleton'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Text } from 'theme-ui'

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
        <Flex as="h3" variant="text.header3" sx={{ alignItems: 'center', columnGap: 2, py: 1 }}>
          {depositAmount ? (
            formatCryptoBalance(depositAmount)
          ) : (
            <Skeleton width="100px" height="28px" />
          )}{' '}
          {tokenSymbol ?? token}
        </Flex>
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
