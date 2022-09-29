import { Icon } from '@makerdao/dai-ui-icons'
import { Heading } from '@theme-ui/components'
import { getTokens } from 'blockchain/tokensMetadata'
import { AppSpinner } from 'helpers/AppSpinner'
import React from 'react'
import { Flex } from 'theme-ui'

import { HeadlineDetailsProp, VaultHeadlineDetails } from './VaultHeadlineDetails'

export type VaultHeadlineProps = {
  header: string
  token: string[]
  details: HeadlineDetailsProp[]
  loading?: boolean
}

export function VaultHeadline({ header, token, details, loading = false }: VaultHeadlineProps) {
  const tokenData = getTokens(token)
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
        {tokenData instanceof Array &&
          tokenData.map(({ iconCircle }, iconIndex) => (
            <Icon
              key={`VaultHeadlineIcon_${iconCircle}`}
              name={iconCircle}
              size="32px"
              sx={{
                verticalAlign: 'text-bottom',
                position: 'relative',
                zIndex: tokenData.length - iconIndex,
                mr: tokenData.length - 1 === iconIndex ? 2 : -16,
              }}
            />
          ))}
        {header}
      </Heading>
      <Flex
        sx={{
          mt: ['24px', null, null, 0],
          flexDirection: ['column', 'row'],
        }}
      >
        {!loading &&
          details.map((detail) => (
            <VaultHeadlineDetails {...detail} key={`VaultHeadlineDetails_${detail.label}`} />
          ))}
        {loading && <AppSpinner variant="styles.spinner.large" />}
      </Flex>
    </Flex>
  )
}
