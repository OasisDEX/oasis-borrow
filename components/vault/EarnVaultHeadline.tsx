import { Icon } from '@makerdao/dai-ui-icons'
import { Heading } from '@theme-ui/components'
import React from 'react'
import { Flex } from 'theme-ui'

import { getToken } from '../../blockchain/tokensMetadata'
import { HeadlineDetailsProp, VaultHeadlineDetails } from './VaultHeadline'

export interface EarnVaultHeadlineProps {
  header: string
  token: string
  details: HeadlineDetailsProp[]
}
export function EarnVaultHeadline({ header, token, details }: EarnVaultHeadlineProps) {
  const { iconCircle } = getToken(token)

  return (
    <Flex
      sx={{
        flexDirection: ['column', null, null, 'row'],
        justifyContent: 'space-between',
        alignItems: ['flex-start', null, null, 'flex-end'],
        mb: 4,
      }}
    >
      <Heading
        as="h1"
        variant="heading1"
        sx={{
          fontWeight: 'semiBold',
          fontSize: '28px',
          color: 'primary100',
        }}
      >
        <Icon name={iconCircle} size="32px" sx={{ verticalAlign: 'text-bottom', mr: 2 }} />
        {header}
      </Heading>
      <Flex
        sx={{
          mt: ['24px', null, null, 0],
          flexDirection: ['column', 'row'],
        }}
      >
        {details.map((details) => (
          <VaultHeadlineDetails {...details} key={details.label} />
        ))}
      </Flex>
    </Flex>
  )
}
